import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'pm_user',
  password: process.env.DB_PASSWORD || 'pm_pass',
  database: process.env.DB_NAME || 'pm_tracker',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
  return true;
}

export default pool;
