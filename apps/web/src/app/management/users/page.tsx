import React from 'react';
import { Plus, Search, Filter, MoreVertical, Shield } from 'lucide-react';

export default function UsersPage() {
  const users = [
    { name: 'Admin User', email: 'admin@schoolos.com', roles: ['SUPER_ADMIN'], status: 'Active', lastLogin: '2 mins ago' },
    { name: 'John Doe', email: 'john@global.com', roles: ['OWNER', 'PRINCIPAL'], status: 'Active', lastLogin: '1 hour ago' },
    { name: 'Sarah Smith', email: 'sarah@global.com', roles: ['TEACHER'], status: 'Pending', lastLogin: 'Never' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-600 border-red-200';
      case 'OWNER': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'PRINCIPAL': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary">Control system access and permissions</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Invite User</span>
        </button>
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-background transition-colors">
              <Shield className="w-4 h-4" />
              <span>Roles</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-background transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-surface-background text-text-muted text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Roles</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {users.map((user) => (
              <tr key={user.email} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary leading-tight">{user.name}</p>
                      <p className="text-sm text-text-muted">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                      <span key={role} className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${getRoleColor(role)}`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-muted">{user.lastLogin}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
