const express = require('express');
const router = express.Router();
require('dotenv').config();
const { connectToDatabase } = require('../lib/db');

router.post('/', async (req, res) => {
    // Set up CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    const { url, data: keywords } = req.body;

    // Validate the incoming data
    if (!url || !Array.isArray(keywords) || keywords.length === 0) {
        res.status(400).json({ error: 'Invalid or missing data. Ensure "url" and "data" (keywords array) are provided.' });
        return;
    }

    try {
        const { db } = await connectToDatabase();
        const urlRecordsCollection = db.collection('url_records');
        const keywordDataCollection = db.collection('keyword_data');

        // Check if the URL already exists in the database
        const existingRecord = await urlRecordsCollection.findOne({ url });
        let urlRecordId;

        if (!existingRecord) {
            // Insert a new record if it doesn't exist
            const result = await urlRecordsCollection.insertOne({ url, timestamp: new Date() });
            urlRecordId = result.insertedId;
        } else {
            // Use the existing record's ID
            urlRecordId = existingRecord._id;
        }

        // Prepare keyword documents to insert into the "keyword_data" collection
        const keywordDocs = keywords.map(item => ({
            url_record_id: urlRecordId,
            keyword: item.keyword || item.text || null, // Support both "keyword" and "text" fields
            volume: item.volume || null,
            competition_level: item.competition_level || null,
            competition_index: item.competition_index || null,
            low_bid: item.low_bid || null,
            high_bid: item.high_bid || null,
            trend: item.trend || null
        }));

        if (keywordDocs.length > 0) {
            // Insert keyword data
            await keywordDataCollection.insertMany(keywordDocs);
            res.status(200).json({ success: true, message: 'Data saved successfully', url_record_id: urlRecordId });
        } else {
            res.status(400).json({ error: 'No valid keyword data to save' });
        }
    } catch (error) {
        console.error('Error saving data:', error.message);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

module.exports = router;
