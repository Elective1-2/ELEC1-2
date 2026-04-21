// test.js - Database connection tester
const mysql = require('mysql2');

console.log('🔍 Starting database connection test...');
console.log('📊 Environment variables check:');
console.log(`  - DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
console.log(`  - DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
console.log(`  - DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
console.log(`  - DB_PASSWORD: ${process.env.DB_PASSWORD ? 'SET ✓' : 'NOT SET ✗'}`);

// Test database connection
console.log('\n🔌 Attempting to connect to database...');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10000
});

connection.connect((err) => {
    if (err) {
        console.error('❌ DATABASE CONNECTION FAILED:');
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        console.error('Full error:', err);
        
        // Provide helpful suggestions
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 SUGGESTION: Check your DB_USER and DB_PASSWORD');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 SUGGESTION: Database name is incorrect or doesn\'t exist');
        } else if (err.code === 'ENOTFOUND') {
            console.error('💡 SUGGESTION: DB_HOST is incorrect. Try using "localhost"');
        } else if (err.code === 'ETIMEDOUT') {
            console.error('💡 SUGGESTION: Network timeout - check if DB_HOST is accessible');
        }
        
        process.exit(1);
    }
    
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY!');
    
    // Test a simple query
    console.log('\n📋 Running test query...');
    connection.query('SELECT 1 as test', (queryErr, results) => {
        if (queryErr) {
            console.error('❌ Test query failed:', queryErr.message);
        } else {
            console.log('✅ Test query successful:', results);
        }
        
        // Try to list tables
        console.log('\n📁 Fetching tables...');
        connection.query('SHOW TABLES', (tableErr, tables) => {
            if (tableErr) {
                console.error('❌ Could not fetch tables:', tableErr.message);
            } else {
                console.log(`✅ Found ${tables.length} tables:`);
                tables.forEach(table => {
                    console.log(`   - ${Object.values(table)[0]}`);
                });
            }
            
            connection.end();
            console.log('\n🏁 Database test complete!');
        });
    });
});