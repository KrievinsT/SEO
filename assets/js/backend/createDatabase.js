const mysql = require('mysql');

// Create connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '' // Replace with your MySQL root password if set
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

            // Create url_records table
            const createUrlRecordsTableQuery = `
                CREATE TABLE IF NOT EXISTS url_records (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    url VARCHAR(255) NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;
            connection.query(createUrlRecordsTableQuery, (err, result) => {
                if (err) {
                    console.error('Error creating url_records table:', err);
                    return;
                }
                console.log('url_records table created or already exists.');

                // Create keyword_data table
                const createKeywordDataTableQuery = `
                    CREATE TABLE IF NOT EXISTS keyword_data (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        url_record_id INT NOT NULL,
                        keyword VARCHAR(255),
                        volume INT,
                        competition_level VARCHAR(10),
                        competition_index INT,
                        low_bid DECIMAL(10, 5),
                        high_bid DECIMAL(10, 5),
                        trend DECIMAL(10, 5),
                        FOREIGN KEY (url_record_id) REFERENCES url_records(id) ON DELETE CASCADE
                    )
                `;
                connection.query(createKeywordDataTableQuery, (err, result) => {
                    if (err) {
                        console.error('Error creating keyword_data table:', err);
                        return;
                    }
                    console.log('keyword_data table created or already exists.');

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
    });
});
