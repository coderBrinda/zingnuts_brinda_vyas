import pool from '../config/db.js';

export async function assignMember({ projectId, userId, assignedBy }) {
  await pool.execute(
    `INSERT INTO project_members (project_id, user_id, assigned_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by), assigned_at = CURRENT_TIMESTAMP`,
    [projectId, userId, assignedBy]
  );
}

export async function removeMember({ projectId, userId }) {
  const [result] = await pool.execute(
    `DELETE FROM project_members
     WHERE project_id = ? AND user_id = ?`,
    [projectId, userId]
  );
  return result.affectedRows > 0;
}

export async function getMembers(projectId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, pm.assigned_at
     FROM project_members pm
     INNER JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = ?
     ORDER BY u.name ASC`,
    [projectId]
  );
  return rows;
}

export async function isMember(projectId, userId) {
  const [rows] = await pool.execute(
    `SELECT 1
     FROM project_members
     WHERE project_id = ? AND user_id = ?
     LIMIT 1`,
    [projectId, userId]
  );
  return rows.length > 0;
}

export async function getMemberCount(projectId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS count
     FROM project_members
     WHERE project_id = ?`,
    [projectId]
  );
  return rows[0].count;
}
