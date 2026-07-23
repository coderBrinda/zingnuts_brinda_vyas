import dotenv from 'dotenv';
import app from './app.js';
import { runMigrations } from './database/migration.runner.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  await runMigrations();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
