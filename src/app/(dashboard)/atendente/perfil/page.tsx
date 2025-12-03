"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import UserProfile, { ProfileData } from '@/components/Perfil/UserProfile';
import { UserService, UpdateUserData } from '@/services/user.service';
import { Role } from '@/types/auth.types';
import { maskCPF, maskPhone } from '@/lib/masks';

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const roleLabels: Record<Role, string> = {
  [Role.administrator]: 'Administrador',
  [Role.semas]: 'SEMAS',
  [Role.veterinarian]: 'Veterinário',
  [Role.receptionist]: 'Recepcionista',
  [Role.petOwner]: 'Responsável',
  [Role.student]: 'Estudante',
};

export default function AtendenteProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userData = await UserService.getMe();
      
      const memberSince = userData.createdAt 
        ? new Date(userData.createdAt).toLocaleDateString('pt-BR')
        : 'Data não disponível';

      const profile: ProfileData = {
        id: userData.id,
        name: userData.completeName,
        email: userData.email,
        phone: maskPhone(userData.phone),
        cpf: userData.cpf ? maskCPF(userData.cpf) : undefined,
        role: roleLabels[userData.role] || userData.role,
        memberSince,
        lastAccess: 'Agora',
      };
      
      setProfileData(profile);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      toast.error(error.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (data: ProfileData) => {
    try {
      setSaving(true);
      
      console.log('💾 Salvando perfil:', {
        name: data.name,
        email: data.email,
        phone: data.phone
      });
      
      // Remove máscaras antes de enviar
      const updateData: UpdateUserData = {
        completeName: data.name,
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
      };

      const updatedUser = await UserService.updateMe(updateData);
      
      console.log('✅ Perfil atualizado:', updatedUser);
      
      // Atualizar o estado com os dados retornados do backend
      const memberSince = updatedUser.createdAt 
        ? new Date(updatedUser.createdAt).toLocaleDateString('pt-BR')
        : data.memberSince;

      const updatedProfile: ProfileData = {
        ...data,
        id: updatedUser.id,
        name: updatedUser.completeName,
        email: updatedUser.email,
        phone: maskPhone(updatedUser.phone),
        cpf: updatedUser.cpf ? maskCPF(updatedUser.cpf) : data.cpf,
        memberSince,
      };
      
      setProfileData(updatedProfile);
      
      toast.success('Perfil atualizado com sucesso!', {
        description: 'Suas informações foram salvas.',
      });
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Erro ao atualizar perfil', {
        description: 'Verifique os dados e tente novamente.',
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (passData: PasswordChangeData) => {
    if (!passData.current_password) {
      toast.error('Senha atual é obrigatória');
      return;
    }

    if (!passData.new_password) {
      toast.error('Nova senha é obrigatória');
      return;
    }

    if (passData.new_password.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passData.new_password !== passData.confirm_password) {
      toast.error('As senhas não coincidem', {
        description: 'Digite a mesma senha nos dois campos.',
      });
      return;
    }

    if (passData.current_password === passData.new_password) {
      toast.error('A nova senha deve ser diferente da atual');
      return;
    }

    try {
      setSaving(true);

      console.log('🔐 Alterando senha do usuário');

      await UserService.updateMe({
        password: passData.new_password,
      });

      console.log('✅ Senha alterada com sucesso');

      toast.success('Senha alterada com sucesso!', {
        description: 'Use sua nova senha no próximo login.',
      });
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error);
      
      const errorMessage = error.message || 'Erro ao alterar senha';
      
      if (errorMessage.toLowerCase().includes('atual') || errorMessage.toLowerCase().includes('incorreta')) {
        toast.error('Senha atual incorreta', {
          description: 'Verifique sua senha atual e tente novamente.',
        });
      } else if (errorMessage.toLowerCase().includes('conflito')) {
        toast.error('Conflito ao alterar senha', {
          description: errorMessage,
        });
      } else {
        toast.error(errorMessage, {
          description: 'Tente novamente mais tarde.',
        });
      }
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p className="text-sm text-gray-500">Carregando perfil...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <p className="text-lg text-gray-600">Não foi possível carregar os dados do perfil.</p>
        <button 
          onClick={fetchProfile}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
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
          Gerencie suas informações pessoais e credenciais de acesso.
        </p>
      </div>
      
      <UserProfile 
        initialData={profileData} 
        onSave={handleSave}
        onPasswordChange={handlePasswordChange}
        isSaving={saving}
      />
    </div>
  );
}