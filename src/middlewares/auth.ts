import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinproduction';

// Extend Request interface locally for typings validation
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'user';
  };
}

// 1. Authentication Guard Middleware
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Read token from HTTP-only cookie
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: 'admin' | 'user' };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Access Denied: Invalid or expired authentication token.' });
  }
};

// 2. Role-Based Access Control (RBAC) Middleware Builder
export const requireRole = (allowedRoles: ('admin' | 'user')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access Denied: Unauthorized request.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access Denied: Access restricted to roles: [${allowedRoles.join(', ')}]` });
    }

    next();
  };
};
