import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { sendSuccess, sendError } from './utils/response.js';
import { testConnection } from './config/db.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    return sendSuccess(res, 200, { status: 'ok', database: 'connected' });
  } catch {
    return sendError(res, 503, 'Database unavailable', 'SERVICE_UNAVAILABLE');
  }
});

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
