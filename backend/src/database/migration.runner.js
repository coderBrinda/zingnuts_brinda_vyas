import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../../db/migrations');

function getDbConfig(withDatabase = true) {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'pm_user',
    password: process.env.DB_PASSWORD || 'pm_pass',
    multipleStatements: true,
  };

  if (withDatabase) {
    config.database = process.env.DB_NAME || 'pm_tracker';
  }

  return config;
}

async function ensureDatabase(connection) {
  const dbName = process.env.DB_NAME || 'pm_tracker';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);
}

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(connection) {
  const [rows] = await connection.query('SELECT name FROM schema_migrations');
  return new Set(rows.map((row) => row.name));
}

async function getMigrationFiles() {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files.filter((file) => file.endsWith('.sql')).sort();
}

async function runMigration(connection, fileName) {
  const filePath = path.join(MIGRATIONS_DIR, fileName);
  const sql = await fs.readFile(filePath, 'utf-8');
  await connection.query(sql);
  await connection.query('INSERT INTO schema_migrations (name) VALUES (?)', [fileName]);
}

export async function runMigrations() {
  const connection = await mysql.createConnection(getDbConfig(false));

  try {
    await ensureDatabase(connection);
    await ensureMigrationsTable(connection);

    const executed = await getExecutedMigrations(connection);
    const files = await getMigrationFiles();

    for (const file of files) {
      if (executed.has(file)) {
        console.log(`Migration skipped (already applied): ${file}`);
        continue;
      }

      console.log(`Running migration: ${file}`);
      await runMigration(connection, file);
      console.log(`Migration applied: ${file}`);
    }
  } finally {
    await connection.end();
  }
}
