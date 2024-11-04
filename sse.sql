drop database if exists sse;
create database sse;
use sse;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password ) VALUES
('ashwini@gmail.com', 'password123'),
('tanveer@gmail.com', 'password456'),
('sharlene@gmail.com', 'password789'),
('tung@gmail.com', 'password321'),
('emmanuel@gmail.com', 'password234'),
('punlapa@gmail.com', '12345678'),
('Leah@gmail.com', '123456'),
('vishal@gmail.com', 'password323');