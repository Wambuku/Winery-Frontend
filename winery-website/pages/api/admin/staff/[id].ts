import { NextApiRequest, NextApiResponse } from 'next';

// This would be imported from the staff.ts file or a shared data store
// For now, we'll use a simple mock that matches the structure
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
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid staff ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'PATCH':
      return handlePatch(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const staff = mockStaff.find(s => s.id === id);
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function handlePatch(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const staffIndex = mockStaff.findIndex(s => s.id === id);
    
    if (staffIndex === -1) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const { name, email, role, permissions, isActive } = req.body;

    // Update staff member
    const updatedStaff = {
      ...mockStaff[staffIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      ...(permissions && { permissions }),
      ...(typeof isActive === 'boolean' && { isActive }),
    };

    mockStaff[staffIndex] = updatedStaff;

    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const staffIndex = mockStaff.findIndex(s => s.id === id);
    
    if (staffIndex === -1) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Remove staff member
    mockStaff.splice(staffIndex, 1);

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}