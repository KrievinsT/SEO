const http = require('http');
const https = require('https');
const mysql = require('mysql');
const url = require('url');
const PORT = 3001; // Port for the server

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'seo'
};

// Connect to MySQL Database
const db = mysql.createConnection(dbConfig);
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        // Implement reconnection logic if necessary
        return;
    }
    console.log('Connected to the database.');
});
const API_KEY = '863f996b17msh702f87465d3cdfap1e3ad1jsn444217e2a189';
const API_HOST = 'google-keyword-insight1.p.rapidapi.com';

// HTTP Server creation
const server = http.createServer((req, res) => {
    // Setup CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-rapidapi-key, x-rapidapi-host');

    // Handle preflight requests for CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const reqUrl = url.parse(req.url, true);

    // Route to fetch SEO data
    if (reqUrl.pathname === '/api/analyze' && req.method === 'GET') {
        handleSEORequest(req, res, reqUrl);
    // Route to submit URLs to the database
    } else if (req.method === 'POST' && req.url === '/submit-url') {
        handleDatabaseInsert(req, res);
    } else {
        // Handle not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

// Function to handle SEO data fetching
function handleSEORequest(req, res, reqUrl) {
    const siteUrl = reqUrl.query.url;
    if (!siteUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'URL parameter is missing' }));
        return;
    }

    const apiUrl = `https://${API_HOST}/analyze?target=${encodeURIComponent(siteUrl)}`;
    const options = {
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
        }
    };

    https.get(apiUrl, options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => {
            data += chunk;
        });
        apiRes.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(jsonData));
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to parse API response' }));
            }
        });
    }).on('error', error => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to fetch data from API', details: error.message }));
    });
}

// Function to handle database insertion
function handleDatabaseInsert(req, res) {
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
                return;
            }

            const query = 'INSERT INTO url_records (url, timestamp) VALUES (?, NOW())';
            db.query(query, [url], (err, result) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Database error', error: err.toString() }));
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'URL submitted successfully' }));
            });
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Invalid JSON', error: e.toString() }));
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
