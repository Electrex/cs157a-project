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

// @route   GET /models/all
// @desc    Returns all models in the DB
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

        // Search the database for all models
        const findSQLQuery = 'SELECT * FROM Models';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, [], function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No models exist'}]});
                }
                resolve(rows);
            });
        });

        db.close();

        // Return the json object representing all the models in the database
        return res.json(result);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /models/:model/:year
// @desc    Returns a model's details in the DB by its model+year
// @access  Public
router.get('/:model/:year', async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for all Models with model and year
        const findSQLQuery = `SELECT * FROM Models \
        WHERE model=$model AND year=$year`;
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, {$model: req.params.model, $year: req.params.year}, function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No models with this criteria exist'}]});
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

// @route   DELETE /model/:model/:year
// @desc    Delete a model by its model and year
// @access  Private
router.delete('/:model/:year', auth, async (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        const deleteSQLQuery = "DELETE FROM Models WHERE model=$model AND year=$year";
        db.run(deleteSQLQuery, {$model: req.params.model, $year: req.params.year}, function(err) {
            if (err) {
                return res.status(500).json({errors: [{msg: err.message}]});
            }
            return res.json({msg: 'Model deleted'});
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /models
// @desc    Create a model in the database
// @access  Private
router.post('/', [auth, [
    check('model', 'model is required')
        .not()
        .isEmpty(),
    check('year', 'year is required')
        .not()
        .isEmpty(),
    check('drivetrain', 'drivetrain is required')
        .not()
        .isEmpty(),
    check('transmission', 'transmission is required')
        .not()
        .isEmpty(),
    check('carType', 'carType is required')
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
        const {model, year, drivetrain, transmission, carType} = req.body;

        db.serialize(() => {
            db.run('PRAGMA foreign_keys=OFF;');
            db.run('BEGIN TRANSACTION;');
            // Search the database for all Models with model and year
            const findSQLQuery = "SELECT * FROM Models \
            WHERE model=$model AND year=$year";
            db.all(findSQLQuery, {$model: model, $year: year}, function(err, rows) {
                if (err) {
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If result is not empty, then there is already a model in the database with the same model+year.
                if (rows.length != 0) {
                    return res.status(400).json({errors: [{msg: 'Model with this primary already exists'}]});
                }
            });

            const findUserSQLQuery = "SELECT * FROM Makes WHERE model=$model";
            db.all(findUserSQLQuery, {$model: model}, function(err, rows) {
                if (err) {
                    return res.status(500).json({errors: [{msg: err.message}]});
                }
                // If user is not null, then there is already a user in the database with the same email. Since emails must be unique then we cannot make a new user with the same email.
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'Can\'t add model, no make with this model exists'}]});
                }
            });

            const insertModelSQLQuery = `INSERT INTO Models (model, year, drivetrain, transmission, carType) VALUES (?, ?, ?, ?, ?)`;
            db.run(insertModelSQLQuery, [model, year, drivetrain, transmission, carType], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A model has been inserted with model ${model}`);
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