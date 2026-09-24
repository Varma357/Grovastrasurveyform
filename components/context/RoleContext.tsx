'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, EmployeeUser } from '@/lib/types';

interface RoleContextType {
  role: UserRole | null;
  currentUser: EmployeeUser | null;
  setCurrentUser: (user: EmployeeUser | null) => void;
  userEmail: string;
  logout: () => void;
  isMounted: boolean;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  currentUser: null,
  setCurrentUser: () => {},
  userEmail: '',
  logout: () => {},
  isMounted: false,
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUserState] = useState<EmployeeUser | null>(null);
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
          } else {
            localStorage.removeItem('grovastra_active_user');
            setCurrentUserState(null);
          }
        } catch (e) {
          localStorage.removeItem('grovastra_active_user');
          setCurrentUserState(null);
        }
      } else {
        setCurrentUserState(null);
      }
    }
  }, []);

  const setCurrentUser = (user: EmployeeUser | null) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('grovastra_active_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('grovastra_active_user');
      }
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('grovastra_active_user');
    }
  };

  const role: UserRole | null = currentUser?.role || null;
  const userEmail = currentUser?.email || '';

  return (
    <RoleContext.Provider value={{ role, currentUser, setCurrentUser, userEmail, logout, isMounted }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);

