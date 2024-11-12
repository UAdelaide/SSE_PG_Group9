ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;

drop database if exists sse;
create database sse;
use sse;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    dob DATE,
    country  VARCHAR(50),
    language VARCHAR(50),
    mobile VARCHAR(10) UNIQUE,
    vaccinated varchar(5),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (first_name, last_name, dob, country, language, mobile, email, password, vaccinated) VALUES
('Ashwini', 'Manohar', '1990-01-01', 'India', 'Kannada', '0491592039', 'ashwini@gmail.com', 'password123', 'yes'),
('Tanveer', 'Akram', '1999-03-30', 'India', 'Hindi', '0491758493', 'tanveer@gmail.com', 'password293', 'no'),
('Sharlene', 'Rodrigues', '2000-04-18', 'India', 'Konkani', '0496811930', 'sharlene@gmail.com', 'password323', 'yes');


-- INSERT INTO users (email, password ) VALUES
-- ('ashwini@gmail.com', 'password123'),
-- ('tanveer@gmail.com', 'password456'),
-- ('sharlene@gmail.com', 'password789'),
-- ('tung@gmail.com', 'password321'),
-- ('emmanuel@gmail.com', 'password234'),
-- ('punlapa@gmail.com', '12345678'),
-- ('Leah@gmail.com', '123456'),
-- -- ('vishal@gmail.com', 'password323');
-- INSERT INTO users (email, password ) VALUES
-- ('ashwini@gmail.com', 'password123'),
-- ('tanveer@gmail.com', 'password456'),
-- ('sharlene@gmail.com', 'password789'),
-- ('tung@gmail.com', 'password321'),
-- ('emmanuel@gmail.com', 'password234'),
-- ('punlapa@gmail.com', '12345678'),
-- ('Leah@gmail.com', '123456'),
-- ('vishal@gmail.com', 'password323');


CREATE TABLE general_special_service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(100),
    contact VARCHAR(20),
    servicetype VARCHAR(50),
    date VARCHAR(200),
    preferedCost DECIMAL(10, 2),
    hours INT,
    street VARCHAR(255),
    suburb VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin VARCHAR(20),
    note VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);