// Unit tests for authentication utilities

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  extractTokenFromHeader,
  createAuthToken,
  isTokenExpired,
  hasRole,
  hasPermission,
} from '../../utils/auth';
import { User } from '../../types';

describe('Authentication Utilities', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'customer',
    createdAt: new Date(),
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUser.id);
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow('Invalid or expired token');
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);
      
      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashed);
      
      expect(isValid).toBe(false);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = 'abc123';
      const header = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(header);
      
      expect(extracted).toBe(token);
    });

    it('should return null for invalid header format', () => {
      expect(extractTokenFromHeader('Invalid header')).toBeNull();
      expect(extractTokenFromHeader('Token abc123')).toBeNull();
      expect(extractTokenFromHeader('')).toBeNull();
    });

    it('should return null for undefined header', () => {
      expect(extractTokenFromHeader(undefined)).toBeNull();
    });
  });

  describe('createAuthToken', () => {
    it('should create auth token object', () => {
      const authToken = createAuthToken(mockUser);
      
      expect(authToken).toHaveProperty('token');
      expect(authToken).toHaveProperty('user');
      expect(authToken).toHaveProperty('expiresAt');
      expect(authToken.user).toEqual(mockUser);
      expect(authToken.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const token = generateToken(mockUser);
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });

    it('should return true for empty token', () => {
      expect(isTokenExpired('')).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('should allow same role access', () => {
      expect(hasRole('customer', 'customer')).toBe(true);
      expect(hasRole('staff', 'staff')).toBe(true);
      expect(hasRole('admin', 'admin')).toBe(true);
    });

    it('should allow higher role access', () => {
      expect(hasRole('staff', 'customer')).toBe(true);
      expect(hasRole('admin', 'customer')).toBe(true);
      expect(hasRole('admin', 'staff')).toBe(true);
    });

    it('should deny lower role access', () => {
      expect(hasRole('customer', 'staff')).toBe(false);
      expect(hasRole('customer', 'admin')).toBe(false);
      expect(hasRole('staff', 'admin')).toBe(false);
    });

    it('should handle invalid roles', () => {
      expect(hasRole('invalid', 'customer')).toBe(false);
      expect(hasRole('customer', 'invalid')).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should allow access if user has any required role', () => {
      expect(hasPermission('admin', ['customer', 'staff'])).toBe(true);
      expect(hasPermission('staff', ['customer', 'staff'])).toBe(true);
      expect(hasPermission('customer', ['customer'])).toBe(true);
    });

    it('should deny access if user lacks all required roles', () => {
      expect(hasPermission('customer', ['staff', 'admin'])).toBe(false);
    });

    it('should handle empty required roles array', () => {
      expect(hasPermission('customer', [])).toBe(false);
    });
  });
});