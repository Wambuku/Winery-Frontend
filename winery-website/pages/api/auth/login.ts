// Login API route

import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '../../../utils/middleware';
import { verifyPassword, createAuthToken } from '../../../utils/auth';
import { isValidEmail, isValidPassword } from '../../../utils/validation';
import { ApiResponse, AuthToken, User } from '../../../types';

// Mock user database - replace with actual database in production
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@winery.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
  },
  {
    id: '2',
    email: 'staff@winery.com',
    name: 'Staff User',
    role: 'staff',
    createdAt: new Date('2024-01-01'),
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
  },
  {
    id: '3',
    email: 'customer@example.com',
    name: 'Customer User',
    role: 'customer',
    createdAt: new Date('2024-01-01'),
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', // password123
  },
];

async function loginHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AuthToken>>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    });
  }

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Email and password are required',
      },
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_EMAIL',
        message: 'Please provide a valid email address',
      },
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PASSWORD',
        message: 'Password must be at least 8 characters long',
      },
    });
  }

  // Find user
  const userWithPassword = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!userWithPassword) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, userWithPassword.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      },
    });
  }

  // Create user object without password
  const { password: _, ...user } = userWithPassword;

  // Generate auth token
  const authToken = createAuthToken(user);

  res.status(200).json({
    success: true,
    data: authToken,
  });
}

export default withErrorHandler(loginHandler);