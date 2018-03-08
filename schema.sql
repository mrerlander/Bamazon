DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(50),
    price DECIMAL (10,2) DEFAULT 0,
    stock_quantity INT (10) DEFAULT 0,
    product_sales DECIMAL (10,2) DEFAULT 0,
    primary key (item_id)
);

CREATE TABLE departments(
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    over_head_costs INT (11) DEFAULT 0,
    primary key (department_id)
);