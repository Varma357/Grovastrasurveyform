'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '../context/RoleContext';
import {
  LayoutDashboard,
  ClipboardList,
  FileSpreadsheet,
  HelpCircle,
  FileText,
  UserCheck,
  Shield,
  Store,
  Users,
  Menu,
  X,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminMenuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Surveys / Records', href: '/interviews', icon: FileSpreadsheet },
    { label: 'Team & Performance', href: '/admin/team', icon: Users },
    { label: 'Question Bank', href: '/admin/questions', icon: HelpCircle },
    { label: 'Executive Report', href: '/reports', icon: FileText },
  ];

  const interviewerMenuItems = [
    { label: 'New Survey', href: '/survey', icon: ClipboardList },
    { label: 'My Surveys', href: '/interviews', icon: FileSpreadsheet },
    { label: 'Shop Reports', href: '/reports/shop', icon: Store },
  ];

  const menuItems = role === 'ADMIN' ? adminMenuItems : interviewerMenuItems;

  return (
    <>
      {/* Mobile Menu Toggle Button (Floating / Fixed on small screens) */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center border border-indigo-400/30"
          aria-label="Toggle Mobile Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-dark-800 border-r border-dark-600 z-50 transform transition-transform duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-dark-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-base">Navigation</span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {role}
            </span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-dark-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Sidebar (hidden on mobile, visible on md: flex) */}
      <aside className="hidden md:flex w-64 bg-dark-800 border-r border-dark-600 flex-col h-[calc(100vh-65px)] sticky top-[65px] shrink-0">
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {role} Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-dark-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Role & Auth Footer */}
        <div className="p-3 border-t border-dark-600 bg-dark-900/50 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
            <div className="font-semibold text-indigo-300 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {role === 'ADMIN' ? <Shield className="w-3.5 h-3.5 text-indigo-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Role: {role}</span>
              </div>
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              {role === 'ADMIN' ? 'Analytics, Team Management & Reports' : 'Field Surveys & Shop Reports'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
