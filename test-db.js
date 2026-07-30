const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: '<SmartGO>',
      password: '<@nisH321>',
      database: 'smartgo',
      port: 3306
    });
    console.log('Connection successful!');
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();