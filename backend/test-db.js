require("dotenv").config();
const sql = require("mssql");

console.log("SERVER:", process.env.DB_SERVER);
console.log("PORT:", process.env.DB_PORT);
console.log("DB:", process.env.DB_NAME);
console.log("USER:", process.env.DB_USER);

sql
  .connect({
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: { encrypt: false, trustServerCertificate: true },
  })
  .then(() => {
    console.log("SUCCESS: connected to the database");
    process.exit(0);
  })
  .catch((err) => {
    console.log("FAILED:", err.message);
    process.exit(1);
  });
