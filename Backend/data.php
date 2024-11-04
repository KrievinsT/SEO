<?php 
$servername = "localhost"; 
$username = "root"; 
$password = ""; 
  
// Creating a connection 
$conn = new mysqli($servername,  
            $username, $password); 
  
// Check connection 
if ($conn->connect_error) { 
    die("Connection failure: " 
        . $conn->connect_error); 
}  
// Delete Databse if exits
$sql = "DROP DATABASE IF EXISTS SEO";
if ($conn->query($sql) === TRUE) {
    echo "Database SEO dropped successfully (if it existed).<br>";
} else {
    echo "Error dropping database: " . $conn->error . "<br>";
}
// Creating a database named SEO
$sql = "CREATE DATABASE SEO"; 
if ($conn->query($sql) === TRUE) { 
    echo "Database with name SEO"; 
} else { 
    echo "Error: " . $conn->error; 
} 
// Select Databse SEO
$conn->select_db("SEO");

// Create table url-records
$sql = "CREATE TABLE url_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Table url_records created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}
  
// Closing connection 
$conn->close(); 
?> 