import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any;
  code?: number;
  path?: string;
  value?: string;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Central Auth API Error Captured:", err.message);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((val: any) => val.message).join(', ');
  }

  if (err.code === 11000) {
    status = 400;
    message = 'Duplicate Key Error: This email address is already registered.';
  }

  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Authentication Error: Invalid token payload signature.';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Authentication Error: Your session has expired. Please log in again.';
  }

  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString()
    }
  });
}
