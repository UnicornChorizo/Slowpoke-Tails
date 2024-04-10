-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    type VARCHAR NOT NULL CHECK(type IN ('admin', 'shopper'))
);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    menu_order INTEGER NOT NULL
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR,
    price NUMERIC(10, 2) NOT NULL, -- Adjusted for precision
    category_id INTEGER NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE, -- Adjusted for boolean type
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create carts table
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    status VARCHAR NOT NULL CHECK(status IN ('new', 'abandoned', 'purchased')),
    created_at TIMESTAMP NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create cart_products table
CREATE TABLE cart_products (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create promotions table
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    discount NUMERIC(5, 2) NOT NULL, -- Adjusted for precision
    FOREIGN KEY (product_id) REFERENCES products(id)
);
