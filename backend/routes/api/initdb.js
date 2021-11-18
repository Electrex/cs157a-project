const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');

// @route   GET initdb
// @desc    Initialize database for the first time
// @access  Public
router.get('/', async (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });
        const sqlPath = path.resolve(__dirname, '../../../database/SQL/create_tables.sql');
        const dataSql = fs.readFileSync(sqlPath).toString();
        const dataArr = dataSql.toString().split(');');
        const carMakeModels = [
            {
                make: 'Toyota',
                model: 'Camry'
            },
            {
                make: 'Subaru',
                model: 'WRX'
            },
            {
                make: 'Honda',
                model: 'Civic'
            },
            {
                make: 'Honda',
                model: 'Accord'
            },
            {
                make: 'Lexus',
                model: 'is350'
            },
            {
                make: 'Mercedez',
                model: 'Benz'
            },
            {
                make: 'Audi',
                model: 'A4'
            }
        ]
        const insertMakeModelsQuery = `INSERT INTO Makes (model, make) VALUES (?, ?)`;
        const carModels = [
            {
                model: 'Camry',
                year: 2011,
                drivetrain: 'RWD',
                transmission: 'Automatic',
                carType: 'Sedan'
            },
            {
                model: 'WRX',
                year: 2016,
                drivetrain: '4WD',
                transmission: 'Manual',
                carType: 'Sedan'
            },
            {
                model: 'Civic',
                year: 2012,
                drivetrain: 'RWD',
                transmission: 'Automatic',
                carType: 'Sedan'
            },
            {
                model: 'Accord',
                year: 2004,
                drivetrain: 'RWD',
                transmission: 'Automatic',
                carType: 'Sedan'
            },
            {
                model: 'is350',
                year: 2008,
                drivetrain: 'RWD',
                transmission: 'Automatic',
                carType: 'Sedan'
            },
            {
                model: 'Benz',
                year: 2010,
                drivetrain: 'RWD',
                transmission: 'Automatic',
                carType: 'Coupe'
            },
            {
                model: 'A4 Avant',
                year: 2018,
                drivetrain: 'AWD',
                transmission: 'Automatic',
                carType: 'Hatchback'
            }
        ]
        const insertModelsQuery = `INSERT INTO Models (model, year, drivetrain, transmission, carType) VALUES (?, ?, ?, ?, ?)`;
        let cars = [
            {
                vin: 'YS3AK35E4M5002999',
                model: 'Camry',
                year: 2011,
                mileage: 120000,
                color: 'Red'
            },
            {
                vin: 'KL5VM52L54B110914',
                model: 'WRX',
                year: 2016,
                mileage: 100000,
                color: 'Blue'
            },
            {
                vin: 'JHMWD5523DS022721',
                model: 'Civic',
                year: 2012,
                mileage: 80000,
                color: 'White'
            },
            {
                vin: 'WVGBV75N19W507096',
                model: 'Accord',
                year: 2004,
                mileage: 170000,
                color: 'Green'
            },
            {
                vin: 'JH4KA7532NC036794',
                model: 'is350',
                year: 2008,
                mileage: 90000,
                color: 'Black'
            },
            {
                vin: '1FASP11J6TW112004',
                model: 'Benz',
                year: 2010,
                mileage: 115000,
                color: 'White'
            },
            {
                vin: 'JN1CA31D3YT717809',
                model: 'A4 Avant',
                year: 2018,
                mileage: 40000,
                color: 'Red'
            }
        ]
        const insertCarsQuery = `INSERT INTO Cars (vin, model, year, mileage, color) VALUES (?, ?, ?, ?, ?)`;
        let users = [
            {
                userID: 0,
                firstName: "Yusuf",
                lastName: "Mostafa",
                userName: "Electrex",
                email: "ymostafa30@gmail.com",
                password: "123456"
            },
            {
                userID: 0,
                firstName: "Patrick",
                lastName: "Merrill",
                userName: "MerrillPE",
                email: "patrick.merrill@sjsu.edu",
                password: "123456"
            },
            {
                userID: 0,
                firstName: "Leo",
                lastName: "Alciso",
                userName: "leoalciso",
                email: "leoalciso@gmail.com",
                password: "123456"
            },
        ]
        let listings = [
            {
                listingID: 0,
                vin: 'JH4KA7532NC036794',
                sellerID: 1,
                price: '13000.00',
                listingDate: '2021-01-01 10:00:00',
                location: 'San Jose, CA'
            },
            {
                listingID: 0,
                vin: 'YS3AK35E4M5002999',
                sellerID: 2,
                price: '10000.00',
                listingDate: '2021-05-01 12:30:00',
                location: 'San Jose, CA'
            },
            {
                listingID: 0,
                vin: 'JN1CA31D3YT717809',
                sellerID: 3,
                price: '14000.00',
                listingDate: '2021-07-01 12:00:00',
                location: 'San Jose, CA'
            },
        ]
        db.serialize(() => {
            db.run('PRAGMA foreign_keys=OFF;');
            db.run('BEGIN TRANSACTION;');
            // Loop through the `dataArr` and db.run each query
            dataArr.forEach((query) => {
              if(query) {
                // Add the delimiter `);` back to each query before running them
                query += ');';
                db.run(query, (err) => {
                   if(err) throw err;
                });
              }
            });

            carMakeModels.forEach(car => {
                db.run(insertMakeModelsQuery, [car.model, car.make], function(err) {
                    if (err) {
                        return console.log("CarMakeModels: " + err.message);
                    }
                });
            });
            
            let index = 0;
            carModels.forEach(car => {
                db.run(insertModelsQuery, [car.model, car.year, car.drivetrain, car.transmission, car.carType], function(err) {
                    if (err) {
                        return console.log("CarModels[" + index + "]: " + err.message);
                    }
                });
                index++;
            });
            
            index = 0;
            cars.forEach(car => {
                db.run(insertCarsQuery, [car.vin, car.model, car.year, car.mileage, car.color], function(err) {
                    if (err) {
                        return console.log("Cars[" + index + "]: " + err.message);
                    }
                });
                index++;
            });
    
            users.forEach(async (user) => {
                // initialize salt we'll be using to hash the password with
                const salt = await bcrypt.genSalt(10);
    
                // hash the password using the generated salt, and set the password of the user entry to this hashed password
                user.password = await bcrypt.hash(user.password, salt);
    
                const insertSQLQuery = `INSERT INTO Users (firstName, lastName, userName, email, psswrd) VALUES (?, ?, ?, ?, ?)`;
                db.run(insertSQLQuery, [user.firstName, user.lastName, user.userName, user.email, user.password], function(err) {
                    if (err) {
                        return console.log("Users: " + err.message);
                    }
                    user.userID = this.lastID;
                    
                    // console.log(`A row has been inserted with user ${this.lastID}`);
                });
            });
    
            listings.forEach(listing => {
                const insertListingSQLQuery = `INSERT INTO Listings (vin, sellerID, price, listingDate, location) VALUES (?, ?, ?, ?, ?)`;
                db.run(insertListingSQLQuery, [listing.vin, listing.sellerID, listing.price, listing.listingDate, listing.location], function(err) {
                    if (err) {
                        return console.log("Listings[" + index + "]: " + err.message);
                    }
                    listing.listingID = this.lastID;
                    // console.log(users[2].userID);
                    // console.log(`A row has been inserted with user ${listing.sellerID}`);
                });
                index++;
            });

            db.run('COMMIT;');
        });

        return res.send('Database initialized');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;