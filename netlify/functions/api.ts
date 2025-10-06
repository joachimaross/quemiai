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

// Configure serverless-http with options
const serverlessHandler = serverless(app, {
  // Binary media types that should not be base64 encoded
  binary: ['image/*', 'application/pdf', 'application/octet-stream'],
  // Request and response transformations
  request: (request: any) => {
    // Log incoming requests (optional, can be toggled via env var)
    if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
      console.log(`[${new Date().toISOString()}] ${request.method} ${request.path}`);
    }
    return request;
  }
});

// Export the handler with error handling wrapper
export const handler = async (event: any, context: any) => {
  try {
    // Set execution context for better debugging
    context.callbackWaitsForEmptyEventLoop = false;
    
    // Check for required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('[ERROR] Missing required environment variables:', missingVars.join(', '));
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Server configuration error. Please contact support.'
        })
      };
    }
    
    // Execute the handler with timeout monitoring
    const startTime = Date.now();
    const response = await serverlessHandler(event, context);
    const duration = Date.now() - startTime;
    
    // Log slow requests (over 5 seconds)
    if (duration > 5000) {
      console.warn(`[SLOW REQUEST] ${event.httpMethod} ${event.path} took ${duration}ms`);
    }
    
    return response;
  } catch (error: any) {
    // Log the error with stack trace
    console.error('[ERROR] Function execution failed:', {
      message: error.message,
      stack: error.stack,
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    });
    
    // Return a generic error response to avoid leaking internal details
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred. Please try again later.',
        // Include request ID if available for support tracking
        requestId: context.requestId || 'unknown'
      })
    };
  }
};
