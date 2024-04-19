const mysql = require('mysql');

// Set up MySQL connection
const connection = mysql.createConnection({
    host: 'sql5.freesqldatabase.com', // or the IP address of your MySQL server
    user: 'sql5699971', // your MySQL username
    password: 'GwNj668SsY', // your MySQL password
    database: 'sql5699971' // the name of your database
});

// Connect to the MySQL server
connection.connect(error => {
    if (error) {
        console.error('Error connecting to the database: ' + error.stack);
        return;
    }
    console.log('Connected to database as ID ' + connection.threadId);
});

// Export the connection to be used in other files
module.exports = connection;
