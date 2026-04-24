console.log('🚀 [app.js] Starting initialization...');

const express = require('express');
console.log('✅ [app.js] Express loaded');

const cors = require('cors');
console.log('✅ [app.js] CORS loaded');

const cookieParser = require('cookie-parser');
console.log('✅ [app.js] Cookie-parser loaded');

const helmet = require('helmet');
console.log('✅ [app.js] Helmet loaded');

const rateLimit = require('express-rate-limit');
console.log('✅ [app.js] Rate-limit loaded');

const path = require('path');
console.log('✅ [app.js] Path loaded');

require('dotenv').config();
console.log('✅ [app.js] Dotenv configured');

console.log('📊 [app.js] Environment variables check:');
console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`  - DB_HOST: ${process.env.DB_HOST ? 'SET ✓' : 'NOT SET ✗'}`);
console.log(`  - DB_USER: ${process.env.DB_USER ? 'SET ✓' : 'NOT SET ✗'}`);
console.log(`  - DB_NAME: ${process.env.DB_NAME ? 'SET ✓' : 'NOT SET ✗'}`);
console.log(`  - PORT: ${process.env.PORT || 'NOT SET (will use 5000)'}`);
console.log(`  - FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);

const router = require('./routes/index.routes');
console.log('✅ [app.js] Routes loaded');

const app = express();
console.log('✅ [app.js] Express app created');

// CRITICAL: CORS must be set up BEFORE any routes
const allowedOrigins = [
  'https://m2b-p2p.com',
  'https://www.m2b-p2p.com',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (server-to-server, mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, false); // Don't throw error, just don't set CORS headers
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // Cache preflight for 24 hours
}));

// Handle OPTIONS preflight for all routes
app.options('*', cors());

// Security middleware - Important: configure AFTER CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate limiting - Remove skipSuccessfulRequests as it can cause issues
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ADD DETAILED LOGGING FOR ALL API REQUESTS
app.use('/api', (req, res, next) => {
  console.log(`📝 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`   Origin: ${req.headers.origin || 'none'}`);
  console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));
  
  // Track response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`   Response Status: ${res.statusCode}`);
    console.log(`   Response Headers:`, JSON.stringify(res.getHeaders(), null, 2));
    return originalSend.call(this, data);
  };
  
  next();
});

// API Routes
app.use('/api', router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin || 'none'
    }
  });
});

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../public_html/.builds/source/repository/frontend/dist');
  
  const fs = require('fs');
  console.log(`📁 Checking frontend path: ${frontendBuildPath}`);
  console.log(`📁 Path exists: ${fs.existsSync(frontendBuildPath)}`);
  
  if (fs.existsSync(frontendBuildPath)) {
    const files = fs.readdirSync(frontendBuildPath);
    console.log(`📁 Files in dist: ${files.join(', ')}`);
    console.log(`📁 index.html exists: ${fs.existsSync(path.join(frontendBuildPath, 'index.html'))}`);
  }
  
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/*splat', (req, res) => {
    res.json({
      name: 'M2B Bus Tracker API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth',
        trips: '/api/trips',
        buses: '/api/buses',
        routes: '/api/admin/routes',
        schedules: '/api/schedules',
        maps: '/api/maps',
        admin: '/api/admin'
      }
    });
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'API route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: '/api/auth',
      trips: '/api/trips',
      buses: '/api/buses',
      routes: '/api/admin/routes',
      schedules: '/api/schedules',
      maps: '/api/maps',
      admin: '/api/admin'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Always set CORS headers in error responses
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry detected' });
  }
  
  res.status(err.status || 500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;