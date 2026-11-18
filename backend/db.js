require("dotenv").config();
const sql = require("mssql");
const config = {
  server: process.env.DB_SERVER.split("\\")[0],
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    instanceName: process.env.DB_SERVER.split("\\")[1],
    encrypt: false,
    trustServerCertificate: true,
  },
};
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.log("Database connection failed", err.message);
  });
module.exports = { sql, poolPromise };
