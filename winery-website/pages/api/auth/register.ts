// Register API route

import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandler } from '../../../utils/middleware';
import { hashPassword, createAuthToken } from '../../../utils/auth';
import { isValidEmail, isValidPassword, isValidName } from '../../../utils/validation';
import { ApiResponse, AuthToken, User } from '../../../types';

// Mock user database - replace with actual database in production
const mockUsers: (User & { password: string })[] = [];

async function registerHandler(req: NextApiRequest, res: NextApiResponse<ApiResponse<AuthToken>>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    });
  }

  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'Name, email, and password are required',
      },
    });
  }

  if (!isValidName(name)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_NAME',
        message: 'Please provide a valid name',
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

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: 'A user with this email already exists',
      },
    });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  const newUser: User & { password: string } = {
    id: Date.now().toString(), // Simple ID generation - use UUID in production
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: 'customer', // Default role for new registrations
    createdAt: new Date(),
    password: hashedPassword,
  };

  // Add to mock database
  mockUsers.push(newUser);

  // Create user object without password
  const { password: _, ...user } = newUser;

  // Generate auth token
  const authToken = createAuthToken(user);

  res.status(201).json({
    success: true,
    data: authToken,
  });
}

export default withErrorHandler(registerHandler);