import React from 'react';
import { Plus, Search, Filter, School, MapPin, MoreVertical, Globe, Phone, Mail } from 'lucide-react';

export default function SchoolsPage() {
  const schools = [
    {
      name: 'St. Mary\'s High School',
      code: 'SMHS-01',
      address: 'Central Square, London',
      campuses: 2,
      status: 'Active',
      type: 'Secondary',
      phone: '+44 20 1234 5678',
      email: 'admin@stmarys.edu'
    },
    {
      name: 'Oakridge International',
      code: 'OAK-05',
      address: 'Silicon Valley, CA',
      campuses: 3,
      status: 'Active',
      type: 'International',
      phone: '+1 415 987 6543',
      email: 'info@oakridge.edu'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Schools</h1>
          <p className="text-text-secondary">Manage educational institutions within your organization</p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
          <Plus className="w-5 h-5" />
          <span>Add School</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schools.map((school) => (
          <div key={school.code} className="bg-white rounded-card shadow-card border border-surface-border overflow-hidden group hover:border-primary/30 transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-light rounded-xl flex items-center justify-center text-secondary">
                    <School className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{school.name}</h3>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{school.code} • {school.type}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-surface-background rounded-full text-text-muted transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 text-text-muted" />
                  <span>{school.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <span>{school.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <span>{school.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-surface-border">
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-text-primary">{school.campuses}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Campuses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-text-primary">1.2k</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Students</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-600 rounded-full">{school.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
