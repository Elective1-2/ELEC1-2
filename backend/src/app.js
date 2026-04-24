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

// CORS configuration - MUST come before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://m2b-p2p.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean); // Remove undefined/null values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Security middleware - configure helmet to work with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

// Rate limiting - simplified
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });
}

// API Routes (must come BEFORE static file serving)
app.use('/api', router);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.join(__dirname, '../../public_html/.builds/source/repository/frontend/dist');
    
    // Add this debug code
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
  // Development mode - just the API root response
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
        maps: '/api/maps',
        admin: '/api/admin'
      }
    });
  });
}

// For development, keep the 404 handler
if (process.env.NODE_ENV !== 'production') {
  // 404 handler - route not found
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl,
      method: req.method
    });
  });
}

// Global error handler (keep this for all environments)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Duplicate entry detected' });
  }
  
  // Default error response
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;