const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./db');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Add more routes as needed

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.static('public'));

app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// Add more routes as needed

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
