"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Role } from '@/hooks/useUsuarios';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * Componente que protege rotas e verifica permissões baseadas em roles
 * 
 * Uso:
 * <ProtectedRoute allowedRoles={['administrator', 'semas']}>
 *   <MinhaPage />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, getUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar se está autenticado
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Se há roles permitidas, verificar se o usuário tem permissão
    if (allowedRoles && allowedRoles.length > 0) {
      const user = getUser();
      
      if (!user || !allowedRoles.includes(user.role)) {
        // Redirecionar para a página apropriada baseado na role
        const roleRoutes: Record<Role, string> = {
          administrator: '/adm',
          semas: '/adm',
          veterinarian: '/medico',
          receptionist: '/atendente',
          petOwner: '/responsavel',
          student: '/adm'
        };
        
        router.push(roleRoutes[user?.role || 'petOwner']);
      }
    }
  }, [isAuthenticated, allowedRoles, router]);

  // Se não está autenticado ou não tem permissão, não renderiza nada
  if (!isAuthenticated()) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getUser();
    if (!user || !allowedRoles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
}
