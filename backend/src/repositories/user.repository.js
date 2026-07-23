import pool from '../config/db.js';

const USER_SELECT = `
  u.id,
  u.name,
  u.email,
  u.password,
  u.role_id,
  u.is_active,
  u.created_at,
  u.updated_at,
  r.name AS role
`;

export async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT ${USER_SELECT}
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function findActiveById(id) {
  const [rows] = await pool.execute(
    `SELECT ${USER_SELECT}
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     WHERE u.id = ? AND u.is_active = 1
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function create({ name, email, password, roleId }) {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, role_id)
     VALUES (?, ?, ?, ?)`,
    [name, email, password, roleId]
  );
  return findActiveById(result.insertId);
}

export async function findActiveMembers() {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     WHERE r.name = 'member' AND u.is_active = 1
     ORDER BY u.name ASC`
  );
  return rows;
}
