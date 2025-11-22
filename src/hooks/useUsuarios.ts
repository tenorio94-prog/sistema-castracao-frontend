/**
 * Hook de autenticação
 * Gerencia login, logout e redirecionamento baseado em roles
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// Tipos baseados no schema Prisma
export type Role = 
  | 'administrator'  // Coordenação/Admin (UFRPE)
  | 'semas'         // Equipe SEMAS (cadastra responsáveis)
  | 'veterinarian'  // Equipe médica (realiza procedimentos)
  | 'receptionist'  // Recepção HVU (agenda retornos, etc.)
  | 'petOwner'      // Responsável pelo animal (agendamento online)
  | 'student';      // Estudante

export interface User {
  id: number;
  role: Role;
  email: string;
  completeName: string;
  cpf: string;
  phone: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Mapeamento de roles para rotas
const ROLE_ROUTES: Record<Role, string> = {
  administrator: '/adm',
  semas: '/adm',
  veterinarian: '/medico',
  receptionist: '/atendente',
  petOwner: '/responsavel',
  student: '/adm'
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Realiza o login do usuário
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);

      // Salvar tokens no localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Redirecionar baseado no role do usuário
      const redirectRoute = ROLE_ROUTES[response.user.role] || '/login';
      router.push(redirectRoute);

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Realiza o logout do usuário
   */
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  /**
   * Retorna o usuário logado (se existir)
   */
  const getUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  /**
   * Verifica se o usuário está autenticado
   */
  const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken') && !!getUser();
  };

  /**
   * Verifica se o usuário tem a role especificada
   */
  const hasRole = (role: Role | Role[]): boolean => {
    const user = getUser();
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  return {
    login,
    logout,
    getUser,
    isAuthenticated,
    hasRole,
    isLoading,
    error
  };
}
