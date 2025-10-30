// JWT authentication utilities

import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { User, AuthToken } from '../types';

// JWT token generation
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const secret = config.auth.jwtSecret;
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// JWT token verification
export function verifyToken(token: string): any {
  try {
    const secret = config.auth.jwtSecret;
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Create auth token object
export function createAuthToken(user: User): AuthToken {
  const token = generateToken(user);
  const decoded = jwt.decode(token) as any;
  
  return {
    token,
    user,
    expiresAt: new Date(decoded.exp * 1000),
  };
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

// Role-based access control helpers
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    customer: 0,
    staff: 1,
    admin: 2,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 999;

  return userLevel >= requiredLevel;
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.some(role => hasRole(userRole, role));
}