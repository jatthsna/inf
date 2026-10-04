import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: UserProfile;
  currentUserNullable: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole;
  isAdmin: boolean;
  isTreasurer: boolean;
  isStudent: boolean;
  login: (identifier: string, passwordAttempt: string) => { success: boolean; message?: string };
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  availableUsers: UserProfile[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'kas_info_authenticated_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => db.getProfiles());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved && db.getProfileById(saved)) {
        return saved;
      }
    }
    return null;
  });

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      const updatedProfiles = db.getProfiles();
      setProfiles(updatedProfiles);
      // If current user was removed or deactivated
      if (currentUserId) {
        const found = updatedProfiles.find(p => p.id === currentUserId);
        if (!found || found.status === 'inactive') {
          setCurrentUserId(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      }
    });
    return unsubscribe;
  }, [currentUserId]);

  const activeProfile = profiles.find(p => p.id === currentUserId) || null;
  const isAuthenticated = !!activeProfile;

  // Safe fallback if accessed outside authenticated guard
  const fallbackProfile = activeProfile || profiles[0] || {
    id: 'guest',
    full_name: 'Tamu / Belum Masuk',
    nim: '-',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    status: 'active' as const,
    created_at: '',
    updated_at: ''
  };

  const login = (identifier: string, passwordAttempt: string): { success: boolean; message?: string } => {
    const res = db.authenticate(identifier, passwordAttempt);
    if (res.success && res.profile) {
      setCurrentUserId(res.profile.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, res.profile.id);
      }
      return { success: true };
    }
    return { success: false, message: res.message || 'Gagal masuk. Periksa kembali kredensial Anda.' };
  };

  const logout = () => {
    setCurrentUserId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!activeProfile) {
      return { success: false, message: 'Anda belum masuk ke sistem.' };
    }
    return db.changePassword(activeProfile.id, oldPass, newPass, activeProfile);
  };

  const value: AuthContextType = {
    currentUser: fallbackProfile,
    currentUserNullable: activeProfile,
    isAuthenticated,
    role: fallbackProfile.role,
    isAdmin: activeProfile?.role === 'admin',
    isTreasurer: activeProfile?.role === 'treasurer' || activeProfile?.role === 'admin',
    isStudent: activeProfile?.role === 'student',
    login,
    logout,
    changePassword,
    availableUsers: profiles
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
