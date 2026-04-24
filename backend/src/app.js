console.log('🚀 [app.js] Starting initialization...');

// WRAP EVERYTHING in try-catch to find the crash
try {
  console.log('🔄 [app.js] Loading Express...');
  const express = require('express');
  console.log('✅ [app.js] Express loaded');

  console.log('🔄 [app.js] Loading CORS...');
  const cors = require('cors');
  console.log('✅ [app.js] CORS loaded');

  console.log('🔄 [app.js] Loading cookie-parser...');
  const cookieParser = require('cookie-parser');
  console.log('✅ [app.js] Cookie-parser loaded');

  console.log('🔄 [app.js] Loading helmet...');
  const helmet = require('helmet');
  console.log('✅ [app.js] Helmet loaded');

  console.log('🔄 [app.js] Loading rate-limit...');
  const rateLimit = require('express-rate-limit');
  console.log('✅ [app.js] Rate-limit loaded');

  console.log('🔄 [app.js] Loading path...');
  const path = require('path');
  console.log('✅ [app.js] Path loaded');

  console.log('🔄 [app.js] Loading dotenv...');
  require('dotenv').config();
  console.log('✅ [app.js] Dotenv configured');

  console.log('📊 [app.js] Environment variables check:');
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
  console.log(`  - DB_HOST: ${process.env.DB_HOST ? 'SET ✓' : 'NOT SET ✗'}`);
  console.log(`  - DB_USER: ${process.env.DB_USER ? 'SET ✓' : 'NOT SET ✗'}`);
  console.log(`  - DB_NAME: ${process.env.DB_NAME ? 'SET ✓' : 'NOT SET ✗'}`);
  console.log(`  - PORT: ${process.env.PORT || 'NOT SET (will use 5000)'}`);
  console.log(`  - FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET'}`);

  console.log('🔄 [app.js] Loading routes...');
  const router = require('./routes/index.routes');
  console.log('✅ [app.js] Routes loaded');

  const app = express();
  console.log('✅ [app.js] Express app created');

  // CORS configuration
  const allowedOrigins = [
    'https://m2b-p2p.com',
    'https://www.m2b-p2p.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  console.log('📋 [app.js] Allowed CORS origins:', allowedOrigins);

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
  }));

  app.options('*', cors());

  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // API Routes
  app.use('/api', router);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      frontend_url: process.env.FRONTEND_URL,
      request_origin: req.headers.origin || 'none'
    });
  });

  // Static files in production
  if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.join(__dirname, '../../public_html/.builds/source/repository/frontend/dist');
    
    const fs = require('fs');
    console.log(`📁 Checking frontend path: ${frontendBuildPath}`);
    console.log(`📁 Path exists: ${fs.existsSync(frontendBuildPath)}`);
    
    if (fs.existsSync(frontendBuildPath)) {
      app.use(express.static(frontendBuildPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
      });
    }
  }

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl 
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  console.log('✅ [app.js] App fully configured and exported');
  module.exports = app;
  console.log('✅ [app.js] Module export complete');

} catch (error) {
  console.error('❌❌❌ FATAL ERROR IN app.js ❌❌❌');
  console.error('Error type:', error.constructor.name);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
  console.error('Stack trace:', error.stack);
  
  // Check for common issues
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('💡 SOLUTION: Missing npm package. Run: npm install');
  }
  
  // Create a minimal working app so the server can start
  const express = require('express');
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'degraded',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  });
  
  app.use((req, res) => {
    res.status(500).json({ error: 'Application failed to initialize' });
  });
  
  module.exports = app;
}