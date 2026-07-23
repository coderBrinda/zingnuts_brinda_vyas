CREATE TABLE IF NOT EXISTS project_managers (
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  assigned_by INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, user_id),
  CONSTRAINT fk_project_managers_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_managers_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_project_managers_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id)
);
