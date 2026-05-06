const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '0123456789',
    });

    console.log('Connected to MySQL server as root');

    const dbName = 'techshop';
    const dbUser = 'techshop';
    const dbPassword = '0123456789';

    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database '${dbName}' created or already exists`);

    try {
      await connection.execute(
        `CREATE USER IF NOT EXISTS '${dbUser}'@'localhost' IDENTIFIED BY '${dbPassword}'`
      );
      console.log(`User '${dbUser}' created or already exists`);
    } catch (err) {
      console.log(`User '${dbUser}' already exists`);
    }

    await connection.execute(
      `GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'localhost'`
    );
    await connection.execute('FLUSH PRIVILEGES');
    console.log(`Privileges granted to user '${dbUser}'`);

    await connection.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup error:', error.message);
    process.exit(1);
  }
}

require('dotenv').config();
setupDatabase();
