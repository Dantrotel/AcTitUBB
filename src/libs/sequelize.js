const { Sequelize } = require('sequelize');
const config = require('../config/config');
const setupModels = require('../db/models');

const sequelize = new Sequelize(
    config.dbName,
    config.dbUser,
    config.dbPassword,
    {
        host: config.dbHost,
        port: config.dbPort,
        dialect: 'postgres', // Cambia a 'postgres' si es necesario
    },
);

sequelize.sync()
    .then(() => {
        console.log("Database synchronized");
        setupModels(sequelize);
    })
    .catch(error => {
        console.error("Error synchronizing the database:", error);
    });

module.exports = sequelize;
