const http = require('http');
const https = require('https');
const url = require('url');
const PORT = 3000;

const API_KEY = '863f996b17msh702f87465d3cdfap1e3ad1jsn444217e2a189';
const API_HOST = 'google-keyword-insight1.p.rapidapi.com';

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

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
