"use client";

import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/types/auth.types';
import { LogOut, User, Shield, Stethoscope, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Retorna o ícone apropriado para cada role
 */
const getRoleIcon = (role: Role) => {
  switch (role) {
    case Role.administrator:
      return <Shield className="h-4 w-4" />;
    case Role.veterinarian:
    case Role.student:
      return <Stethoscope className="h-4 w-4" />;
    case Role.receptionist:
    case Role.semas:
      return <Users className="h-4 w-4" />;
    case Role.petOwner:
      return <Home className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

/**
 * Retorna o nome amigável para cada role
 */
const getRoleName = (role: Role): string => {
  const roleNames: Record<Role, string> = {
    [Role.administrator]: 'Administrador',
    [Role.veterinarian]: 'Veterinário',
    [Role.student]: 'Estudante',
    [Role.receptionist]: 'Recepcionista',
    [Role.semas]: 'SEMAS',
    [Role.petOwner]: 'Responsável',
  };
  return roleNames[role] || role;
};

/**
 * Componente de informações do usuário logado
 */
export function UserProfile() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg animate-pulse">
        <div className="h-10 w-10 bg-gray-300 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-24 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
          {getRoleIcon(user.role)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{user.email}</span>
          <span className="text-xs text-gray-500">{getRoleName(user.role)}</span>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={logout}
        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair
      </Button>
    </div>
  );
}
