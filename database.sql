DROP DATABASE IF EXISTS Restaurant;

GO
CREATE DATABASE Restaurant;

GO
USE Restaurant;

GO
/* Accounts Table */
CREATE TABLE accounts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL DEFAULT 'Change Me',
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    role VARCHAR(15) NOT NULL DEFAULT 'user'
);

GO
/* Orders Table */
CREATE TABLE Orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    accountId INT NULL FOREIGN KEY REFERENCES accounts(id),
    customerName NVARCHAR(100) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'pending',
    totalPrice DECIMAL(10,2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    time TIME NOT NULL,
    items NVARCHAR(MAX) NOT NULL
);

GO
/* Reservations Table */
CREATE TABLE Reservations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    accountId INT NULL FOREIGN KEY REFERENCES accounts(id),
    customerName NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    phone NVARCHAR(30) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INT NOT NULL,
    specialRequest NVARCHAR(200),
    status_response NVARCHAR(20) NOT NULL DEFAULT 'pending',
    status_reason NVARCHAR(200) NULL
);

GO
/* Categories Table */
CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL
);

GO
/* MenuItems Table */
CREATE TABLE MenuItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    categoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(id),
    price DECIMAL(10,2) NOT NULL,
    description NVARCHAR(300),
    imageUrl NVARCHAR(300),
    available BIT NOT NULL
);
GO