INSERT INTO roles (name) VALUES ('admin'), ('pm'), ('member')
ON DUPLICATE KEY UPDATE name = name;
