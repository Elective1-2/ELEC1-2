const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Middleware working!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});