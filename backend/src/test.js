require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST ? 'SET' : 'NOT SET');

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use('/api/', limiter);

app.get('/', (req, res) => {
    res.json({ message: 'Environment variables loaded!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: process.env.NODE_ENV });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});