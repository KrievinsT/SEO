// api/save.js

require('dotenv').config();
const { connectToDatabase } = require('../lib/db');

module.exports = async (req, res) => {
    // Setup CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });

    req.on('end', async () => {
        try {
            const parsedData = JSON.parse(body);
            const { url: siteUrl, data: keywords } = parsedData;

            if (!siteUrl || !keywords) {
                res.status(400).json({ error: 'Invalid data' });
                return;
            }

            const { db } = await connectToDatabase();
            const urlRecordsCollection = db.collection('url_records');
            const keywordDataCollection = db.collection('keyword_data');

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
                res.status(200).json({ success: true, id: urlRecordId });
            } else {
                res.status(400).json({ error: 'No keyword data to save' });
            }
        } catch (e) {
            console.error('Error saving data:', e);
            res.status(500).json({ error: 'Server error while saving data' });
        }
    });
};
