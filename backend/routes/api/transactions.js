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


// @route   GET /transactions/me
// @desc    Returns all transactions for the current user in the DB
// @access  Private
router.get('/me', auth, async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for all cars
        const findSQLQuery = 'SELECT Transactions.transactionID, Transactions.listingID, Transactions.buyerID, Transactions.transactionDate, \
        Listings.sellerID, Listings.price \
        FROM Transactions \
        JOIN Listings ON Listings.listingID = Transactions.listingID \
        WHERE Listings.sellerID=$sellerID OR Transactions.buyerID=$buyerID';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, {$sellerID: req.user.id, $buyerID: req.user.id}, function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }

                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No Transactions exist'}]});
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

// @route   GET /transactions/user/:user_id
// @desc    Returns all transactions for the specified user in the DB
// @access  Private
router.get('/user/:user_id', auth, async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for all cars
        const findSQLQuery = 'SELECT Transactions.transactionID, Transactions.listingID, Transactions.buyerID, Transactions.transactionDate, \
        Listings.sellerID, Listings.price \
        FROM Transactions \
        JOIN Listings ON Listings.listingID = Transactions.listingID \
        WHERE Listings.sellerID=$sellerID OR Transactions.buyerID=$buyerID';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, {$sellerID: req.params.user_id, $buyerID: req.params.user_id}, function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }

                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No Transactions exist'}]});
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

// @route   GET /transactions/all
// @desc    Returns all transactions in the DB
// @access  Private
router.get('/all', auth, async(req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for all cars
        const findSQLQuery = 'SELECT Transactions.transactionID, Transactions.listingID, Transactions.buyerID, Transactions.transactionDate, \
        Listings.sellerID, Listings.price \
        FROM Transactions \
        JOIN Listings ON Listings.listingID = Transactions.listingID';
        const result = await new Promise((resolve, reject) => {
            db.all(findSQLQuery, [], function(err, rows) {
                if (err) {
                    reject(err);
                    return res.status(500).json({errors: [{msg: err.message}]});
                }

                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No Transactions exist'}]});
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

// @route   POST /transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', [auth, [
    check('listingID', 'model is required')
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
        const {listingID} = req.body;

        db.serialize(() => {
            db.run('PRAGMA foreign_keys=OFF;');
            db.run('BEGIN TRANSACTION;');

            const findOneListingSQLQuery = `SELECT * FROM Listings WHERE listingID=$listingID`;
            db.all(findOneListingSQLQuery, {$listingID: listingID, $sellerID: req.user.id}, function(err, rows) {
                if (err) {
                    return console.log(err.message);
                }
                if (rows.length == 0) {
                    return res.status(400).json({errors: [{msg: 'No such listing exists'}]});
                }
            });

            const findListingSQLQuery = `SELECT * FROM Listings WHERE listingID=$listingID AND sellerID=$sellerID`;
            db.all(findListingSQLQuery, {$listingID: listingID, $sellerID: req.user.id}, function(err, rows) {
                if (err) {
                    return console.log(err.message);
                }
                if (rows.length != 0) {
                    return res.status(400).json({errors: [{msg: 'Can\'t purchase your own listing'}]});
                }
            });

            const transactionDate = new Date().toISOString();
            const insertTransactionSQLQuery = `INSERT INTO Transactions (buyerID, listingID, transactionDate) VALUES (?, ?, ?)`;
            db.run(insertTransactionSQLQuery, [req.user.id, listingID, transactionDate], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log(`A Transaction has been inserted with transactionID ${this.lastID}`);
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

// @route   DELETE /transactions/:transaction_id
// @desc    Delete a transaction by its transactionID
// @access  Private
router.delete('/:transaction_id', auth, async (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../../database/test/testdb.db');
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQLite database');
        });

        // Search the database for a user with the email passed into the request body, store the resulting query into the user variable
        const deleteSQLQuery = "DELETE FROM Transactions WHERE transactionID=$transactionID AND buyerID=$buyerID";
        db.run(deleteSQLQuery, {$transactionID: req.params.transaction_id, $buyerID: req.user.id}, function(err) {
            if (err) {
                return res.status(500).json({errors: [{msg: err.message}]});
            }
            return res.json({msg: 'Transaction deleted'});
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;