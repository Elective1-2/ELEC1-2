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
console.log(`  - PORT: ${process.env.PORT ? process.env.PORT : 'NOT SET BY HOSTINGER - THIS WILL CAUSE A CRASH'}`);

const router = require('./routes/index.routes');
console.log('✅ [app.js] Routes loaded');

const app = express();
console.log('✅ [app.js] Express app created');

app.set('trust proxy', 1);  // Trust the first proxy

// Security middleware
app.use(helmet());

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  skipSuccessfulRequests: true, // Don't count successful requests against limit
});
app.use('/api/', limiter);

// CORS configuration - UPDATE for production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
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
    app.get('/*splat', (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }else {
  // Development mode - just the API root response
  app.get('/', (req, res) => {
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

// Note: The 404 handler and error handler below should ONLY apply to API routes
// But since we're serving React for all non-API routes in production,
// we need to move them inside the development conditional

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