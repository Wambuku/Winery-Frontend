import { NextApiRequest, NextApiResponse } from 'next';

// Mock staff data - In a real application, this would come from your database
let mockStaff = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@winestore.com',
    role: 'admin' as const,
    permissions: ['manage_inventory', 'process_sales', 'view_reports', 'manage_orders', 'manage_customers', 'manage_staff', 'system_admin'],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-10-29T08:30:00Z',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@winestore.com',
    role: 'staff' as const,
    permissions: ['manage_inventory', 'process_sales', 'view_reports'],
    isActive: true,
    createdAt: '2024-02-20T14:00:00Z',
    lastLogin: '2024-10-28T16:45:00Z',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@winestore.com',
    role: 'staff' as const,
    permissions: ['process_sales', 'manage_orders'],
    isActive: true,
    createdAt: '2024-03-10T09:00:00Z',
    lastLogin: '2024-10-29T07:15:00Z',
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@winestore.com',
    role: 'staff' as const,
    permissions: ['manage_inventory', 'view_reports'],
    isActive: false,
    createdAt: '2024-01-25T11:00:00Z',
    lastLogin: '2024-10-15T12:00:00Z',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Query your database for staff members
    // 3. Apply any filtering or sorting

    res.status(200).json(mockStaff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, email, role, permissions } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    // Check if email already exists
    const existingStaff = mockStaff.find(staff => staff.email === email);
    if (existingStaff) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create new staff member
    const newStaff = {
      id: (mockStaff.length + 1).toString(),
      name,
      email,
      role,
      permissions: permissions || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
    };

    mockStaff.push(newStaff);

    res.status(201).json(newStaff);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}