const express = require('express');
const router = express.Router();
require('dotenv').config();
const { connectToDatabase } = require('../../lib/db');
const { ObjectId } = require('mongodb');

router.get('/:id', async (req, res) => {
    const { id } = req.params;

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

        res.status(200).json({
            url: urlRecord.url,
            timestamp: urlRecord.timestamp,
            keywords,
        });
    } catch (err) {
        console.error('Error fetching saved results:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
