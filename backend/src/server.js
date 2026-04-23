console.log('🚀 [1] Starting server.js...');
console.log(`📅 Time: ${new Date().toISOString()}`);
console.log(`📦 Node version: ${process.version}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

console.log('📦 [2] Loading app.js...');
let app;
try {
    app = require('./app');
    console.log('✅ [3] app.js loaded successfully');
} catch (err) {
    console.error('❌ Failed to load app.js:', err);
    process.exit(1);
}

const PORT = process.env.PORT || 5000;
console.log(`🔌 [4] Attempting to listen on port ${PORT}`);

// Add uncaught exception handlers
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    console.error('Stack trace:', err.stack);
    // Don't exit immediately to allow logging
    setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ [5] Server is running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
    console.error(`❌ [ERROR] Server failed: ${err.message}`);
    console.error(`Error code: ${err.code}`);
    console.error(`Full error:`, err);
    
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
});

// Test database connection if you have a db module
setTimeout(() => {
    console.log('🏥 Checking if server is still alive...');
    // You could make a self-health check here
}, 5000);