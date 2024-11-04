const mysql = require('mysql');

// Create connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '' 
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server.');

    // Create database if not existing
    connection.query('CREATE DATABASE IF NOT EXISTS SEO', (err, result) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database created or already exists.');

        // Select database
        connection.query('USE SEO', (err, result) => {
            if (err) {
                console.error('Error selecting database:', err);
                return;
            }
            console.log('Using database SEO.');

            // Create table if not existing
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS url_records (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    url VARCHAR(255) NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;
            connection.query(createTableQuery, (err, result) => {
                if (err) {
                    console.error('Error creating table:', err);
                    return;
                }
                console.log('Table created or already exists.');
            });

            // Close the connection
            connection.end(err => {
                if (err) {
                    console.error('Error closing connection:', err);
                } else {
                    console.log('Connection closed.');
                }
            });
        });
    });
});
