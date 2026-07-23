# Database Migrations

Migrations run automatically when the server starts (`src/index.js`).

## How it works

1. Creates database `pm_tracker` if it does not exist
2. Creates `schema_migrations` table to track applied migrations
3. Runs each `.sql` file in this folder **once**, in filename order
4. Skips migrations already recorded in `schema_migrations`
5. **Never drops** existing tables

## Current migrations

| File | Description |
|------|-------------|
| `001_create_roles_table.sql` | Creates `roles` table |
| `002_create_users_table.sql` | Creates `users` table |
| `003_seed_roles.sql` | Seeds admin, pm, member roles |
| `004_seed_users.sql` | Seeds default users |
| `005_create_projects_table.sql` | Creates `projects` table |
| `006_create_project_managers_table.sql` | Creates `project_managers` table |

## Add a new table

Create the next numbered file, e.g. `005_create_projects_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ...
);
```

Restart the server — only the new migration will run.

## Manual init (optional)

`db/init.sql` is kept for manual setup only. Normal flow uses migrations on startup.
