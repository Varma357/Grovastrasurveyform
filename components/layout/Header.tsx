'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRole } from '../context/RoleContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, UserCheck, Sparkles, Sun, Moon, LogOut, LogIn, Users } from 'lucide-react';
import { UserRole } from '@/lib/types';

export function Header() {
  const router = useRouter();
  const { role, setRole, currentUser, userEmail, logout } = useRole();
  const { theme, toggleTheme } = useTheme();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-800/90 backdrop-blur-md border-b border-dark-600 px-4 py-3 flex items-center justify-between">
      {/* Brand logo & title */}
      <Link href="/dashboard" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              GROVASTRA
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Product Discovery Platform
            </span>
          </div>
          <p className="text-xs text-slate-400">Saree Shop Market Research & Decision Support System</p>
        </div>
      </Link>

      {/* Right controls & Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-dark-900 hover:bg-dark-700 border border-dark-600 text-slate-300 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Role Selector */}
        <div className="flex items-center space-x-2 bg-dark-900 border border-dark-600 px-3 py-1.5 rounded-xl text-xs">
          {role === 'ADMIN' && <Shield className="w-4 h-4 text-indigo-400 shrink-0" />}
          {role === 'INTERVIEWER' && <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />}

          <select
            value={role}
            onChange={handleRoleChange}
            className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ADMIN" className="bg-dark-800 text-white">ADMIN</option>
            <option value="INTERVIEWER" className="bg-dark-800 text-white">INTERVIEWER</option>
          </select>
        </div>

        {/* User Profile & Auth Button */}
        {currentUser ? (
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{currentUser.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-dark-900 hover:bg-rose-950/40 hover:text-rose-400 border border-dark-600 rounded-xl text-xs text-slate-400 flex items-center space-x-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
