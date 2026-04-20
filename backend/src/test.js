const http = require('http');
const server = http.createServer((req, res) => res.end('OK'));
server.listen(process.env.PORT || 3000, () => console.log('Test server running'));