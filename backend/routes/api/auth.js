const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
// const User = require('../../../database/models/User');
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// @route   GET api/auth
// @desc    TEST route
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// @route   POST /auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
    '/', 
    [
        check('email', 'Please include a valid email')
            .isEmail(),
        check('password', 'Password is required')
            .exists()
    ], 
    async (req, res) => {
        // validate email and password fields
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        
        // deconstruct request body and store email and password fields into corresponding variables
        const {email, password} = req.body;

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
            const findSQLQuery = "SELECT * FROM Users WHERE email=$email";
            const result = await new Promise((resolve, reject) => {
                db.all(findSQLQuery, {$email: email}, function(err, rows) {
                    if (err) {
                        reject(err);
                        return res.status(500).json({errors: [{msg: err.message}]});
                    }
                    // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                    if (rows.length == 0) {
                        return res.status(400).json({errors: [{msg: 'No user with this email exists'}]});
                    }
                    resolve(rows);
                });
            });

            db.close();

            user = result[0];

            // decrypt the password stored in the database and compare it to the password passed into the sign on
            const isMatch = await bcrypt.compare(password, user.psswrd);

            // If the passwords don't match, then the person trying to login will not be authorized to access
            if (!isMatch) {
                return res
                    .status(401)
                    .json({errors: [{msg: 'Unauthorized'}]});
            }

            // Create a payload object contianing a single object with an id attribute corresponding to the _id for the user in the mongodb database
            const payload = {
                user: {
                    id: user.userID
                }
            }

            // Sign the payload object and send it back as the response for this post request
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

module.exports = router;