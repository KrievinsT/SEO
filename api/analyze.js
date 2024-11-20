const express = require('express');
const router = express.Router();
require('dotenv').config();
const https = require('https');
const { connectToDatabase } = require('../lib/db');

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

router.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    const siteUrl = req.query.url;
    if (!siteUrl) {
        res.status(400).json({ error: 'URL parameter is missing' });
        return;
    }

    try {
        const { db } = await connectToDatabase();
        const urlRecordsCollection = db.collection('url_records');

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
                'x-rapidapi-host': API_HOST,
            },
        };

        https.get(apiUrl, options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);

                    if (apiRes.statusCode !== 200) {
                        res.status(apiRes.statusCode).json({ error: jsonData.message || 'API Error' });
                    } else {
                        res.status(200).json(jsonData);
                    }
                } catch (e) {
                    res.status(500).json({ error: 'Failed to parse API response' });
                }
            });
        }).on('error', (error) => {
            console.error('API request error:', error);
            res.status(500).json({ error: 'Failed to fetch data from API', details: error.message });
        });
    } catch (err) {
        console.error('Database error while saving URL:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
