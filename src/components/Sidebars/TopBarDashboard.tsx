"use client";

import React, { useEffect, useState } from 'react';
import { User, LogOut, Repeat, LayoutDashboard, Stethoscope, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthService } from '@/services/auth.service';
import { Role } from '@/types/auth.types';

export default function TopBar() {
  const router = useRouter();
  const [profileRoute, setProfileRoute] = useState('/login');
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role || (user.user && user.user.role);
        setUserRole(role);

        // Load saved active profile or default to user's role
        const savedRole = localStorage.getItem('activeProfile') || role;
        setActiveRole(savedRole);

        switch (savedRole) {
          case Role.administrator:
            setProfileRoute('/adm/perfil');
            break;
          case Role.veterinarian:
            setProfileRoute('/medico/perfil');
            break;
          case Role.receptionist:
          case Role.semas:
            setProfileRoute('/atendente/perfil');
            break;
          case Role.student:
            setProfileRoute('/medico/perfil');
            break;
          default:
            setProfileRoute('/perfil');
        }
      } catch (error) {
        console.error("Erro ao ler cargo do usuário", error);
      }
    }
  }, []);

  const switchRole = (newRole: string) => {
    localStorage.setItem('activeProfile', newRole);
    setActiveRole(newRole);
    setShowRoleSwitcher(false);
    
    // Refresh page so sidebar updates
    window.location.reload();
  };

  const roleLabels: Record<string, { label: string, icon: any }> = {
    'administrator': { label: 'Administrador', icon: 'LayoutDashboard' },
    'veterinarian': { label: 'Médico Veterinário', icon: 'Stethoscope' },
    'receptionist': { label: 'Atendente', icon: 'ClipboardList' },
  };

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
        {userRole === 'administrator' && (
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
            >
              <Repeat size={16} />
              {roleLabels[activeRole || 'administrator']?.label || 'Admin'}
            </button>
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1">
                {Object.entries(roleLabels).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => switchRole(key)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-3 ${
                      activeRole === key
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {val.label}
                    {activeRole === key && <span className="ml-auto text-xs text-green-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
      
      {/* Clique fora para fechar o dropdown */}
      {showRoleSwitcher && (
        <div className="fixed inset-0 z-40" onClick={() => setShowRoleSwitcher(false)} />
      )}
    </header>
  );
}