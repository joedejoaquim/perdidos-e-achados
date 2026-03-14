'use client';

import { useState } from 'react';

interface RoleToggleProps {
  activeRole?: 'finder' | 'owner';
  onRoleChange?: (role: 'finder' | 'owner') => void;
}

export default function RoleToggle({
  activeRole = 'finder',
  onRoleChange,
}: RoleToggleProps) {
  const [role, setRole] = useState<'finder' | 'owner'>(activeRole);

  const handleRoleChange = (newRole: 'finder' | 'owner') => {
    setRole(newRole);
    if (onRoleChange) {
      onRoleChange(newRole);
    }
  };

  return (
    <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto md:mx-0">
      <button
        onClick={() => handleRoleChange('finder')}
        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
          role === 'finder'
            ? 'bg-white dark:bg-background-dark shadow-sm text-primary'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        Localizador
      </button>
      <button
        onClick={() => handleRoleChange('owner')}
        className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
          role === 'owner'
            ? 'bg-white dark:bg-background-dark shadow-sm text-primary'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        Proprietário
      </button>
    </div>
  );
}
