'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Phone, Lock, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authenticateUser } from '@/lib/db/db';
import { useRole } from '@/components/context/RoleContext';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useRole();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your registered email/mobile number and password or PIN.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        setCurrentUser(data.user);
        if (data.user.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          router.push('/survey');
        }
      } else {
        // Fallback to local authentication helper if offline
        const localUser = authenticateUser(identifier, password);
        if (localUser) {
          setCurrentUser(localUser);
          if (localUser.role === 'ADMIN') {
            router.push('/dashboard');
          } else {
            router.push('/survey');
          }
        } else {
          setError(data.error || 'Invalid Email / Mobile Number or Password. Please verify your credentials.');
        }
      }
    } catch (err) {
      // Local fallback
      const localUser = authenticateUser(identifier, password);
      if (localUser) {
        setCurrentUser(localUser);
        if (localUser.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          router.push('/survey');
        }
      } else {
        setError('Network authentication error. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>GROVASTRA ENTERPRISE PORTAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Sign In to Account</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
          Enter your authorized credentials to access product discovery, shop surveys, and analytics.
        </p>
      </div>

      {/* Main Login Form Card */}
      <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-dark-600 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            {/* Email / Mobile Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email or Registered Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                  placeholder="name@grovastra.com or 9876543210"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-indigo-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-dark-900 border border-dark-600 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-dark-700/60 text-center">
          <p className="text-[11px] text-slate-500">
            Protected by Grovastra Role-Based Access Control System.
          </p>
        </div>
      </div>
    </div>
  );
}
