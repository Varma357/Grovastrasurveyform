'use client';

import React from 'react';
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
  LogIn,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { role, currentUser } = useRole();

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
    <aside className="w-64 bg-dark-800 border-r border-dark-600 flex flex-col h-[calc(100vh-65px)] sticky top-[65px] shrink-0">
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
  );
}
