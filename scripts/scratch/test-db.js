const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: '<EllipMart>',
      password: '<@nisH321>',
      database: 'ellipmart',
      port: 3306
    });
    console.log('Connection successful!');
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();