const c = require('config');
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
// const User = require('../../../database/models/User') ;
const auth = require('../../middleware/auth');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// @route   GET /listings/all
// @desc    Returns all car listings in the DB
// @access  Public
router.get('/all', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        var user;
        const findSQLQuery = 'SELECT DISTINCT Listings.listingID, Listings.price, Listings.location, \
        Listings.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Users.userName \
        FROM Listings \
        INNER JOIN Users ON Users.userID = Listings.sellerID \
        INNER JOIN Cars ON Cars.vin = Listings.vin \
        INNER JOIN Models ON Models.model = Cars.model \
        INNER JOIN Models a ON a.year = Cars.year \
        INNER JOIN Makes ON Makes.model = Models.model';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, [], function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No listings exist'}]});
                }
                resolve(rows);
            });
        });

        db.close();

        // Return the json object for the user's ID in the response with the format {user: { id: user.id }}
        return res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /listings/byQuery
// @desc    Returns all car listings in the DB filtered by a certain query
// @access  Public
router.post('/byQuery', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        let findSQLQuery = 'SELECT DISTINCT Listings.listingID, Listings.price, Listings.location, \
        Listings.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Users.userName \
        FROM Listings \
        INNER JOIN Users ON Users.userID = Listings.sellerID \
        INNER JOIN Cars ON Cars.vin = Listings.vin \
        INNER JOIN Models ON Models.model = Cars.model \
        INNER JOIN Models a ON a.year = Cars.year \
        INNER JOIN Makes ON Makes.model = Models.model ';
        
        const {make, model, year, mileage} = req.body;
        let found = false;
        console.log(req.body);

        if (make !== undefined) {
            if (!found) {
                findSQLQuery += `WHERE Makes.make='${make}' AND `;
                found = true;
            } else {
                findSQLQuery += `Makes.make='${make}' AND `;
            }
        }
        if (model !== undefined) {
            if (!found) {
                findSQLQuery += `WHERE Cars.model='${model}' AND `;
                found = true;
            } else {
                findSQLQuery += `Cars.model='${model}' AND `;
            }
        }
        if (year !== undefined) {
            if (!found) {
                findSQLQuery += `WHERE Cars.year>=${year} AND `;
                found = true;
            } else {
                findSQLQuery += `Cars.year>=${year} AND `;
            }
        }
        if (mileage !== undefined) {
            if (!found) {
                findSQLQuery += `WHERE Cars.mileage<=${mileage} AND `;
                found = true;
            } else {
                findSQLQuery += `Cars.mileage<=${mileage} AND `;
            }
        }
        if (found) {
            findSQLQuery = findSQLQuery.substring(0, findSQLQuery.length - 4);
        } else {
            findSQLQuery = findSQLQuery.substring(0, findSQLQuery.length - 1);
        }

        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, [], function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No listings exist'}]});
                }
                resolve(rows);
            });
        });

        db.close();

        // Return the json object for the user's ID in the response with the format {user: { id: user.id }}
        return res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /listings/user/me
// @desc    Returns all car listings in the DB that belong to the currently logged in user
// @access  Private
router.get('/user/me', auth, async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });


        const findSQLQuery = 'SELECT Listings.listingID, Listings.price, Listings.location, \
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Users.userName \
        FROM Listings \
        JOIN Cars ON Cars.vin = Listings.vin \
        JOIN Users ON Users.userID = Listings.sellerID \
        JOIN Models ON Models.model = Cars.model \
        JOIN Models a ON a.year = Cars.year \
        JOIN Makes ON Makes.model = Models.model \
        WHERE Listings.sellerID=$userID';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, {$userID: req.user.id}, function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No listings exist'}]});
                }
                resolve(rows);
            });
        });

        db.close();

        // Return the json object for the user's ID in the response with the format {user: { id: user.id }}
        return res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /listings/user/:user_id
// @desc    Returns all car listings in the DB that belong to a user with user_id
// @access  Public
router.get('/user/:user_id', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });


        const findSQLQuery = 'SELECT Listings.listingID, Listings.price, Listings.location, \
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Users.userName \
        FROM Listings \
        JOIN Cars ON Cars.vin = Listings.vin \
        JOIN Users ON Users.userID = Listings.sellerID \
        JOIN Models ON Models.model = Cars.model \
        JOIN Models a ON a.year = Cars.year \
        JOIN Makes ON Makes.model = Models.model \
        WHERE Listings.sellerID=$userID';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, {$userID: req.params.user_id}, function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No listings exist'}]});
                }
                resolve(rows);
            });
        });

        db.close();

        // Return the json object for the user's ID in the response with the format {user: { id: user.id }}
        return res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /listings/:listing_id
// @desc    Returns a listing in the DB by its listingID
// @access  Public
router.get('/:listing_id', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        var user;
        const findSQLQuery = `SELECT Listings.listingID, Listings.price, Listings.location, \
        Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Users.userName \
        FROM Listings \
        JOIN Cars ON Cars.vin = Listings.vin \
        JOIN Users ON Users.userID = Listings.sellerID \
        JOIN Models ON Models.model = Cars.model \
        JOIN Models a ON a.year = Cars.year \
        JOIN Makes ON Makes.model = Models.model \
        WHERE Listings.listingID=$listingID`;
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, {$listingID: req.params.listing_id}, function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No listing with this listingID exist'}]});
                }
                resolve(rows);
            });
        });

        db.close();

        // Return the json object for the listing
        return res.json(result[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /listings/:listing_id
// @desc    Delete a listing by its ID
// @access  Private
router.delete('/:listing_id', auth, async (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        const deleteSQLQuery = "DELETE FROM Listings WHERE listingID=$listingID AND sellerID=$userID";
        db.run(deleteSQLQuery, {$listingID: req.params.listing_id, $userID: req.user.id}, function(err) {
            if (err) {
                return res.status(500).json({errors: [{msg: err.message}]});
            }
            return res.json({msg: 'Listing deleted'});
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /listings
// @desc    Create a listing in the database
// @access  Private
router.post('/', [auth, [
    check('vin', 'vin is required')
        .not()
        .isEmpty(),
    check('price', 'price is required')
        .not()
        .isEmpty(),
    check('listingDate', 'listingDate is required')
        .not()
        .isEmpty(),
    check('location', 'location is required')
        .not()
        .isEmpty()
    ]], async (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // deconstruct body of post into the corresponding name, email and password fields
        const {vin, price, listingDate, location} = req.body;

        let listingID = 0;
        db.serialize(() => {
            db.run('PRAGMA foreign_keys=OFF;');
            db.run('BEGIN TRANSACTION;');
            const findUserSQLQuery = "SELECT * FROM Users WHERE userID=$userID";
            db.all(findUserSQLQuery, {$userID: req.user.id}, function(err, rows) {
                if (err) {
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No user with this sellerID exists'}]});
                }
            });

            const findCarSQLQuery = "SELECT * FROM Cars WHERE vin=$vin";
            db.all(findCarSQLQuery, {$vin: vin}, function(err, rows) {
                if (err) {
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No car with this vin exists'}]});
                }
            });

            const insertListingSQLQuery = `INSERT INTO Listings (vin, sellerID, price, listingDate, location) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertListingSQLQuery, [vin, req.user.id, price, listingDate, location], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A listing has been inserted with listingID ${this.lastID}`);
                db.run('COMMIT;');
                return res.status(200).json(this.lastID);
            });
        });
        return res.status(200);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;