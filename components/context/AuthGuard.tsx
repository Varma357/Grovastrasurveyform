'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from './RoleContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, isMounted } = useRole();

  const isPublicRoute = pathname === '/login';

  useEffect(() => {
    if (!isMounted) return;

    // 1. Unauthenticated users visiting protected routes -> redirect to /login
    if (!currentUser && !isPublicRoute) {
      router.replace('/login');
      return;
    }

    // 2. Authenticated users visiting /login -> redirect to home page based on role
    if (currentUser && isPublicRoute) {
      if (currentUser.role === 'ADMIN') {
        router.replace('/dashboard');
      } else {
        router.replace('/survey');
      }
      return;
    }

    // 3. RBAC check for Interviewers attempting to access Admin routes
    if (currentUser && role === 'INTERVIEWER') {
      if (pathname.startsWith('/admin') || pathname === '/exports') {
        router.replace('/survey');
      }
    }
  }, [pathname, currentUser, role, isMounted, isPublicRoute, router]);

  // Loading spinner while mounting or evaluating auth state
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400">Loading Grovastra Application...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated user on public route (/login) -> Render standalone page without shell
  if (!currentUser && isPublicRoute) {
    return <main className="min-h-screen bg-dark-900 text-slate-100 flex items-center justify-center p-4">{children}</main>;
  }

  // Unauthenticated user on protected route -> Show spinner while redirecting to /login
  if (!currentUser && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400">Redirecting to Login...</p>
        </div>
      </div>
    );
  }

  // Authenticated user on /login -> Show spinner while redirecting
  if (currentUser && isPublicRoute) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Authenticated user on protected route -> Render complete application layout shell
  return (
    <div className="flex flex-col min-h-screen bg-dark-900 text-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

