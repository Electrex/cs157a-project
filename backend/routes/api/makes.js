const c = require('config');
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const {check, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// @route   GET /makes/all
// @desc    Returns all makes in the DB
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

        // Search the database for all cars
        const findSQLQuery = 'SELECT * FROM Makes';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, [], function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No Makes exist'}]});
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

// @route   POST /makes
// @desc    Create a new model-make to the DB
// @access  Private
router.post('/', [auth, [
    check('model', 'model is required')
        .not()
        .isEmpty(),
    check('make', 'make is required')
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
        const {model, make} = req.body;

        db.serialize(() => {
            db.run('PRAGMA foreign_keys=OFF;');
            db.run('BEGIN TRANSACTION;');

            const insertCarSQLQuery = `INSERT INTO Makes (model, make) VALUES (?, ?)`;
            db.run(insertCarSQLQuery, [model, make], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A Make has been inserted with model ${model}`);
                db.run('COMMIT;');
                return res.status(200).json(model);
            });
        });
        return res.status(200);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;