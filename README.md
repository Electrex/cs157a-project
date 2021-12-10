# cs157a-project

## CLI for User Views

### All Listings 
`SELECT DISTINCT Listings.listingID, Listings.price, Listings.location,
        Listings.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        INNER JOIN Users ON Users.userID = Listings.sellerID
        INNER JOIN Cars ON Cars.vin = Listings.vin
        INNER JOIN Models ON Models.model = Cars.model
        INNER JOIN Models a ON a.year = Cars.year
        INNER JOIN Makes ON Makes.model = Models.model;`
        
### Individual Listing for ListingID 1
`SELECT Listings.listingID, Listings.price, Listings.location,
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        JOIN Cars ON Cars.vin = Listings.vin
        JOIN Users ON Users.userID = Listings.sellerID
        JOIN Models ON Models.model = Cars.model
        JOIN Models a ON a.year = Cars.year
        JOIN Makes ON Makes.model = Models.model
        WHERE Listings.listingID=1;`
        
 ### User 1's Transactions
 `SELECT Transactions.transactionID, Transactions.listingID, Transactions.buyerID, Transactions.transactionDate,
        Listings.sellerID, Listings.price
        FROM Transactions
        JOIN Listings ON Listings.listingID = Transactions.listingID
        WHERE Listings.sellerID=1 OR Transactions.buyerID=1;`
        
 ### User 1's Listings
 `SELECT Listings.listingID, Listings.price, Listings.location,
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        JOIN Cars ON Cars.vin = Listings.vin
        JOIN Users ON Users.userID = Listings.sellerID
        JOIN Models ON Models.model = Cars.model
        JOIN Models a ON a.year = Cars.year
        JOIN Makes ON Makes.model = Models.model
        WHERE Listings.sellerID=1;`

## Docker Deployment
* `docker network create project`
* `docker run -p 3001:3001 -d --network=project --name=node-server electrex/node-server:2.0`
        * This will pull and run the publicly available image for the server 
* `docker run -p 3000:3000 -d --network=project --name=react-client electrex/react-client:2.0`
        * This will pull and run the publicly available image for the frontend  
