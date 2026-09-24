'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from './RoleContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, role } = useRole();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Exclude login page from auth check
    if (pathname === '/login') {
      setIsChecking(false);
      return;
    }

    // Check if user is logged in
    const saved = localStorage.getItem('grovastra_active_user');
    if (!currentUser && !saved) {
      router.push('/login');
      setIsChecking(false);
      return;
    }

    // RBAC: Intervierers trying to access Admin routes
    if (role === 'INTERVIEWER' && pathname.startsWith('/admin')) {
      router.push('/survey');
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [pathname, currentUser, role, router]);

  if (isChecking && pathname !== '/login' && !currentUser) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400">Verifying Grovastra Access Permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
