const express = require('express');
// const connectDB = require('../database/db');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../database/test/testdb.db');

// sequelize.sync().then(() => {
//     console.log('SQLite connected');
// })

const app = express();

// const db = new sqlite3.Database(dbPath);

// // Connect database
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '95051'
// });

// // Connect to MySQL
// db.connect(err => {
//     if (err) {
//         throw err
//     }
//     console.log('MySQL Connected')
// })

// connectDB();

// Init Middleware
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json({extended: false}))

// Main route
app.get('/', (req, res) => res.send('API running'));

// Define routes
app.use('/initdb', require('./routes/api/initdb'));     // Route for creating the database for the first time
app.use('/users', require('./routes/api/users'));       // Route for registering user (pass in name, email, password --> creates user entry in database on success and returns token)
app.use('/auth', require('./routes/api/auth'));         // Route for authenticating user (pass in email and password --> either authenticates or not and returns token)
app.use('/listings', require('./routes/api/listings')); // Route for interacting with the listings table
app.use('/cars', require('./routes/api/cars'));         // Route for interacting with the cars table
app.use('/makes', require('./routes/api/makes'));       // Route for interacting with the makes table
app.use('/models', require('./routes/api/models'));     // Route for interacting with the models table
app.use('/transactions', require('./routes/api/transactions')); // Route for interacting with the transactions table

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));