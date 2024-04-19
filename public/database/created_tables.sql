-- Create users table
CREATE TABLE users
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP    NOT NULL,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    type       ENUM('admin','shopper') NOT NULL
);

-- Create categories table
CREATE TABLE categories
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    menu_order INT          NOT NULL
);

-- Create products table
CREATE TABLE products
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description TEXT           NOT NULL,
    image_url   VARCHAR(255),
    price       DECIMAL(10, 2) NOT NULL,
    category_id INT            NOT NULL,
    featured    BOOLEAN        NOT NULL DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Create carts table
CREATE TABLE carts
(
    id     INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('new','abandoned','purchased') NOT NULL,
    created_at TIMESTAMP NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create cart_products table
CREATE TABLE cart_products
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    cart_id    INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Create promotions table
CREATE TABLE promotions
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT           NOT NULL,
    description TEXT          NOT NULL,
    start_date  TIMESTAMP     NOT NULL,
    end_date    TIMESTAMP     NOT NULL,
    discount    DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (id)
);
