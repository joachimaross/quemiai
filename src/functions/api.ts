import express from 'express';
import serverless from 'serverless-http';
import apiRouter from '../api';
import { errorHandler } from '../middleware/errorHandler';

const app = express();

app.get('/.netlify/functions/api', (req, res) => {
  res.send('Welcome to the Joachima Social App API! Visit /api/v1 for the main API routes.');
});

app.use(express.json());
app.use('/.netlify/functions/api/v1', apiRouter);

// Error handling middleware
app.use(errorHandler);

export const handler = serverless(app);
