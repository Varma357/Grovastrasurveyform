'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Phone, Lock, ArrowRight, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import { authenticateUser, getAllEmployees } from '@/lib/db/db';
import { useRole } from '@/components/context/RoleContext';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useRole();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your email/mobile number and password.');
      return;
    }

    setIsSubmitting(true);
    const user = authenticateUser(identifier, password);

    if (user) {
      setCurrentUser(user);
      if (user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/survey');
      }
    } else {
      setError('Invalid Email / Mobile Number or Password. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (empEmail: string, pass: string) => {
    setIdentifier(empEmail);
    setPassword(pass);
    const user = authenticateUser(empEmail, pass);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/survey');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl shadow-2xl border border-dark-600">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>GROVASTRA AUTHENTICATION</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Team Sign In</h2>
          <p className="text-xs text-slate-400">
            Enter your Gmail address or registered mobile number to access the survey portal & dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email / Gmail or Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {identifier.includes('@') ? (
                    <Mail className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Phone className="w-4 h-4 text-indigo-400" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@grovastra.com or 9876543210"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-indigo-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Sign In Shortcuts */}
        <div className="border-t border-dark-600 pt-5 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Quick Demo Sign In
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('admin@grovastra.com', 'admin')}
              className="p-2.5 bg-dark-900 hover:bg-dark-700 border border-dark-600 rounded-xl text-left text-xs space-y-0.5"
            >
              <div className="font-bold text-white flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sai Varma</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Role: ADMIN</div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('interviewer@grovastra.com', '123')}
              className="p-2.5 bg-dark-900 hover:bg-dark-700 border border-dark-600 rounded-xl text-left text-xs space-y-0.5"
            >
              <div className="font-bold text-white flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ramesh Kumar</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Role: INTERVIEWER</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
