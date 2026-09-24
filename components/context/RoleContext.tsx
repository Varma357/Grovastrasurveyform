'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, EmployeeUser } from '@/lib/types';

const DEFAULT_ADMIN: EmployeeUser = {
  id: 'emp-001',
  name: 'Sai Varma',
  email: 'admin@grovastra.com',
  mobile: '9876543210',
  role: 'ADMIN',
  password: 'admin',
  active: true,
  created_at: new Date().toISOString(),
};

interface RoleContextType {
  role: UserRole;
  currentUser: EmployeeUser;
  setCurrentUser: (user: EmployeeUser) => void;
  userEmail: string;
  logout: () => void;
  isMounted: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: 'ADMIN',
  currentUser: DEFAULT_ADMIN,
  setCurrentUser: () => {},
  userEmail: 'admin@grovastra.com',
  logout: () => {},
  isMounted: false,
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<EmployeeUser>(DEFAULT_ADMIN);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('grovastra_active_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as EmployeeUser;
          if (parsed && parsed.role) {
            setCurrentUserState(parsed);
          }
        } catch (e) {
          localStorage.removeItem('grovastra_active_user');
        }
      } else {
        localStorage.setItem('grovastra_active_user', JSON.stringify(DEFAULT_ADMIN));
      }
    }
  }, []);

  const setCurrentUser = (user: EmployeeUser) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('grovastra_active_user', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUserState(DEFAULT_ADMIN);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grovastra_active_user');
    }
  };

  const role: UserRole = currentUser?.role || 'ADMIN';
  const userEmail = currentUser?.email || 'admin@grovastra.com';

  return (
    <RoleContext.Provider value={{ role, currentUser, setCurrentUser, userEmail, logout, isMounted }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
