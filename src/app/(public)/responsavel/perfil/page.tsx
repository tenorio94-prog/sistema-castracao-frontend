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
      
      if (error.message?.includes('401')) {
        toast.error('Sessão expirada', { 
          description: 'Faça login novamente para continuar.' 
        });
      } else {
        toast.error('Erro ao carregar perfil', { 
          description: error.message || 'Tente novamente mais tarde.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: ProfileData) => {
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
    
    toast.promise(
      PetOwnerService.updateMe(updateData),
      {
        loading: 'Salvando alterações...',
        success: () => {
          fetchProfile();
          return 'Perfil atualizado com sucesso!';
        },
        error: (err) => {
          console.error('Erro ao atualizar perfil:', err);
          const message = err.response?.data?.message;
          return Array.isArray(message) ? message[0] : (message || 'Erro ao atualizar perfil');
        }
      }
    );
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