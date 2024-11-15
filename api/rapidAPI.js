require('dotenv').config({ path: '../.env' });
const http = require('http');
const https = require('https');
const url = require('url');

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

const server = http.createServer((req, res) => {
    // Setup CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Parse the request URL
    const reqUrl = url.parse(req.url, true);

    if (reqUrl.pathname === '/api/analyze' && req.method === 'GET') {
        const siteUrl = reqUrl.query.url;
        if (!siteUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'URL parameter is missing' }));
            return;
        }

        // Construct the API URL
        const apiUrl = `https://${API_HOST}/globalurl/?url=${encodeURIComponent(siteUrl)}&lang=en`;

        const options = {
            method: 'GET',
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

                    if (apiRes.statusCode !== 200) {
                        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: jsonData.message || 'API Error' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(jsonData));
                    }
                } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to parse API response' }));
                }
            });
        }).on('error', error => {
            console.error('API request error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch data from API', details: error.message }));
        });

    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

// Start the server (for local testing only; not needed in Vercel)
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
