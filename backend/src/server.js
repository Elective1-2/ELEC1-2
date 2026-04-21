//! Won't delete this abomination of a debugging console logs
// CATCH ALL UNHANDLED ERRORS
process.on('uncaughtException', (err) => {
    console.error('🔥 UNCAUGHT EXCEPTION:', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 UNHANDLED REJECTION:', reason);
    process.exit(1);
});

console.log('🚀 [1] Starting server.js...');
console.log(`📅 Time: ${new Date().toISOString()}`);
console.log(`📦 Node version: ${process.version}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

console.log('📦 [2] Loading app.js...');
const app = require('./app');
console.log('✅ [3] app.js loaded successfully');

const PORT = process.env.PORT;
console.log(`🔌 [4] Attempting to listen on port ${PORT}`);

if (!PORT) {
    console.error("❌ FATAL ERROR: process.env.PORT is not defined.");
    process.exit(1);
}

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ [5] Server is running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 CORS allowed origins: localhost:5173, localhost:3000, m2b-p2p.com, www.m2b-p2p.com`);
});

server.on('error', (err) => {
    console.error(`❌ [ERROR] Server failed: ${err.message}`);
    console.error(`Error code: ${err.code}`);
});