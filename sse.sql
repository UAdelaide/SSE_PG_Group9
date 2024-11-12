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

CREATE TABLE general_special_service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    email VARCHAR(100),
    contact VARCHAR(20),
    servicetype VARCHAR(50),
    dates VARCHAR(200),
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

CREATE TABLE on_demand_service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    servicetype VARCHAR(50),
    serviceday VARCHAR(50),
    timeslot VARCHAR(200),
    preferedCost DECIMAL(10, 2),
    serviceperson VARCHAR(7),
    hours INT,
    street VARCHAR(255),
    suburb VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin VARCHAR(20),
    issue_desc VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE package_service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    package VARCHAR(50),
    servicePerson VARCHAR(50),
    date date,
    time VARCHAR(200),
    additionalServices VARCHAR(250),
    safetyPreferences VARCHAR(250),
    street VARCHAR(255),
    suburb VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin VARCHAR(20),
    note VARCHAR(200),
    consent VARCHAR(200),
    symptoms VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);