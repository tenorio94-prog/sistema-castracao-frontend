// @/components/Layout/TopBar.tsx
"use client";

import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SidebarTrigger } from "@/components/ui/sidebar"; // Importe o Trigger aqui

export default function TopBar() {
  const router = useRouter();

  const handleVerPerfil = () => router.push('/perfil');

  const handleSair = () => {
    if (window.confirm('Tem certeza que deseja sair do sistema?')) {
      router.push('/');
    }
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