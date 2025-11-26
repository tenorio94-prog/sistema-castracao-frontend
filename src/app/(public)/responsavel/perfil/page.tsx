"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import UserProfile, { ProfileData } from '@/components/Perfil/UserProfile';
import { PetOwnerService } from '@/services/petowner.service';

export default function ResponsavelProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await PetOwnerService.getMe();
      
      const formattedData: ProfileData = {
        name: data.user?.completeName || 'N/A',
        email: data.user?.email || 'N/A',
        phone: data.user?.phone || 'N/A',
        cpf: data.user?.cpf || 'N/A',
        role: 'Responsável',
        memberSince: data.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString('pt-BR') : 'N/A',
        lastAccess: 'Agora',
        address: {
          street: data.fullAddress || '',
          number: '',
          district: '',
          city: '',
          state: '',
          zip: ''
        }
      };
      
      setProfileData(formattedData);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      toast.error(error.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: ProfileData) => {
    try {
      const fullAddress = data.address ? 
        `${data.address.street}${data.address.number ? ', ' + data.address.number : ''}${data.address.district ? ' - ' + data.address.district : ''}, ${data.address.city || ''} - ${data.address.state || ''}`.trim() 
        : '';
      
      const updateData: any = {
        completeName: data.name,
        email: data.email,
        phone: data.phone,
        fullAddress: fullAddress
      };
      
      if ((data as any).password) {
        updateData.password = (data as any).password;
      }
      
      await PetOwnerService.updateMe(updateData);
      
      toast.success('Perfil atualizado com sucesso!');
      fetchProfile();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-gray-500 text-lg">
          Gerencie suas informações pessoais e segurança da conta.
        </p>
      </div>
      
      {profileData && (
        <UserProfile 
          initialData={profileData} 
          onSave={handleSave}
        />
      )}
    </div>
  );
}