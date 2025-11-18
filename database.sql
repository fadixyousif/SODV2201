IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'Restaurant')
BEGIN
    CREATE DATABASE Restaurant;
END;

GO
USE Restaurant;
GO
CREATE TABLE accounts (
  id INT IDENTITY(1,1) PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL DEFAULT 'Change Me',
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  salt VARCHAR(255) NOT NULL,
  role VARCHAR(15) NOT NULL DEFAULT 'user'
);