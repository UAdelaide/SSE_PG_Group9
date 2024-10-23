drop database if exists sse;
create database sse;
use sse;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    contact VARCHAR(10) UNIQUE,
    email VARCHAR(50) UNIQUE,
    gender VARCHAR(10),
    dob DATE,
    password VARCHAR(50),
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    street VARCHAR(50),
    suburb VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    pin VARCHAR(4)
);
