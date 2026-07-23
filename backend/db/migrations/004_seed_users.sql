INSERT INTO users (name, email, password, role_id) VALUES
  ('Admin User', 'admin@example.com', '$2b$10$ZrJH9XNc4ChxJHNG0nbdPexd3fc2j.1DFG87/.VrJ0mthajcBKtYS', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)),
  ('Brinda Vyas', 'pm@example.com', '$2b$10$Vr7L42MJaMwY3vYvNlJWYuT7377y0TUDsJL8Mxtw7PAeGyJcC5G/S', (SELECT id FROM roles WHERE name = 'pm' LIMIT 1)),
  ('John Member', 'member@example.com', '$2b$10$KBBs/znCrhBCQtpB45S71uGTYSuuHCu1JMUAApx4Mn2qNHEKg1LL6', (SELECT id FROM roles WHERE name = 'member' LIMIT 1))
ON DUPLICATE KEY UPDATE email = email;
