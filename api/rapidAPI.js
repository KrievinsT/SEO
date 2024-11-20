const express = require('express');
const router = express.Router();
require('dotenv').config();
const https = require('https');

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = process.env.RAPIDAPI_HOST;

router.get('/', (req, res) => {
    // Setup CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const siteUrl = req.query.url;
    if (!siteUrl) {
        res.status(400).json({ error: 'URL parameter is missing' });
        return;
    }

    // Construct the RapidAPI URL
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
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse API response' });
            }
        });
    }).on('error', (error) => {
        console.error('Error making API request:', error);
        res.status(500).json({ error: 'Failed to fetch data from RapidAPI', details: error.message });
    });
});

module.exports = router;
