"use client";

import React, { useEffect, useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthService } from '@/services/auth.service';
import { Role } from '@/types/auth.types';

export default function TopBar() {
  const router = useRouter();
  const [profileRoute, setProfileRoute] = useState('/login'); // Rota padrão de segurança

  // Lógica para descobrir a rota correta baseada no usuário logado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role || (user.user && user.user.role);

        switch (role) {
          case Role.administrator: // 'administrator'
            setProfileRoute('/adm/perfil');
            break;
          case Role.veterinarian: // 'veterinarian'
            setProfileRoute('/medico/perfil');
            break;
          case Role.receptionist: // 'receptionist'
            setProfileRoute('/atendente/perfil');
            break;
          case Role.semas: // 'semas'
            setProfileRoute('/semas/perfil');
            break;
          case Role.student: // 'student'
            setProfileRoute('/estudante/perfil');
            break;
          default:
            setProfileRoute('/perfil'); // Fallback genérico
        }
      } catch (error) {
        console.error("Erro ao ler cargo do usuário", error);
      }
    }
  }, []);

  const handleVerPerfil = () => {
    router.push(profileRoute);
  };

  const handleSair = () => {
    toast('Tem certeza que deseja sair do sistema?', {
      action: {
        label: 'Sair',
        onClick: () => {
          AuthService.logout();
          router.push('/login');
          toast.success('Logout realizado com sucesso!');
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between h-12 px-6 bg-white border-b border-gray-200 shadow-sm">
      {/* Lado Esquerdo: Trigger da Sidebar */}
      <div className="flex items-center">
        <SidebarTrigger />
      </div>

      {/* Lado Direito: Ações do Usuário */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleVerPerfil}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <User size={16} />
          Ver Perfil
        </button>

        <button
          onClick={handleSair}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </header>
  );
}