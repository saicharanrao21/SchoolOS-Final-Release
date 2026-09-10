import React from 'react';
import { Save, Shield, Globe, Bell, Wallet, BookOpen, Truck, Building } from 'lucide-react';

export default function SettingsPage() {
  const categories = [
    { name: 'General', icon: Globe, description: 'Branding, timezone and localization' },
    { name: 'Academic', icon: BookOpen, description: 'Grading systems and class rules' },
    { name: 'Finance', icon: Wallet, description: 'Currency and payment gateways' },
    { name: 'Transport', icon: Truck, description: 'Route tracking and vehicle rules' },
    { name: 'Security', icon: Shield, description: 'Session timeouts and audit levels' },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">School Settings</h1>
        <p className="text-text-secondary">Configure institutional preferences and global rules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          {categories.map((cat, i) => (
            <button key={cat.name} className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
              i === 0 ? 'bg-white shadow-sm border border-surface-border text-primary' : 'text-text-secondary hover:bg-white/50'
            }`}>
              <cat.icon className="w-5 h-5" />
              <div>
                <p className="text-sm font-bold">{cat.name}</p>
                <p className="text-[10px] font-medium opacity-80">{cat.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-card shadow-card border border-surface-border p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              General Configuration
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Official School Name</label>
                  <input type="text" defaultValue="St. Mary's High School" className="w-full px-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Registration Code</label>
                  <input type="text" defaultValue="SMHS-UK-2024" className="w-full px-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Primary Timezone</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                    <option>GMT (London)</option>
                    <option>IST (New Delhi)</option>
                    <option>EST (New York)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary">Default Currency</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-surface-border focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm">
                    <option>GBP (£)</option>
                    <option>USD ($)</option>
                    <option>INR (₹)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-surface-border flex justify-end">
                <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-button font-bold transition-all shadow-md active:scale-95">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
