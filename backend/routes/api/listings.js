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

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        var user;
        const findSQLQuery = 'SELECT Listings.listingID, Listings.price, Listings.location, \
        Cars.vin, Cars.model, Cars.year, Cars.mileage, \
        Users.userName \
        FROM Listings \
        JOIN Cars ON Cars.vin = Listings.vin \
        JOIN Users ON Users.userID = Listings.sellerID';
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

// @route   POST /users
// @desc    Register user
// @access  Public
router.post('/', [
        check('firstName', 'First Name is required')
            .not()
            .isEmpty(),
        check('lastName', 'Last Name is required')
            .not()
            .isEmpty(),
        check('userName', 'User Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email')
            .isEmail(),
        check('password', 'Please enter a password with 6 or more characters')
            .isLength({min: 6})
    ], 
    async (req, res) => {
        // validate name, email, and password 
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        
        // deconstruct body of post into the corresponding name, email and password fields
        const {firstName, lastName, userName, email, password} = req.body;

        try {
            const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
            let db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    return console.error(err.message);
                }
                console.log('Connected to SQLite database');
            });

            // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
            const findSQLQuery = "SELECT * FROM Users WHERE email=$email";
            db.all(findSQLQuery, {$email: email}, function(err, rows) {
                if (err) {
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length != 0) {
                    return res.status(400).json({errors: [{msg: 'User already exists'}]});
                }
            });

            let userID = 0;

            let user = {
                userID,
                firstName,
                lastName,
                userName,
                email,
                password
            }

            // initialize salt we'll be using to hash the password with
            const salt = await bcrypt.genSalt(10);

            // hash the password using the generated salt, and set the password of the user entry to this hashed password
            user.password = await bcrypt.hash(password, salt);

            const insertSQLQuery = `INSERT INTO Users (firstName, lastName, userName, email, psswrd) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertSQLQuery, [user.firstName, user.lastName, user.userName, user.email, user.password], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                user.userID = this.lastID;
                console.log(`A row has been inserted with user ${this.lastID}`);
            });

            db.close();


            // make a new payload json variable which we will be sending back in the response, consisting of a user key with 1 attriute: the user id (_id from mongodb)
            const payload = {
                user: {
                    id: user.userID
                }
            }

            //Sign the payload (containing the user's id in the mongodb database for later access), return the token in the response
            jwt.sign(
                payload, 
                config.get('jwtSecret'),
                {expiresIn: 360000},
                (err, token) => {
                    if(err) throw err;
                    res.json({token});
                }
            );
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   DELETE api/users/
// @desc    Delete currently logged in user
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        const deleteSQLQuery = "DELETE FROM Users WHERE userID=$userID";
        db.run(deleteSQLQuery, {$userID: req.user.id}, function(err) {
            if (err) {
                return res.status(500).json({errors: [{msg: err.message}]});
            }
            return res.json({msg: 'User deleted'});
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;