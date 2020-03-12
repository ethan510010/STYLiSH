require('dotenv').config();

const mySQLConfig = {
  host: process.env.mysqlhost,
  user: process.env.mysqluser,
  password: process.env.mysqlpassword,
  port: process.env.mysqlport,
  database: process.env.mysqldatabase,
};

const redisConfig = {
  host: process.env.redishost,
  port: process.env.redisport,
};

module.exports = {
  mySQLConfig,
  redisConfig,
};
