require('dotenv').config();
const { connectToDatabase } = require('../../lib/db');
const { ObjectId } = require('mongodb');

module.exports = async (req, res) => {
    // Setup CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { id } = req.query;

    try {
        const { db } = await connectToDatabase();
        const urlRecordsCollection = db.collection('url_records');
        const keywordDataCollection = db.collection('keyword_data');

        const urlRecordId = new ObjectId(id);
        const urlRecord = await urlRecordsCollection.findOne({ _id: urlRecordId });
        const keywords = await keywordDataCollection.find({ url_record_id: urlRecordId }).toArray();

        if (!urlRecord) {
            res.status(404).json({ error: 'No results found for this ID' });
            return;
        }

        const record = {
            url: urlRecord.url,
            timestamp: urlRecord.timestamp,
            keywords
        };

        res.status(200).json(record);
    } catch (err) {
        console.error('Error fetching saved results:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
