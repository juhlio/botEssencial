const Sequelize = require("sequelize");
require("dotenv").config();

const env = process.env.NODE_ENV;

let dbName, dbUser, dbPassword, dbDialect, dbHost, dbPort;

 if (env == "production") {
  dbName = process.env.PROD_DB_NAME;
  dbUser = process.env.PROD_DB_USER;
  dbPassword = process.env.PROD_DB_PASS;
  dbDialect = process.env.PROD_DB_DIALECT;
  dbHost = process.env.PROD_DB_HOST;
  dbPort = process.env.PROD_DB_PORT;
}
if (env == "tests") {
  dbName = process.env.TEST_DB_NAME;
  dbUser = process.env.TEST_DB_USER;
  dbPassword = process.env.TEST_DB_PASS;
  dbDialect = process.env.TEST_DB_DIALECT;
  dbHost = process.env.TEST_DB_HOST;
  dbPort = process.env.TEST_DB_PORT;
} else {
  dbName = process.env.DEV_DB_NAME;
  dbUser = process.env.DEV_DB_USER;
  dbPassword = process.env.DEV_DB_PASS;
  dbDialect = process.env.DEV_DB_DIALECT;
  dbHost = process.env.DEV_DB_HOST;
  dbPort = process.env.DEV_DB_PORT;
} 

TEST_DB_NAME="essencialenergia_painelteste"
TEST_DB_USER="essencialenergia_painelteste"
TEST_DB_PASS="Ju7Li8o("
TEST_DB_HOST="187.45.189.73"
TEST_DB_DIALECT="mysql"
TEST_DB_PORT="3306"




const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  dialect: dbDialect,
  host: dbHost,
  port: dbPort,
});

module.exports = sequelize;
