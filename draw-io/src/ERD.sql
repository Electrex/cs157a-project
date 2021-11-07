CREATE TABLE Make (
    model VARCHAR(50) NOT NULL UNIQUE PRIMARY KEY,
    make VARCHAR(25) NOT NULL
);

CREATE TABLE Model (
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    drivetrain VARCHAR(25) NOT NULL,
    transmission VARCHAR(25) NOT NULL,
    carType VARCHAR(25) NOT NULL,
    PRIMARY KEY (model, year),
    FOREIGN KEY (model) REFERENCES Make(model)
);

CREATE TABLE Car (
    vin VARCHAR(17) NOT NULL UNIQUE PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    FOREIGN KEY (model, year) REFERENCES Model(model, year),
    mileage INT NOT NULL,
    color VARCHAR(25) NOT NULL 
);

CREATE TABLE User (
    userID INT NOT NULL UNIQUE PRIMARY KEY,
    firstName VARCHAR(25),
    lastName VARCHAR(25),
    userName VARCHAR(25) 
);

CREATE TABLE Listings (
    listingID INT NOT NULL UNIQUE PRIMARY KEY,
    vin VARCHAR(17) NOT NULL,
    sellerID INT NOT NULL,
    FOREIGN KEY (vin) REFERENCES Car(vin),
    FOREIGN KEY (sellerID) REFERENCES User(userID),
    price DECIMAL(10,2) NOT NULL,
    listingDate DATETIME
);

CREATE TABLE Transactions (
    transactionID INT NOT NULL UNIQUE PRIMARY KEY,
    buyerID INT NOT NULL,
    listingID INT NOT NULL,
    FOREIGN KEY (buyerID) REFERENCES User(userID),
    FOREIGN KEY (listingID) REFERENCES Listings(listingID),
    transactionDate DATETIME
);