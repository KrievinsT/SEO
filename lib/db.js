require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGO_URI;

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && cachedClient) {
        return { client: cachedClient, db: cachedDb };
    }
    const client = await MongoClient.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db('seo'); // Use the 'seo' database
    cachedClient = client;
    cachedDb = db;
    return { client, db };
}

module.exports = { connectToDatabase };
