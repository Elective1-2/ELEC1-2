console.log('🚀 [app.js] Starting initialization...');

const express = require('express');


const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Environment checks
console.log('📊 [app.js] Environment variables check:');
console.log(`  - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`  - DB_HOST: ${process.env.DB_HOST ? 'SET ✓' : 'NOT SET ✗'}`);
console.log(`  - DB_NAME: ${process.env.DB_NAME ? 'SET ✓' : 'NOT SET ✗'}`);

const app = express();
console.log('✅ [app.js] Express app created');
// CATCH EVERY SINGLE REQUEST - TOP OF MIDDLEWARE STACK
app.use((req, res, next) => {
    console.log(`🔥 [EXPRESS ENTRY] ${req.method} ${req.url}`);
    next();
});

// 1. Trust proxy (MUST be first)
app.set('trust proxy', 1);

// 2. Security middleware
app.use(helmet());

// 3. CORS (before rate limiting) - FIXED
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://www.m2b-p2p.com',
        'https://m2b-p2p.com',
        process.env.FRONTEND_URL // Keep this for flexibility
    ].filter(Boolean), // Remove undefined/null values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// 4. Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 5. Rate limiting (after CORS)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
    skipSuccessfulRequests: true,
});
app.use('/api/', limiter);

// 6. Debug middleware (optional)
app.use((req, res, next) => {
    console.log(`🔍 Request: ${req.method} ${req.url}`);
    next();
});

// 7. Routes
const router = require('./routes/index.routes');
console.log('✅ [app.js] Routes loaded');
app.use('/api', router);

// 8. Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/debug/env', (req, res) => {
    res.json({
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        PORT: process.env.PORT,
        cwd: process.cwd(),
        __dirname: __dirname,
    });
});

// 9. Frontend serving (production only)
if (process.env.NODE_ENV === 'production') {
    const frontendBuildPath = path.join(__dirname, '../../public_html/.builds/source/repository/frontend/dist');
    
    const fs = require('fs');
    console.log(`📁 Frontend path: ${frontendBuildPath}`);
    console.log(`📁 Path exists: ${fs.existsSync(frontendBuildPath)}`);
    
    if (fs.existsSync(frontendBuildPath)) {
        // Serve static files
        app.use(express.static(frontendBuildPath));
        
        // Handle client-side routing
        app.get('/*splat', (req, res, next) => {
            // Skip API and health routes
            if (req.path.startsWith('/api/') || req.path === '/health') {
                return next();
            }
            
            // Skip asset requests - let them 404 properly
            if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|json)$/i.test(req.path)) {
                return res.status(404).send('Not found');
            }
            
            // Serve index.html for all other routes
            res.sendFile(path.join(frontendBuildPath, 'index.html'));
        });
        
        console.log('✅ Static serving configured');
    } else {
        console.error('❌ Frontend directory not found:', frontendBuildPath);
    }
}

// 10. 404 handler (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res) => {
        res.status(404).json({
            error: 'Route not found',
            path: req.originalUrl,
            method: req.method
        });
    });
}

// 11. Global error handler (ALWAYS last)
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Duplicate entry detected' });
    }
    
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;