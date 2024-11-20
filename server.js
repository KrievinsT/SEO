const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./lib/db'); // Ensure this file exists and is correct
dotenv.config();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files for frontend (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/saved', require('./api/saved/[id]')); 
app.use('/api/analyze', require('./api/analyze')); 
app.use('/api/rapidAPI', require('./api/rapidAPI'));
app.use('/api/save', require('./api/save'));
app.use('/api/saved_urls', require('./api/saved_urls'));

// Root route for serving the frontend (if applicable)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const status = db ? 'Database connected' : 'Database not connected';
        res.status(200).json({ status: 'API is running!', database: status });
    } catch (error) {
        res.status(500).json({ status: 'API is running!', database: 'Error connecting to database' });
    }
});

// 404 fallback for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Export the Express app as a Vercel serverless function
module.exports = app;
