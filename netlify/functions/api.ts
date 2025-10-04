/**
 * Netlify Function: API Gateway
 * 
 * This serverless function wraps the existing Express-based API
 * from the backend application for Netlify deployment.
 * 
 * All requests to /api/* are routed through this function.
 */

import serverless from 'serverless-http';
import app from '../../apps/backend/src/functions/api';

// Export the handler for Netlify Functions
export const handler = serverless(app);
