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
    console.error("❌ FATAL ERROR: process.env.PORT is not defined. The server cannot start.");
    process.exit(1);
}

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ [5] Server is running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

server.on('error', (err) => {
    console.error(`❌ [ERROR] Server failed: ${err.message}`);
    console.error(`Error code: ${err.code}`);
});