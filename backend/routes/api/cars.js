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

// @route   GET /cars/all
// @desc    Returns all cars in the DB
// @access  Private
router.get('/all', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for all cars
        const findSQLQuery = 'SELECT Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Cars.color, Models.drivetrain, Models.transmission, Models.carType \
        FROM Cars \
        JOIN Models ON Models.model = Cars.model \
        JOIN Models a ON a.year = Cars.year \
        JOIN Makes ON Makes.model = Models.model';
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

        // Return the json object representing all the cars in the database
        return res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /cars/:vin
// @desc    Returns a car's details in the DB by its vin
// @access  Public
router.get('/:vin', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for all cars
        const findSQLQuery = `SELECT Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Cars.color, Models.drivetrain, Models.transmission, Models.carType \
        FROM Cars \
        JOIN Models ON Models.model = Cars.model \
        JOIN Models a ON a.year = Cars.year \
        JOIN Makes ON Makes.model = Models.model \
        WHERE Cars.vin=$vin`;
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, {$vin: req.params.vin}, function(err, rows) {
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

        // Return the json object representing all the cars in the database
        return res.json(result[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /cars/details/:listing_id
// @desc    Returns a car's details in the DB by its vin
// @access  Public
router.get('/details/:listing_id', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        const findSQLQuery = `SELECT DISTINCT Listings.price, Listings.listingDate, Listings.location, Cars.vin, Makes.make, Cars.model, Cars.year, Cars.mileage, \
        Cars.color, Models.drivetrain, Models.transmission, Models.carType, Listings.sellerID, Users.userName, Users.firstName, Users.lastName \
        FROM Listings \
        JOIN Users ON Users.userID = Listings.sellerID \
        JOIN Cars ON Cars.vin = Listings.vin \
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
                
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No listings exist'}]});
                }
                resolve(rows);
            });
        });

        db.close();

        return res.json(result[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /car/:vin
// @desc    Delete a car by its vin
// @access  Private
router.delete('/:vin', auth, async (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        const deleteSQLQuery = "DELETE FROM Cars WHERE vin=$vin";
        db.run(deleteSQLQuery, {$vin: req.params.vin}, function(err) {
            if (err) {
                return res.status(500).json({errors: [{msg: err.message}]});
            }
            return res.json({msg: 'Car deleted'});
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /cars
// @desc    Create a listing in the database
// @access  Private
router.post('/', [auth, [
    check('vin', 'vin is required')
        .not()
        .isEmpty(),
    check('model', 'model is required')
        .not()
        .isEmpty(),
    check('year', 'year is required')
        .not()
        .isEmpty(),
    check('mileage', 'mileage is required')
        .not()
        .isEmpty(),
    check('color', 'color is required')
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

        // deconstruct body of post into the corresponding fields
        const {vin, model, year, mileage, color} = req.body;

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

            const findModelSQLQuery = "SELECT * FROM Cars WHERE model=$model AND year=$year";
            db.all(findModelSQLQuery, {$model: model, $year: year}, function(err, rows) {
                if (err) {
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No model with this model,year exists'}]});
                }
            });

            const insertCarSQLQuery = `INSERT INTO Cars (vin, model, year, mileage, color) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertCarSQLQuery, [vin, model, year, mileage, color], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A vin has been inserted with vin ${vin}`);
                db.run('COMMIT;');
                return res.status(200).json(vin);
            });
        });
        return res.status(200);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;