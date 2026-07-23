import pool from '../config/db.js';

export async function findByName(name) {
  const [rows] = await pool.execute(
    `SELECT id, name
     FROM roles
     WHERE name = ?
     LIMIT 1`,
    [name]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name
     FROM roles
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}
