import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import apiRouter from '../api';
import { errorHandler } from '../middleware/errorHandler';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger';

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins for now
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Swagger API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to the Joachima Social App API! Visit /api/v1 for the main API routes.');
});

app.use(express.json());
app.use('/api/v1', apiRouter);

// Error handling middleware
app.use(errorHandler);

export const handler = serverless(app);
