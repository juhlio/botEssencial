const Sequelize = require("sequelize");
require("dotenv").config();



let dbName, dbUser, dbPassword, dbDialect, dbHost, dbPort;

dbName = "essencialenergia_painelteste";
dbUser = "essencialenergia_painelteste";
dbPassword = "Ju7Li8o(";
dbHost = "187.45.189.73";
dbDialect = "mysql";
dbPort = "3306"; 


const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect: dbDialect,
  host: dbHost,
  port: dbPort,
});

module.exports = sequelize;
