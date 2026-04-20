const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // ADD THIS LINE
require('dotenv').config();

const router = require('./routes/index.routes');

const app = express();

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

// ===== ADD THIS SECTION: Serve React Frontend =====
// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build folder
  // Path: backend/src/../frontend/dist (since frontend builds to 'dist' with Vite)
  const frontendBuildPath = path.join(__dirname, '../../public_html/.builds/source/repository/frontend/dist');
  
  console.log(`📁 Serving frontend from: ${frontendBuildPath}`);
  
  // Serve static assets
  app.use(express.static(frontendBuildPath));
  
  // For any route not starting with /api or /health, serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
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