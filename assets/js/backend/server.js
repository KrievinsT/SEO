const http = require('http');
const mysql = require('mysql');
const PORT = 3001;

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'seo'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

const server = http.createServer((req, res) => {
    // Setup CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/submit-url') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedData = JSON.parse(body);
                const url = parsedData.url;

                if (!url) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'URL is required' }));
                } else {
                    // Insert URL into the database
                    const query = 'INSERT INTO url_records (url, timestamp) VALUES (?, NOW())';
                    db.query(query, [url], (err, result) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                    });
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Invalid JSON', error: e.toString() }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
