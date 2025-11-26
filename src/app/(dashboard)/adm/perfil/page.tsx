"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import UserProfile, { ProfileData } from '@/components/Perfil/UserProfile';

export default function AdmProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      // Simulação de delay da API
      await new Promise(resolve => setTimeout(resolve, 800));

      // DADOS MOCKADOS (Fictícios)
      const mockData: ProfileData = {
        id: 1,
        name: 'Administrador Principal',
        email: 'admin@sistema.com',
        phone: '(81) 99999-0000',
        cpf: '000.000.000-00',
        role: 'Administrador',
        memberSince: '01/01/2024',
        lastAccess: 'Agora',
      };
      
      setProfileData(mockData);
    } catch (error: any) {
      toast.error('Erro ao carregar perfil mockado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (data: ProfileData) => {
    // Simulação de salvamento
    setTimeout(() => {
      setProfileData(data); // Atualiza o estado local
      toast.success('Perfil atualizado com sucesso! (Simulação)');
    }, 1000);
  };

  const handlePasswordChange = async (passData: any) => {
    if (passData.new_password !== passData.confirm_password) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setTimeout(() => {
      toast.success('Senha alterada com sucesso! (Simulação)');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Perfil Administrativo
        </h1>
        <p className="text-gray-500 text-lg">
          Gerencie suas credenciais de acesso ao sistema.
        </p>
      </div>
      
      {profileData && (
        <UserProfile 
          initialData={profileData} 
          onSave={handleSave}
          onPasswordChange={handlePasswordChange}
        />
      )}
    </div>
  );
}