const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
// Importing the parse function from csv-parse
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const db = require('./db');
const session = require('express-session');

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Use express-session middleware
app.use(session({
    secret: '123456789', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
}));

// Serve static files from 'public' directory
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this uploads directory exists or multer will throw an error
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({ storage: storage });

// Route to serve the homepage
app.get('/', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal server error');
            return;
        }
        // Render an HTML template with product information
        res.render('index', { products: results });
    });
});

// API endpoint to get all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results);
    });
});

// Handle login
app.post('/login', (req, res) => {
    const email = req.body.loginEmail;
    const password = req.body.loginPassword;

    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        if (results.length > 0) {
            const user = results[0];
            req.session.userId = user.id; // Store user ID in session

            if (user.type === 'admin') {
                res.redirect('webpages/admin.html'); // Redirect admin to admin.html
            } else if (user.type === 'shopper') {
                res.redirect('/index.html'); // Redirect shopper to index.html
            }
        } else {
            res.send('Invalid email or password');
        }
    });
});

// Handle registration
app.post('/register', (req, res) => {
    const name = req.body.registerName;
    const email = req.body.registerEmail;
    const password = req.body.registerPassword;
    const type = req.body.registerType;

    db.query('INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)', [name, email, password, type], (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.send('Registration successful');
    });
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/index.html');
    });
});

// Enhanced endpoint for file upload and processing JSON data
app.post('/upload', upload.single('fileUpload'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const fileExtension = path.extname(req.file.filename).toLowerCase();

    try {
        if (fileExtension === '.json') {
            const data = fs.readFileSync(filePath, 'utf8');
            const products = JSON.parse(data);
            await insertProducts(products, res);
        } else if (fileExtension === '.csv') {
            const products = [];
            fs.createReadStream(filePath)
                .pipe(parse({
                    columns: true,
                    skip_empty_lines: true
                }))
                .on('data', (record) => products.push(record))
                .on('end', async () => {
                    await insertProducts(products, res);
                })
                .on('error', (error) => {
                    console.error('Error parsing CSV:', error);
                    res.status(500).send('Error processing CSV file: ' + error.message);
                });
        } else if (fileExtension === '.txt') {
            const data = fs.readFileSync(filePath, 'utf8');
            const products = data.split('\n').filter(line => line).map(line => {
                const [id, name, description, image_url, price, category_id, featured] = line.split('\t');
                return { id, name, description, image_url, price, category_id, featured };
            });
            await insertProducts(products, res);
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file: ' + error.message);
    }
});


async function insertProducts(products, res) {
    const productPromises = products.map(product => {
        return new Promise((resolve, reject) => {
            const { id, name, description, image_url, price, category_id, featured } = product;
            const sql = 'INSERT INTO products (id, name, description, image_url, price, category_id, featured) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [id, name, description, image_url, parseFloat(price), parseInt(category_id), parseInt(featured)], (dbErr, result) => {
                if (dbErr) {
                    reject(dbErr);
                } else {
                    resolve();
                }
            });
        });
    });

    try {
        await Promise.all(productPromises);
        res.send('All products have been successfully inserted.');
    } catch (dbErr) {
        console.error('Database insertion error:', dbErr);
        res.status(500).send('Database insertion error: ' + dbErr.message);
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
