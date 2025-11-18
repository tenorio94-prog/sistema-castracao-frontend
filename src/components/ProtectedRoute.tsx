"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { Role } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

/**
 * Componente para proteger rotas que requerem autenticação
 * Verifica se o usuário está autenticado e se tem permissão para acessar a rota
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Verifica se está autenticado
      const isAuthenticated = AuthService.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log('❌ Usuário não autenticado, redirecionando para login...');
        router.replace('/login');
        return;
      }

      // Se tem roles permitidos, verifica permissão
      if (allowedRoles && allowedRoles.length > 0) {
        const user = AuthService.getCurrentUser();
        
        if (!user) {
          console.log('❌ Não foi possível obter dados do usuário');
          router.replace('/login');
          return;
        }

        const hasPermission = allowedRoles.includes(user.role);
        
        if (!hasPermission) {
          console.log(`❌ Usuário não tem permissão. Role: ${user.role}, Permitidos: ${allowedRoles.join(', ')}`);
          // Redireciona para a rota apropriada do role do usuário
          const userRoute = AuthService.getRoleRoute(user.role);
          router.replace(userRoute);
          return;
        }

        console.log(`✅ Usuário autorizado. Role: ${user.role}`);
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  // Mostra loading enquanto verifica
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Se não autorizado, não renderiza nada (já está redirecionando)
  if (!isAuthorized) {
    return null;
  }

  // Se autorizado, renderiza os children
  return <>{children}</>;
}
