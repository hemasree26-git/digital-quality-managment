import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginWithOtp: (phone: string, countryCode: string, role: UserRole, otp: string) => boolean;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const DEFAULT_USER_PROFILES: Record<UserRole, { name: string; department: string; avatarUrl: string }> = {
  'Inspector': {
    name: 'Marcus Vance',
    department: 'Shop Floor Quality & Metrology',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  'Auditor': {
    name: 'Elena Rostova',
    department: 'ISO & Compliance Assurance',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  'Quality Manager': {
    name: 'Sarah Lin, CQE',
    department: 'Quality Engineering & Reliability',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  'Admin': {
    name: 'Alexandre DuPont',
    department: 'Plant Operations & Systems Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('dqm_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('dqm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dqm_user');
    }
  }, [user]);

  const loginWithOtp = (phone: string, countryCode: string, role: UserRole, otp: string): boolean => {
    // Valid 6-digit OTP check (accepts '123456' or any 6 digits for smooth testing)
    if (otp.length !== 6) return false;

    const profileMeta = DEFAULT_USER_PROFILES[role] || DEFAULT_USER_PROFILES['Inspector'];
    const newUser: UserProfile = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: profileMeta.name,
      phone,
      countryCode,
      role,
      department: profileMeta.department,
      avatarUrl: profileMeta.avatarUrl,
    };

    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const meta = DEFAULT_USER_PROFILES[newRole] || DEFAULT_USER_PROFILES['Inspector'];
    setUser({
      ...user,
      role: newRole,
      name: meta.name,
      department: meta.department,
      avatarUrl: meta.avatarUrl,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithOtp,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
