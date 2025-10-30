// Logout API route

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../../utils/middleware';
import { ApiResponse } from '../../../types';

async function logoutHandler(req: AuthenticatedRequest, res: NextApiResponse<ApiResponse<{ message: string }>>) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed',
      },
    });
  }

  // In a real application, you might want to:
  // 1. Add the token to a blacklist
  // 2. Clear server-side session data
  // 3. Log the logout event

  res.status(200).json({
    success: true,
    data: {
      message: 'Successfully logged out',
    },
  });
}

export default withAuth(logoutHandler);