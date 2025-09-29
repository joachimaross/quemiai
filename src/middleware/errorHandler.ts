import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let errorResponse: {
    status: string;
    message: string;
    stack?: string;
    error?: ErrorWithStatus;
  } = {
    status: err.status,
    message: err.message,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
    errorResponse = {
      ...errorResponse,
      stack: err.stack,
      error: err,
    };
    res.status(err.statusCode).json(errorResponse);
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json(errorResponse);
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};
