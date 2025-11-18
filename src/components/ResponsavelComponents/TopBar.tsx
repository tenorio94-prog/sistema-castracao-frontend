// @/components/Layout/TopBar.tsx
"use client";

import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

type TopBarProps = {
  variant?: 'white' | 'green';
  onLogout?: () => void;
};

export default function TopBar({ variant = 'white', onLogout }: TopBarProps) {
  const router = useRouter();

  const handleVerPerfil = () => router.push('/responsavel/perfil');

  const handleSair = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      onLogout ? onLogout() : router.push('/');
    }
  };

  const isGreen = variant === 'green';

  return (
    <header
      className={`flex items-center justify-end h-12 px-6 ${
        isGreen ? 'bg-green-700 text-white' : 'bg-white text-gray-700'
      } shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={handleVerPerfil}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            isGreen
              ? 'text-white hover:bg-green-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <User size={14} />
          Ver Perfil
        </button>

        <button
          onClick={handleSair}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            isGreen
              ? 'text-red-200 hover:bg-red-600'
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </header>
  );
}