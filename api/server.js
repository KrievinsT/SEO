require('dotenv').config({ path: '../.env' });
const http = require('http');
const https = require('https');
const url = require('url');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB configuration
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

async function main() {
    await client.connect();
    const db = client.db("seo"); // Use the 'seo' database
    const urlRecordsCollection = db.collection("url_records");
    const keywordDataCollection = db.collection("keyword_data");

    const server = http.createServer(async (req, res) => { // Make this an async function
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
                const existingRecord = await urlRecordsCollection.findOne({ url: siteUrl });
                if (!existingRecord) {
                    await urlRecordsCollection.insertOne({ url: siteUrl, timestamp: new Date() });
                    console.log('URL saved to MongoDB:', siteUrl);
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
                            res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(jsonData));
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
                try {
                    const parsedData = JSON.parse(body);
                    const { url: siteUrl, data: keywords } = parsedData;
        
                    if (!siteUrl || !keywords) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid data' }));
                        return;
                    }
        
                    const existingRecord = await urlRecordsCollection.findOne({ url: siteUrl });
                    let urlRecordId;
                    if (!existingRecord) {
                        const urlRecord = await urlRecordsCollection.insertOne({ url: siteUrl, timestamp: new Date() });
                        urlRecordId = urlRecord.insertedId;
                    } else {
                        urlRecordId = existingRecord._id;
                    }
        
                    // Map and insert keyword data linked to the URL record ID
                    const keywordDocs = keywords.map(item => ({
                        url_record_id: urlRecordId,
                        keyword: item.text || item.keyword || null,
                        volume: item.volume || null,
                        competition_level: item.competition_level || null,
                        competition_index: item.competition_index || null,
                        low_bid: item.low_bid || null,
                        high_bid: item.high_bid || null,
                        trend: item.trend || null
                    }));
        
                    if (keywordDocs.length > 0) {
                        await keywordDataCollection.insertMany(keywordDocs);  // Save keyword data
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, id: urlRecordId }));
                    } else {
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
                const urlRecordId = new ObjectId(id);
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
