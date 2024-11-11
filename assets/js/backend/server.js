const http = require('http');
const https = require('https');
const url = require('url');
const mysql = require('mysql');
const PORT = 3001;

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'SEO'
};

// Create a MySQL connection pool
const db = mysql.createPool(dbConfig);

const API_KEY = 'c75fe1866bmsh89afaafeae43df3p1b11bdjsnd7eca604426b'; 
const API_HOST = 'google-keyword-insight1.p.rapidapi.com';

const server = http.createServer((req, res) => {
    // Setup CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Parse the request URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname.replace(/\/+$/, ''); // Remove trailing slashes

    console.log(`Received request: ${req.method} ${pathname}`);

    if (pathname === '/api/analyze' && req.method === 'GET') {
        const siteUrl = parsedUrl.query.url;
        if (!siteUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'URL parameter is missing' }));
            return;
        }

        // Make API request
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
                        // Send data back to client without saving to database
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

    } else if (pathname === '/api/save' && req.method === 'POST') {
        // Handle saving results
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedData = JSON.parse(body);
                const { url: siteUrl, data: keywords } = parsedData;

                if (!siteUrl || !keywords) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid data' }));
                    return;
                }

                // Insert URL into url_records table
                const insertUrlQuery = 'INSERT INTO url_records (url) VALUES (?)';
                db.query(insertUrlQuery, [siteUrl], (err, result) => {
                    if (err) {
                        console.error('Database error:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Database error' }));
                        return;
                    }

                    const urlRecordId = result.insertId;

                    // Prepare keyword data for insertion
                    const keywordValues = keywords.map(item => [
                        urlRecordId,
                        item.text || item.keyword || null,
                        item.volume || null,
                        item.competition_level || null,
                        item.competition_index || null,
                        item.low_bid || null,
                        item.high_bid || null,
                        item.trend || null
                    ]);

                    if (keywordValues.length > 0) {
                        const insertKeywordsQuery = `
                            INSERT INTO keyword_data (
                                url_record_id,
                                keyword,
                                volume,
                                competition_level,
                                competition_index,
                                low_bid,
                                high_bid,
                                trend
                            ) VALUES ?
                        `;

                        db.query(insertKeywordsQuery, [keywordValues], (err, result) => {
                            if (err) {
                                console.error('Database error:', err);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: 'Database error' }));
                                return;
                            }

                            // Send success response
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true }));
                        });
                    } else {
                        // No keywords to insert
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'No keyword data to save' }));
                    }
                });
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON data' }));
            }
        });

    } else if (pathname === '/api/saved_urls' && req.method === 'GET') {
        // Fetch saved URLs
        const query = `
            SELECT id, url
            FROM url_records
            ORDER BY timestamp DESC
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });

    } else if (pathname.startsWith('/api/saved/') && req.method === 'GET') {
        // Fetch saved results for a specific URL ID
        const id = pathname.split('/').pop();

        const query = `
            SELECT ur.url, ur.timestamp, kd.keyword, kd.volume, kd.competition_level, kd.competition_index, kd.low_bid, kd.high_bid, kd.trend
            FROM url_records ur
            JOIN keyword_data kd ON ur.id = kd.url_record_id
            WHERE ur.id = ?
        `;

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }

            if (results.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'No results found for this ID' }));
                return;
            }

            // Organize data
            const record = {
                url: results[0].url,
                timestamp: results[0].timestamp,
                keywords: results.map(row => ({
                    keyword: row.keyword,
                    volume: row.volume,
                    competition_level: row.competition_level,
                    competition_index: row.competition_index,
                    low_bid: row.low_bid,
                    high_bid: row.high_bid,
                    trend: row.trend
                }))
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(record));
        });

    } else {
        // Handle not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
