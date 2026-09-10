import React from 'react';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-card border border-surface-border p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">SchoolOS</h1>
          <p className="text-text-secondary mt-2">Sign in to your enterprise portal</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Email Address</label>
            <input
              type="email"
              placeholder="name@school.com"
              className="w-full px-4 py-3 rounded-input border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-sm font-semibold text-text-primary">Password</label>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">Forgot?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-input border border-surface-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-button shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
            Sign In
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-text-muted">
            Authorized personnel only. Your access is audited.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-text-muted">
        &copy; 2026 SchoolOS Enterprise. All rights reserved.
      </p>
    </div>
  );
}
