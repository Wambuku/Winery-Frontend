// Authentication middleware for API routes

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader, hasPermission } from './auth';
import { ApiError } from '../types';

// Extended request interface with user data
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Authentication middleware
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        const error: ApiError = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication token required',
          },
        };
        return res.status(401).json(error);
      }

      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      return handler(req, res);
    } catch (error) {
      const apiError: ApiError = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      };
      return res.status(401).json(apiError);
    }
  };
}

// Role-based authorization middleware
export function withRole(
  requiredRoles: string[],
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      };
      return res.status(401).json(error);
    }

    if (!hasPermission(req.user.role, requiredRoles)) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      };
      return res.status(403).json(error);
    }

    return handler(req, res);
  });
}

// Staff-only middleware
export function withStaff(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withRole(['staff', 'admin'], handler);
}

// Admin-only middleware
export function withAdmin(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void
) {
  return withRole(['admin'], handler);
}

// Error handler middleware
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      
      const apiError: ApiError = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error : undefined,
        },
      };
      
      res.status(500).json(apiError);
    }
  };
}