// server.js

require('dotenv').config({ path: './.env' });
const http = require('http');
const https = require('https');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;
const MONGO_URI = process.env.MONGO_URI;

// Function to connect to the database
let db;
async function connectToDatabase() {
    if (db) return { db };
    const client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
    await client.connect();
    db = client.db(); // Use the default database specified in the URI
    console.log('Connected to MongoDB');
    return { db };
}

async function main() {
    const { db } = await connectToDatabase(); // Ensure database connection is established
    const urlRecordsCollection = db.collection("url_records");
    const keywordDataCollection = db.collection("keyword_data");

    const server = http.createServer(async (req, res) => {
        // Setup CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

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

            try {
                let urlRecord = await urlRecordsCollection.findOne({ url: siteUrl });
                let urlRecordId;
                if (!urlRecord) {
                    const result = await urlRecordsCollection.insertOne({ url: siteUrl, timestamp: new Date() });
                    urlRecordId = result.insertedId;
                    console.log('URL saved to MongoDB:', siteUrl);
                } else {
                    urlRecordId = urlRecord._id;
                }

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
                    apiRes.on('data', chunk => { data += chunk; });
                    apiRes.on('end', () => {
                        try {
                            const jsonData = JSON.parse(data);

                            if (apiRes.statusCode !== 200) {
                                res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ error: jsonData.message || 'API Error' }));
                            } else {
                                // Return the analysis data along with urlRecordId
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    url_record_id: urlRecordId,
                                    data: jsonData
                                }));
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
            } catch (err) {
                console.error('Database error while saving URL:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
            }

        } else if (pathname === '/api/save' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });

            req.on('end', async () => {
                console.log('Request body:', body);

                try {
                    const parsedData = JSON.parse(body);
                    console.log('Parsed data:', parsedData);

                    const { url: siteUrl, data: keywords, url_record_id } = parsedData;

                    console.log('url:', siteUrl);
                    console.log('keywords:', keywords);
                    console.log('url_record_id:', url_record_id);

                    if (!siteUrl || !keywords || !url_record_id) {
                        console.error('Invalid data: Missing siteUrl, keywords, or url_record_id');
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid data' }));
                        return;
                    }

                    let urlRecordId;
                    try {
                        urlRecordId = ObjectId(url_record_id);
                        console.log('Converted url_record_id to ObjectId:', urlRecordId);
                    } catch (e) {
                        console.error('Invalid url_record_id:', url_record_id, e);
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid url_record_id' }));
                        return;
                    }

                    // Map and insert keyword data linked to the URL record ID
                    const keywordDocs = keywords.map(item => ({
                        url_record_id: urlRecordId,
                        keyword: item.keyword || item.text || null,
                        volume: item.volume || null,
                        competition_level: item.competition_level || null,
                        competition_index: item.competition_index || null,
                        low_bid: item.low_bid || null,
                        high_bid: item.high_bid || null,
                        trend: item.trend || null
                    }));

                    console.log('Keyword documents to insert:', keywordDocs);

                    if (keywordDocs.length > 0) {
                        await keywordDataCollection.insertMany(keywordDocs);  // Save keyword data
                        console.log('Keyword data inserted successfully');
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, id: urlRecordId }));
                    } else {
                        console.error('No keyword data to save');
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'No keyword data to save' }));
                    }
                } catch (e) {
                    console.error('Error saving data:', e);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Server error while saving data' }));
                }
            });
        } else if (pathname === '/api/saved_urls' && req.method === 'GET') {
            try {
                const results = await urlRecordsCollection.aggregate([
                    {
                        $lookup: {
                            from: "keyword_data",
                            localField: "_id",
                            foreignField: "url_record_id",
                            as: "keywords"
                        }
                    },
                    {
                        $match: {
                            "keywords.0": { $exists: true }  // Only return URLs with keyword data
                        }
                    },
                    { $sort: { timestamp: -1 } }
                ]).toArray();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            } catch (err) {
                console.error('Database error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
            }
        } else if (pathname.startsWith('/api/saved/') && req.method === 'GET') {
            const id = pathname.split('/').pop();

            try {
                const urlRecordId = ObjectId(id);
                const urlRecord = await urlRecordsCollection.findOne({ _id: urlRecordId });
                const keywords = await keywordDataCollection.find({ url_record_id: urlRecordId }).toArray();

                if (!urlRecord) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No results found for this ID' }));
                    return;
                }

                const record = {
                    url: urlRecord.url,
                    timestamp: urlRecord.timestamp,
                    keywords
                };

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(record));
            } catch (err) {
                console.error('Error fetching saved results:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
        }
    });

    server.listen(3001, () => {
        console.log('Server running on http://localhost:3001');
    });
}

main().catch(console.error);
