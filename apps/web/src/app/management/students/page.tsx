import React from 'react';
import { Plus, Search, Filter, MoreVertical, UserPlus, UserCheck, UserMinus, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const stats = [
    { label: 'Total Students', value: '1,248', icon: GraduationCap, color: 'bg-blue-600' },
    { label: 'Active', value: '1,180', icon: UserCheck, color: 'bg-green-500' },
    { label: 'New Admissions', value: '45', icon: UserPlus, color: 'bg-purple-500' },
    { label: 'Withdrawn', value: '12', icon: UserMinus, color: 'bg-red-500' },
  ];

  const students = [
    { id: '1', name: 'Alice Johnson', admissionNo: 'GA260001', class: 'Grade 10', section: 'A', guardian: 'Robert Johnson', status: 'ACTIVE' },
    { id: '2', name: 'Michael Chen', admissionNo: 'GA260002', class: 'Grade 10', section: 'B', guardian: 'Li Chen', status: 'ACTIVE' },
    { id: '3', name: 'Sarah Williams', admissionNo: 'GA260003', class: 'Grade 9', section: 'A', guardian: 'Mark Williams', status: 'INACTIVE' },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-600';
      case 'APPLICANT': return 'bg-blue-100 text-blue-600';
      case 'WITHDRAWN': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Student Management</h1>
          <p className="text-text-secondary">Comprehensive lifecycle tracking for all students</p>
        </div>
        <Link href="/management/students/new">
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Admit Student</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-card shadow-card border border-surface-border flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden">
        <div className="p-4 border-b border-surface-border flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, ID, or guardian..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border border-surface-border rounded-lg text-sm font-medium bg-white text-text-secondary outline-none">
              <option>All Classes</option>
              <option>Grade 10</option>
              <option>Grade 9</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-background transition-colors">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-surface-background text-text-muted text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Admission No.</th>
              <th className="px-6 py-4">Class/Section</th>
              <th className="px-6 py-4">Primary Guardian</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-bold text-text-primary text-sm">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs font-bold text-text-secondary bg-surface-background px-2 py-1 rounded border border-surface-border">{student.admissionNo}</code>
                </td>
                <td className="px-6 py-4 text-sm text-text-primary font-medium">
                  {student.class} • <span className="text-primary font-bold">{student.section}</span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {student.guardian}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${getStatusStyle(student.status)}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/management/students/${student.id}`} className="p-2 hover:bg-primary/10 rounded-lg text-primary opacity-0 group-hover:opacity-100 transition-all">
                      <Search className="w-4 h-4" />
                    </Link>
                    <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-surface-background flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">Showing 1 to 3 of 1,248 students</span>
          <div className="flex gap-2">
            <button disabled className="px-4 py-2 rounded-lg border border-surface-border text-xs font-bold bg-white text-text-muted disabled:opacity-50">Previous</button>
            <button className="px-4 py-2 rounded-lg border border-surface-border text-xs font-bold bg-white text-text-primary hover:bg-surface-background">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
