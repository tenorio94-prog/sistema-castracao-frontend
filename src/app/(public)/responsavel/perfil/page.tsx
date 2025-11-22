"use client";

import React from 'react';
import UserProfile, { ProfileData } from '@/components/Perfil/UserProfile';

// Dados Mockados (Em produção viria do UserService.getMe())
const mockAdminData: ProfileData = {
  name: 'Maria Cecília Barros',
  email: 'maria.barros@vetcare.com',
  phone: '(81) 99999-0000',
  cpf: '000.000.000-00',
  role: 'Administrador',
  memberSince: 'Nov 2022',
  lastAccess: 'Hoje, 19:54',
};

export default function AdminProfilePage() {
  const handleSave = (data: ProfileData) => {
    console.log('Salvando dados:', data);
    alert('Dados atualizados com sucesso!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Cabeçalho Ajustado: Mesmo padrão visual de "Meus Animais" */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-gray-500 text-lg">
          Gerencie suas informações pessoais e segurança da conta.
        </p>
      </div>
      
      {/* Componente de Perfil */}
      <UserProfile 
        initialData={mockAdminData} 
        onSave={handleSave}
      />
    </div>
  );
}