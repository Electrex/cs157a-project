const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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
        db.serialize(() => {
            db.run('PRAGMA foreign_keys=ON;');
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
            db.run('COMMIT;');
        });
        return res.send('Database initialized');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;