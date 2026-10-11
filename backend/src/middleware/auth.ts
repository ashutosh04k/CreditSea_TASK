import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'lms-secret-key-eval-2026';

export const generateToken = (payload: { id: string; email: string; role: UserRole; name: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token.' });
  }
};

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Admin has access to all executive endpoints
    if (req.user.role === 'Admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};
