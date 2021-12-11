# cs157a-project

## CLI for User Views
### All Listings 
```sql
SELECT DISTINCT Listings.listingID, Listings.price, Listings.location,
        Listings.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        INNER JOIN Users ON Users.userID = Listings.sellerID
        INNER JOIN Cars ON Cars.vin = Listings.vin
        INNER JOIN Models ON Models.model = Cars.model
        INNER JOIN Models a ON a.year = Cars.year
        INNER JOIN Makes ON Makes.model = Models.model;
```
### Individual Listing for ListingID 1
```sql
SELECT Listings.listingID, Listings.price, Listings.location,
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
        Users.userName
        FROM Listings
        JOIN Cars ON Cars.vin = Listings.vin
        JOIN Users ON Users.userID = Listings.sellerID
        JOIN Models ON Models.model = Cars.model
        JOIN Models a ON a.year = Cars.year
        JOIN Makes ON Makes.model = Models.model
        WHERE Listings.listingID = 1;
```
### User 1's (Electrex's) ​Transactions
```sql
SELECT Transactions.transactionID, Transactions.listingID, Transactions.buyerID, Transactions.transactionDate,
       ​Listings.sellerID, Listings.price
       ​FROM Transactions
       ​JOIN Listings ON Listings.listingID = Transactions.listingID
       ​WHERE Listings.sellerID = 1 OR Transactions.buyerID = 1;
```

### User 1's (Electrex's) Listings
```sql
SSELECT Listings.listingID, Listings.price, Listings.location,
      ​​Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage,
      ​​Users.userName
      ​​FROM Listings
      ​​JOIN Cars ON Cars.vin = Listings.vin
      ​​JOIN Users ON Users.userID = Listings.sellerID
      ​​JOIN Models ON Models.model = Cars.model
      ​​JOIN Models a ON a.year = Cars.year
      ​​JOIN Makes ON Makes.model = Models.model
      ​​WHERE Listings.sellerID = 1;
```

## Docker Deployment
Option 1: Pull and run the pre-made docker image files (recommended)
--------------------------------------------------------------------------------
1. Make sure you have docker installed
3. Setup the docker network, pull and run the images for the server and client in their isolated containers:
```
$ docker network create project
$ docker run -p 3001:3001 -d --network=project --name=node-server electrex/node-server:3.0
$ docker run -p 3000:3000 -d --network=project --name=react-client electrex/react-client:3.0
```
4. Once the project's containers are up and running, visit `localhost:3000` in browser to access the application's UI

Option 2: Build and run the docker images yourself
--------------------------------------------------------------------------------
1. Make sure you have docker installed
2. Pull the latest branch of the project's github repository:
```
$ git pull https://github.com/MerrillPE/cs157a-project.git
```
3. Open a new terminal window in the cloned repository's root directory and run the following:
```
$ docker-compose build
$ docker-compose up
```
4. Once the project's containers are up and running, visit `localhost:3000` in browser to access the application's UI

## Diagrams

### Views
![Views](https://user-images.githubusercontent.com/34024255/145519536-c41043b1-b3f6-4f7e-9789-56a0ec984098.png)

### 1NF
![1NF](https://user-images.githubusercontent.com/34024255/145519545-f720c264-55c4-41a5-978c-f2ef3ef7e96d.png)

### 2NF
![2NF](https://user-images.githubusercontent.com/34024255/145519562-c2fbe513-b81f-40c4-8605-56294b6125a9.png)

### 3NF
![3NF](https://user-images.githubusercontent.com/34024255/145519571-e1f17ab5-9e97-45c5-85fb-c73842766cf3.png)

### Physical Design
![Physical_Design](https://user-images.githubusercontent.com/34024255/145519583-61707461-3a42-4f7d-a3df-533e30bd8008.png)

## License
[MIT](https://choosealicense.com/licenses/mit/)