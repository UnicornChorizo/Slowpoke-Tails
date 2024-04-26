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
require('dotenv').config();

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Use express-session middleware
app.use(session({
    secret: '123456789', // Secret Key
    resave: false,
    saveUninitialized: true
}));

// Middleware to check authentication status
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // If the user ID is set in the session, the user is authenticated
        return next();
    } else {
        // If not authenticated, respond with unauthorized status
        return res.status(401).json({ isLoggedIn: false });
    }
}

// Middleware to parse JSON bodies
app.use(bodyParser.json());

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

const upload = multer({ dest: './uploads' });

CURRENCY_API_KEY = '74ec86e60ea30c231f72e7bf';
const currencyApiKey = process.env.CURRENCY_API_KEY;

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

//Search and Get all products
app.get('/api/products', (req, res) => {
    const searchTerm = req.query.search;
    let sql = "SELECT * FROM products";
    let params = [];

    if (searchTerm) {
        sql += " WHERE name LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%')";
        params = [searchTerm, searchTerm];
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error during database query');
            return;
        }
        res.json(results);
    });
});


// Route to handle GET request for fetching product details by ID
app.get('/api/products/:productId', (req, res) => {
    const productId = req.params.productId;

    // Query to retrieve product details from the database
    const query = `SELECT * FROM products WHERE id = ?`;

    // Execute the query with the product ID
    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error fetching product details:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (results.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        const product = results[0];
        res.json(product);
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
                res.redirect('/admin/admin.html'); // Redirect admin to admin.html
            } else if (user.type === 'shopper') {
                res.redirect('/index.html'); // Redirect shopper to index.html
            }
        } else {
            res.send('Invalid email or password');
        }
    });
});

// Define the check-authentication endpoint
app.get('/check-authentication', isAuthenticated, (req, res) => {
    res.json({ isLoggedIn: true });
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
    const fileExtension = path.extname(req.file.originalname).toLowerCase(); // Make sure to use originalname

    console.log('Uploaded file path:', filePath);
    console.log('Uploaded file extension:', fileExtension);

    try {
        if (fileExtension === '.json') {
            const data = fs.readFileSync(filePath, 'utf8');
            const products = JSON.parse(data);
            await insertProducts(products, res);
        } else if (fileExtension === '.csv') {
            const products = [];
            fs.createReadStream(filePath)
                .pipe(parse({ columns: true, skip_empty_lines: true }))
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
            console.log('Unsupported file type attempted:', fileExtension); // Log unexpected file type
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file: ' + error.message);
    }
});


async function insertProducts(products, res) {
    try {
        const promises = products.map(product => {
            const { id, name, description, image_url, price, category_id, featured, nutrition, ingredients } = product;
            const sql = 'INSERT INTO products (id, name, description, image_url, price, category_id, featured, nutrition, ingredients) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            console.log("Inserting product with values:", [id, name, description, image_url, price, category_id, featured, nutrition, ingredients]);
            return new Promise((resolve, reject) => {
                db.query(sql, [id, name, description, image_url, parseFloat(price), parseInt(category_id), parseInt(featured), nutrition, ingredients], (err, result) => {
                    if (err) {
                        console.error("Error inserting product:", err);
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });
        await Promise.all(promises);
        res.send('All products have been successfully inserted.');
    } catch (err) {
        console.error('Database insertion error:', err);
        res.status(500).send('Database insertion error: ' + err.message);
    }
}

//API Endpoints for product edit page
app.post('/api/products/add', upload.single('image'), (req, res) => {
    const { name, price, category, description } = req.body;
    const imageUrl = req.file ? req.file.path : ''; // Use uploaded file path or default to an empty string

    const sql = 'INSERT INTO products (name, description, image_url, price, category_id) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, description, imageUrl, price, category], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            res.status(500).send('Error adding product');
            return;
        }
        res.status(201).send('Product added successfully');
    });
});

app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Error fetching products');
            return;
        }
        res.json(results);
    });
});

// Update product information
app.post('/api/products/update', upload.single('image'), (req, res) => {
    const { id, name, price, category_id, description } = req.body;
    let imagePath = req.file ? req.file.path : req.body.image_url; // Use uploaded file path or existing image URL

    const sql = 'UPDATE products SET name = ?, price = ?, category_id = ?, description = ?, image_url = ? WHERE id = ?';
    const values = [name, price, category_id, description, imagePath, id];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error updating product:', error);
            res.status(500).send('Error updating product');
        } else {
            res.send('Product updated successfully');
        }
    });
});

