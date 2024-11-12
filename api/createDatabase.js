require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');

// MongoDB configuration
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

async function setupDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB.");

        const db = client.db("seo"); // Use the 'seo' database
        const urlRecordsCollection = db.collection("url_records");
        const keywordDataCollection = db.collection("keyword_data");

        console.log('Database and collections are ready.');

        // Insert sample data or any other setup logic if needed
        // For example, you might want to index certain fields:
        await urlRecordsCollection.createIndex({ url: 1 }, { unique: true });
        console.log('Indexes set up if needed.');

    } catch (error) {
        console.error("Error setting up MongoDB:", error);
    } finally {
        // Close the MongoDB client connection
        await client.close();
        console.log("Connection to MongoDB closed.");
    }
}

// Run the setup
setupDatabase().catch(console.error);
