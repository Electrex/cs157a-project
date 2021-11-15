CREATE TABLE IF NOT EXISTS Makes (
    model VARCHAR(50) NOT NULL UNIQUE PRIMARY KEY,
    make VARCHAR(25) NOT NULL
);

CREATE TABLE IF NOT EXISTS Models (
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    drivetrain VARCHAR(25) NOT NULL,
    transmission VARCHAR(25) NOT NULL,
    carType VARCHAR(25) NOT NULL,
    PRIMARY KEY (model, year),
    FOREIGN KEY (model) REFERENCES Make(model)
);

CREATE TABLE IF NOT EXISTS Cars (
    vin VARCHAR(17) NOT NULL UNIQUE PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    color VARCHAR(25) NOT NULL,
    FOREIGN KEY (model, year) REFERENCES Model(model, year)
);

CREATE TABLE IF NOT EXISTS Users (
    userID INTEGER PRIMARY KEY,
    firstName VARCHAR(25),
    lastName VARCHAR(25),
    userName VARCHAR(25),
    email VARCHAR(50),
    psswrd VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Listings (
    listingID INTEGER PRIMARY KEY,
    vin VARCHAR(17) NOT NULL,
    sellerID INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    listingDate DATETIME,
    FOREIGN KEY (vin) REFERENCES Car(vin),
    FOREIGN KEY (sellerID) REFERENCES User(userID)
);

CREATE TABLE IF NOT EXISTS Transactions (
    transactionID INTEGER PRIMARY KEY,
    buyerID INTEGER NOT NULL,
    listingID INTEGER NOT NULL,
    transactionDate DATETIME,
    FOREIGN KEY (buyerID) REFERENCES User(userID),
    FOREIGN KEY (listingID) REFERENCES Listings(listingID)
);