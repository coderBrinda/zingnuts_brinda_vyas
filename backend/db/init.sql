-- Legacy manual setup script.
-- Prefer automatic migrations on server start (see db/migrations/ and src/database/migration.runner.js).

CREATE DATABASE IF NOT EXISTS pm_tracker;
USE pm_tracker;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name) VALUES ('admin'), ('pm'), ('member')
ON DUPLICATE KEY UPDATE name = name;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO users (name, email, password, role_id) VALUES
  ('Admin User', 'admin@example.com', '$2b$10$ZrJH9XNc4ChxJHNG0nbdPexd3fc2j.1DFG87/.VrJ0mthajcBKtYS', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)),
  ('Brinda Vyas', 'pm@example.com', '$2b$10$Vr7L42MJaMwY3vYvNlJWYuT7377y0TUDsJL8Mxtw7PAeGyJcC5G/S', (SELECT id FROM roles WHERE name = 'pm' LIMIT 1)),
  ('John Member', 'member@example.com', '$2b$10$KBBs/znCrhBCQtpB45S71uGTYSuuHCu1JMUAApx4Mn2qNHEKg1LL6', (SELECT id FROM roles WHERE name = 'member' LIMIT 1))
ON DUPLICATE KEY UPDATE email = email;
