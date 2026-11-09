import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { dbConfig, pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');
const databaseDir = path.resolve(projectRoot, 'database');

/**
 * Honda Bikes Store — MySQL Database Migration & Verification Runner
 * Connects via XAMPP MySQL and executes SQL scripts safely.
 */
async function run() {
  const args = process.argv.slice(2);
  const shouldSeed = args.includes('--seed');

  console.log('========================================================');
  console.log('Honda Bikes Store — MySQL Database Migration Runner');
  console.log(`Target Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`Target Database: ${dbConfig.database}`);
  console.log('========================================================');

  // Step 1: Ensure database exists
  let rootConn;
  try {
    rootConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    console.log(`Creating database '${dbConfig.database}' if not exists...`);
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✓ Database '${dbConfig.database}' confirmed.`);
    await rootConn.end();
  } catch (err) {
    console.error('ERROR: Could not establish connection to MySQL.');
    console.error('Please ensure XAMPP MySQL service is running on port 3306.');
    console.error('Detail:', err.message);
    process.exit(1);
  }

  // Step 2: Connect to target database
  const targetConn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    multipleStatements: true,
  });

  try {
    // Step 3: Run Core Schema
    const schemaPath = path.join(databaseDir, 'schema.mysql.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Executing database/schema.mysql.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await targetConn.query(schemaSql);
      console.log('✓ Core MySQL schema applied successfully.');
    }

    // Step 4: Verify Columns & Indexes
    console.log('Verifying is_active columns in categories and products...');
    const [catCols] = await targetConn.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'is_active';
    `, [dbConfig.database]);

    const [prodCols] = await targetConn.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'is_active';
    `, [dbConfig.database]);

    if (catCols.length === 0 || prodCols.length === 0) {
      throw new Error('Verification failed: is_active column missing on products or categories table.');
    }
    console.log('✓ Verified: categories.is_active and products.is_active exist.');

    // Step 5: Optional Seed
    if (shouldSeed) {
      const seedPath = path.join(databaseDir, 'seed.mysql.sql');
      if (fs.existsSync(seedPath)) {
        console.log('Executing database/seed.mysql.sql...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await targetConn.query(seedSql);
        console.log('✓ Reference seed data inserted successfully.');
      }
    }

    // Verify row counts
    const [catCount] = await targetConn.query('SELECT COUNT(*) AS count FROM categories');
    const [prodCount] = await targetConn.query('SELECT COUNT(*) AS count FROM products');
    console.log(`✓ Active Categories in DB: ${catCount[0].count}`);
    console.log(`✓ Active Products in DB: ${prodCount[0].count}`);

    console.log('========================================================');
    console.log('All MySQL database operations completed successfully.');
    console.log('========================================================');
  } catch (err) {
    console.error('Migration execution failed:', err.message);
    process.exit(1);
  } finally {
    await targetConn.end();
    await pool.end();
  }
}

run();