//Endpoint for search function in admin-product-edit.html
// Fetch Products based on search query for editing
app.get('/api/products/search', (req, res) => {
    const searchTerm = req.query.q;
    if (!searchTerm) {
        res.json([]);
        return;
    }
    const sql = "SELECT * FROM products WHERE name LIKE CONCAT('%', ?, '%') LIMIT 3";
    db.query(sql, [searchTerm], (err, results) => {
        if (err) {
            console.error('Error searching products:', err);
            res.status(500).send('Error searching products');
            return;
        }
        res.json(results);
    });
});

app.get('/api/cart', (req, res) => {
    const sql = 'SELECT * FROM cart_products'; // Fetch all items regardless of user
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching cart items:', err);
            res.status(500).send('Error fetching cart items');
            return;
        }
        res.json(results);
    });
});

app.post('/api/cart/add', (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId || 1;  // Assume default userId if not found in session

    // Function to query the database with Promise
    const queryDb = (sql, params) => new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });

    const manageCart = async () => {
        try {
            // Check if the product is already in the user's cart
            const cartCheckSql = `
                SELECT cp.cart_id, cp.quantity 
                FROM cart_products cp
                JOIN carts c ON cp.cart_id = c.id
                WHERE c.user_id = ? AND cp.product_id = ? AND c.status = 'new'`;
            const cartCheckResults = await queryDb(cartCheckSql, [userId, productId]);

            if (cartCheckResults.length > 0) {
                // Product exists in the cart, update its quantity
                const existingCartItem = cartCheckResults[0];
                const newQuantity = existingCartItem.quantity + quantity;
                const updateSql = 'UPDATE cart_products SET quantity = ? WHERE cart_id = ? AND product_id = ?';
                await queryDb(updateSql, [newQuantity, existingCartItem.cart_id, productId]);
                res.send('Cart updated successfully');
            } else {
                // Product does not exist, insert new. Get or create a cart ID
                const cartIdSql = 'SELECT id FROM carts WHERE user_id = ? AND status = "new"';
                const cartResults = await queryDb(cartIdSql, [userId]);

                let cartId = cartResults.length > 0 ? cartResults[0].id : null;

                if (!cartId) {
                    // No existing cart, create a new one
                    const insertCartSql = 'INSERT INTO carts (user_id, status, created_at) VALUES (?, "new", NOW())';
                    const cartInsertResult = await queryDb(insertCartSql, [userId]);
                    cartId = cartInsertResult.insertId;
                }

                // Insert new cart product
                const insertCartProductSql = 'INSERT INTO cart_products (cart_id, product_id, quantity) VALUES (?, ?, ?)';
                await queryDb(insertCartProductSql, [cartId, productId, quantity]);
                res.send('Product added to cart successfully');
            }
        } catch (err) {
            console.error('Error managing cart:', err);
            res.status(500).send('Error managing cart');
        }
    };

    manageCart();
});

app.put('/api/cart/:productId/update', (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const sql = 'UPDATE cart_items SET quantity = ? WHERE product_id = ?';
    db.query(sql, [quantity, productId], (err, result) => {
        if (err) {
            console.error('Error updating cart item:', err);
            res.status(500).send('Error updating cart item');
            return;
        }
        res.send('Cart item updated successfully');
    });
});


app.delete('/api/cart/:productId/remove', (req, res) => {
    const { productId } = req.params;

    const sql = 'DELETE FROM cart_items WHERE product_id = ?';
    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error('Error removing cart item:', err);
            res.status(500).send('Error removing cart item');
            return;
        }
        res.send('Cart item removed successfully');
    });
});

//currency api
app.get('/api/convert-currency', (req, res) => {
    const baseCurrency = req.query.base;
    const targetCurrency = req.query.target;

    const apiUrl = `https://somecurrencyapi.com/api/${baseCurrency}/${targetCurrency}?apiKey=${currencyApiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            res.json({ success: true, rate: data.rate });
        })
        .catch(error => {
            console.error('Failed to fetch currency data:', error);
            res.status(500).json({ success: false, message: 'Failed to fetch currency data' });
        });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
