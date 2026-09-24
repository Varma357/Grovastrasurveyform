'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, EmployeeUser } from '@/lib/types';
import { getAllEmployees } from '@/lib/db/db';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: EmployeeUser | null;
  setCurrentUser: (user: EmployeeUser | null) => void;
  userEmail: string;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType>({
  role: 'ADMIN',
  setRole: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  userEmail: 'admin@grovastra.com',
  logout: () => {},
});

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>('ADMIN');
  const [currentUser, setCurrentUserState] = useState<EmployeeUser | null>(null);

  useEffect(() => {
    // Load persisted user session from localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('grovastra_active_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as EmployeeUser;
          setCurrentUserState(parsed);
          setRoleState(parsed.role);
        } catch (e) {}
      } else {
        // Default admin fallback
        const defaultAdmin = getAllEmployees().find((e) => e.role === 'ADMIN') || null;
        if (defaultAdmin) {
          setCurrentUserState(defaultAdmin);
          setRoleState(defaultAdmin.role);
        }
      }
    }
  }, []);

  const setCurrentUser = (user: EmployeeUser | null) => {
    setCurrentUserState(user);
    if (user) {
      setRoleState(user.role);
      localStorage.setItem('grovastra_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('grovastra_active_user');
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUserState(updated);
      localStorage.setItem('grovastra_active_user', JSON.stringify(updated));
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem('grovastra_active_user');
  };

  const userEmail = currentUser?.email || (role === 'ADMIN' ? 'admin@grovastra.com' : 'interviewer@grovastra.com');

  return (
    <RoleContext.Provider value={{ role, setRole, currentUser, setCurrentUser, userEmail, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
