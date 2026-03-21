require('dotenv').config();
const mysql = require('mysql2/promise');
async function run() {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dateStrings: true
  });
  const [rows] = await c.query('SELECT cedula, registration_date, expiration_date FROM members WHERE id = 17 OR id = (SELECT max(id) FROM members);');
  console.log(rows);
  c.end();
}
run();
