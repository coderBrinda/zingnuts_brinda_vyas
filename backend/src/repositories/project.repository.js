import pool from '../config/db.js';

const PROJECT_SELECT = `
  p.id,
  p.project_name,
  p.client_name,
  p.monthly_hour_cap,
  p.created_by,
  p.created_at,
  p.updated_at,
  u.name AS creator_name
`;

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${PROJECT_SELECT}
     FROM projects p
     INNER JOIN users u ON p.created_by = u.id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function findAllForAdmin() {
  const [rows] = await pool.execute(
    `SELECT ${PROJECT_SELECT}
     FROM projects p
     INNER JOIN users u ON p.created_by = u.id
     ORDER BY p.created_at DESC`
  );
  return rows;
}

export async function findAllForPm(userId) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT ${PROJECT_SELECT}
     FROM projects p
     INNER JOIN users u ON p.created_by = u.id
     LEFT JOIN project_managers pm ON pm.project_id = p.id
     WHERE p.created_by = ? OR pm.user_id = ?
     ORDER BY p.created_at DESC`,
    [userId, userId]
  );
  return rows;
}

export async function isManager(projectId, userId) {
  const [rows] = await pool.execute(
    `SELECT 1
     FROM project_managers
     WHERE project_id = ? AND user_id = ?
     LIMIT 1`,
    [projectId, userId]
  );
  return rows.length > 0;
}

export async function create({ projectName, clientName, monthlyHourCap, createdBy }) {
  const [result] = await pool.execute(
    `INSERT INTO projects (project_name, client_name, monthly_hour_cap, created_by)
     VALUES (?, ?, ?, ?)`,
    [projectName, clientName, monthlyHourCap, createdBy]
  );
  return findById(result.insertId);
}

export async function update(id, { projectName, clientName, monthlyHourCap }) {
  const fields = [];
  const values = [];

  if (projectName !== undefined) {
    fields.push('project_name = ?');
    values.push(projectName);
  }

  if (clientName !== undefined) {
    fields.push('client_name = ?');
    values.push(clientName);
  }

  if (monthlyHourCap !== undefined) {
    fields.push('monthly_hour_cap = ?');
    values.push(monthlyHourCap);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  values.push(id);

  await pool.execute(
    `UPDATE projects
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.execute(
    `DELETE FROM projects WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function getManagers(projectId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email
     FROM project_managers pm
     INNER JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = ?`,
    [projectId]
  );
  return rows;
}

export async function assignManager({ projectId, userId, assignedBy }) {
  await pool.execute(
    `INSERT INTO project_managers (project_id, user_id, assigned_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by), assigned_at = CURRENT_TIMESTAMP`,
    [projectId, userId, assignedBy]
  );
}
