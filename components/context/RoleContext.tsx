'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, EmployeeUser } from '@/lib/types';

interface RoleContextType {
  role: UserRole;
  currentUser: EmployeeUser | null;
  setCurrentUser: (user: EmployeeUser | null) => void;
  userEmail: string;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType>({
  role: 'ADMIN',
  currentUser: null,
  setCurrentUser: () => {},
  userEmail: '',
  logout: () => {},
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<EmployeeUser | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('grovastra_active_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as EmployeeUser;
          setCurrentUserState(parsed);
        } catch (e) {
          localStorage.removeItem('grovastra_active_user');
        }
      }
    }
  }, []);

  const setCurrentUser = (user: EmployeeUser | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('grovastra_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('grovastra_active_user');
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grovastra_active_user');
    }
  };

  const role: UserRole = currentUser?.role || 'ADMIN';
  const userEmail = currentUser?.email || '';

  return (
    <RoleContext.Provider value={{ role, currentUser, setCurrentUser, userEmail, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
