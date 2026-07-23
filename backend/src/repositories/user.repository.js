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

export async function findAll({ role, search } = {}) {
  const conditions = [];
  const values = [];

  if (role) {
    conditions.push('r.name = ?');
    values.push(role);
  }

  if (search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
    const term = `%${search}%`;
    values.push(term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.is_active, u.created_at, r.name AS role
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     ${whereClause}
     ORDER BY u.name ASC`,
    values
  );
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${USER_SELECT}
     FROM users u
     INNER JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function update(id, { name, roleId, isActive }) {
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }

  if (roleId !== undefined) {
    fields.push('role_id = ?');
    values.push(roleId);
  }

  if (isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(isActive ? 1 : 0);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  values.push(id);

  await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return findById(id);
}
