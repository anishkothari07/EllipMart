const mariadb = require('mariadb');
require('dotenv').config();
const dbUrl = process.env.DATABASE_URL.replace('mysql://', 'mariadb://');
console.log("DB URL:", dbUrl);
const pool = mariadb.createPool(dbUrl);
pool.getConnection().then(conn => {
  console.log("Connected!");
  conn.release();
  process.exit(0);
}).catch(err => {
  console.error("Connection error:", err);
  process.exit(1);
});
