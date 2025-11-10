'use client';

import React, { useMemo, useState } from 'react';
import type { StaffMember } from '../../lib/types/admin';

interface StaffManagementPanelProps {
  staff: StaffMember[];
}

const roleLabels: Record<StaffMember['role'], string> = {
  sommelier: 'Sommelier',
  cashier: 'POS cashier',
  inventory: 'Inventory lead',
  manager: 'Operations manager',
};

export default function StaffManagementPanel({ staff }: StaffManagementPanelProps) {
  const [selectedRole, setSelectedRole] = useState<'all' | StaffMember['role']>('all');

  const filteredStaff = useMemo(() => {
    if (selectedRole === 'all') return staff;
    return staff.filter((member) => member.role === selectedRole);
  }, [staff, selectedRole]);

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow shadow-black/30">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">Team performance</p>
          <h2 className="text-lg font-semibold text-white">Staff management</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="staff-role-filter">
            Filter staff by role
          </label>
          <select
            id="staff-role-filter"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as typeof selectedRole)}
            className="rounded-full border border-white/10 bg-black/60 px-3 py-2 text-xs uppercase tracking-wide text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
          >
            <option value="all">All roles</option>
            <option value="manager">Operations managers</option>
            <option value="sommelier">Sommeliers</option>
            <option value="inventory">Inventory specialists</option>
            <option value="cashier">POS cashiers</option>
          </select>
        </div>
      </header>

      <ul className="space-y-3" role="list">
        {filteredStaff.map((member) => (
          <li
            key={member.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-lg">
                <span aria-hidden>{member.avatarUrl ? '👤' : '🧑'}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{member.name}</p>
                <p className="text-xs text-white/50">{roleLabels[member.role]}</p>
              </div>
            </div>

            <div className="grid gap-2 text-xs uppercase tracking-wide text-white/50 sm:grid-cols-3">
              <div>
                <p className="text-white/60">Performance</p>
                <p className="text-sm font-semibold text-white">{member.performanceScore}%</p>
              </div>
              <div>
                <p className="text-white/60">Active shifts</p>
                <p className="text-sm font-semibold text-white">{member.activeShifts}</p>
              </div>
              <div>
                <p className="text-white/60">Last login</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(member.lastLogin).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {member.specialties.map((specialty) => (
                <span key={specialty} className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                  {specialty}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
