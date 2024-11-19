require('dotenv').config(); // Load environment variables
const { MongoClient, ServerApiVersion } = require('mongodb');

// Use the MONGO_URI from the .env file
const uri = process.env.MONGO_URI;

// Configure and create MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect(); // Connect to MongoDB
    await client.db("admin").command({ ping: 1 }); // Ping the server to confirm connection
    console.log("Successfully connected to MongoDB!");
  } finally {
    await client.close(); // Close connection after operation
  }
}

run().catch(console.error);