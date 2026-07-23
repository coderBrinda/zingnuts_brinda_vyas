import pool from '../config/db.js';

const ENTRY_SELECT = `
  te.id,
  te.project_id,
  te.user_id,
  te.entry_date,
  te.hours,
  te.note,
  te.created_at,
  te.updated_at,
  u.name AS user_name
`;

export async function create({ projectId, userId, entryDate, hours, note }) {
  const [result] = await pool.execute(
    `INSERT INTO time_entries (project_id, user_id, entry_date, hours, note)
     VALUES (?, ?, ?, ?, ?)`,
    [projectId, userId, entryDate, hours, note ?? null]
  );
  return findById(result.insertId);
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${ENTRY_SELECT}
     FROM time_entries te
     INNER JOIN users u ON te.user_id = u.id
     WHERE te.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function findByProject({ projectId, startDate, endDate, userId }) {
  const conditions = ['te.project_id = ?'];
  const values = [projectId];

  if (startDate && endDate) {
    conditions.push('te.entry_date BETWEEN ? AND ?');
    values.push(startDate, endDate);
  }

  if (userId) {
    conditions.push('te.user_id = ?');
    values.push(userId);
  }

  const [rows] = await pool.execute(
    `SELECT ${ENTRY_SELECT}
     FROM time_entries te
     INNER JOIN users u ON te.user_id = u.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY te.entry_date DESC, te.created_at DESC`,
    values
  );
  return rows;
}

export async function sumHoursForProjectMonth(projectId, startDate, endDate) {
  const [rows] = await pool.execute(
    `SELECT COALESCE(SUM(hours), 0) AS total_hours
     FROM time_entries
     WHERE project_id = ?
       AND entry_date BETWEEN ? AND ?`,
    [projectId, startDate, endDate]
  );
  return Number(rows[0].total_hours);
}

export async function update(id, { entryDate, hours, note }) {
  const fields = [];
  const values = [];

  if (entryDate !== undefined) {
    fields.push('entry_date = ?');
    values.push(entryDate);
  }

  if (hours !== undefined) {
    fields.push('hours = ?');
    values.push(hours);
  }

  if (note !== undefined) {
    fields.push('note = ?');
    values.push(note);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  values.push(id);

  await pool.execute(
    `UPDATE time_entries
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.execute(
    `DELETE FROM time_entries WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}
