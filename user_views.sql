-- Listing View
SELECT DISTINCT Listings.listingID, Listings.price, Listings.location,
        Listings.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        INNER JOIN Users ON Users.userID = Listings.sellerID
        INNER JOIN Cars ON Cars.vin = Listings.vin
        INNER JOIN Models ON Models.model = Cars.model
        INNER JOIN Models a ON a.year = Cars.year
        INNER JOIN Makes ON Makes.model = Models.model;

-- Individual Listing
SELECT Listings.listingID, Listings.price, Listings.location,
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        JOIN Cars ON Cars.vin = Listings.vin
        JOIN Users ON Users.userID = Listings.sellerID
        JOIN Models ON Models.model = Cars.model
        JOIN Models a ON a.year = Cars.year
        JOIN Makes ON Makes.model = Models.model
        WHERE Listings.listingID=1; -- Replace number with desired listingID

-- User's Transactions
SELECT Transactions.transactionID, Transactions.listingID, Transactions.buyerID, Transactions.transactionDate,
        Listings.sellerID, Listings.price
        FROM Transactions
        JOIN Listings ON Listings.listingID = Transactions.listingID
        WHERE Listings.sellerID=1 OR Transactions.buyerID=1; -- Replace number with desired userID

-- User's Listings
SELECT Listings.listingID, Listings.price, Listings.location,
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        JOIN Cars ON Cars.vin = Listings.vin
        JOIN Users ON Users.userID = Listings.sellerID
        JOIN Models ON Models.model = Cars.model
        JOIN Models a ON a.year = Cars.year
        JOIN Makes ON Makes.model = Models.model
        WHERE Listings.sellerID=1; -- Replace number with desired userID
