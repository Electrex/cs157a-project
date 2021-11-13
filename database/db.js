const { Sequelize } = require('sequelize');
const config = require('config');

const sequelize = new Sequelize('test-db', 'user', 'pass', {
    dialect: 'sqlite',
    host: './dev.sqlite'
})

module.exports = sequelize;    