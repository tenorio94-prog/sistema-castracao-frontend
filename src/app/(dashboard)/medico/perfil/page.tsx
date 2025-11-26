"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import UserProfile, { ProfileData } from '@/components/Perfil/UserProfile';

export default function MedicoProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // DADOS MOCKADOS
      const mockData: ProfileData = {
        id: 2,
        name: 'Dr. Rafael Silva',
        email: 'rafael.vet@clinica.com',
        phone: '(81) 98888-1234',
        cpf: '123.456.789-00',
        role: 'Médico Veterinário',
        memberSince: '15/03/2024',
        lastAccess: 'Hoje, 08:30',
        
        // Dados Específicos de Médico
        crmv: '12345-PE',
        specialty: 'Cirurgia Geral e Ortopedia'
      };
      
      setProfileData(mockData);
    } catch (error: any) {
      toast.error('Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (data: ProfileData) => {
    setTimeout(() => {
      setProfileData(data);
      toast.success('Perfil médico atualizado! (Simulação)');
    }, 1000);
  };

  const handlePasswordChange = async (passData: any) => {
    if (passData.new_password !== passData.confirm_password) {
      toast.error('Senhas não conferem.');
      return;
    }
    setTimeout(() => {
      toast.success('Senha alterada com sucesso! (Simulação)');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Perfil Profissional
        </h1>
        <p className="text-gray-500 text-lg">
          Gerencie seus dados e especialidades.
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