'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from './RoleContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role, isMounted } = useRole();

  useEffect(() => {
    if (!isMounted) return;

    // RBAC check for Interviewers attempting to access /admin routes
    if (role === 'INTERVIEWER' && pathname.startsWith('/admin')) {
      router.push('/survey');
    }
  }, [pathname, role, isMounted, router]);

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

  return <>{children}</>;
}
