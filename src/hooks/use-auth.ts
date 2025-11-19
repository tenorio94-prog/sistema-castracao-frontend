"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { AuthUser, Role } from '@/types/auth.types';

/**
 * Hook para gerenciar autenticação
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verifica se há um usuário autenticado
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    hasRole,
    logout,
  };
}
