"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import UserProfile, { ProfileData } from '@/components/Perfil/UserProfile';
import { VeterinarianService, Veterinarian, UpdateVeterinarianData } from '@/services/veterinarian.service';
import { AuthService } from '@/services/auth.service';
import { Role } from '@/types/auth.types';

// Mapear roles para labels amigáveis
const ROLE_LABELS: Record<string, string> = {
  [Role.veterinarian]: 'Médico Veterinário',
  [Role.student]: 'Estudante de Veterinária',
  [Role.administrator]: 'Administrador',
  [Role.receptionist]: 'Recepcionista',
  [Role.semas]: 'Equipe SEMAS',
  [Role.petOwner]: 'Responsável',
};

// Formatar data para exibição
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Não informado';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Não informado';
  }
};

// Formatar CPF
const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// Formatar telefone
const formatPhone = (phone: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

// Remover formatação de telefone
const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Converter dados do veterinário para ProfileData
const convertToProfileData = (vet: Veterinarian, currentRole: Role): ProfileData => {
  // Buscar createdAt do User (quando o usuário foi criado = "Membro desde")
  // Se o backend não retornar user.createdAt, usa veterinarian.createdAt como fallback
  const memberSinceDate = vet.user?.createdAt || vet.createdAt;
  
  console.log('📅 Data "Membro desde":', {
    userCreatedAt: vet.user?.createdAt,
    veterinarianCreatedAt: vet.createdAt,
    using: memberSinceDate
  });
  
  return {
    id: vet.userId,
    name: vet.user?.completeName || 'Nome não informado',
    email: vet.user?.email || '',
    phone: formatPhone(vet.user?.phone || ''),
    cpf: formatCPF(vet.user?.cpf || ''),
    role: ROLE_LABELS[currentRole] || ROLE_LABELS[vet.user?.role || ''] || 'Veterinário',
    memberSince: formatDate(memberSinceDate),
    lastAccess: 'Agora',
    
    // Dados específicos de médico/veterinário
    crmv: vet.crmv || '',
    specialty: vet.specialty || ''
  };
};

export default function MedicoProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const fetchProfile = async () => {
    try {
      console.log('🔍 Carregando perfil do médico veterinário...');
      
      // Obter usuário logado do token
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser?.sub) {
        toast.error('Usuário não autenticado. Faça login novamente.');
        setLoading(false);
        return;
      }

      const userIdNum = parseInt(currentUser.sub, 10);
      setUserId(userIdNum);
      
      console.log('👤 Usuário logado:', {
        userId: userIdNum,
        email: currentUser.email,
        role: currentUser.role
      });

      // Buscar dados do veterinário logado via endpoint /veterinarian/me
      const veterinarian = await VeterinarianService.getMe();
      
      console.log('✅ Dados do veterinário obtidos:', veterinarian);
      
      const profileDataConverted = convertToProfileData(veterinarian, currentUser.role);
      setProfileData(profileDataConverted);
      
      console.log('✅ Perfil convertido e carregado:', profileDataConverted);
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar perfil:', error);
      toast.error(error.message || 'Erro ao carregar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (data: ProfileData) => {
    if (!userId) {
      toast.error('Usuário não identificado.');
      return;
    }

    setSaving(true);
    
    try {
      console.log('💾 Salvando alterações do perfil...', data);
      
      // Preparar dados para atualização
      const updateData: UpdateVeterinarianData = {
        completeName: data.name,
        email: data.email,
        phone: unformatPhone(data.phone), // Remover formatação antes de enviar
        specialty: data.specialty,
      };

      console.log('📤 Dados a serem enviados para o backend:', updateData);

      // Atualizar perfil do veterinário via endpoint PATCH /veterinarian/me
      const updatedVet = await VeterinarianService.updateMe(updateData);
      
      console.log('✅ Resposta do backend:', updatedVet);
      
      // Recarregar dados atualizados do backend
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const refreshedData = convertToProfileData(updatedVet, currentUser.role);
        setProfileData(refreshedData);
      }
      
      toast.success('Perfil atualizado com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (passData: { current_password: string; new_password: string; confirm_password: string }) => {
    if (!userId) {
      toast.error('Usuário não identificado.');
      return;
    }

    // Validações básicas
    if (passData.new_password !== passData.confirm_password) {
      toast.error('As senhas não conferem.');
      return;
    }

    if (passData.new_password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSaving(true);
    
    try {
      console.log('🔐 Atualizando senha...');
      
      // Atualizar senha via endpoint PATCH /veterinarian/me
      await VeterinarianService.updateMe({ 
        password: passData.new_password 
      });
      
      console.log('✅ Senha atualizada com sucesso');
      
      toast.success('Senha alterada com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error);
      toast.error(error.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Não foi possível carregar o perfil.</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Perfil Profissional
        </h1>
        <p className="text-gray-500 text-lg">
          Gerencie seus dados e especialidades.
        </p>
      </div>
      
      <UserProfile 
        initialData={profileData} 
        onSave={handleSave}
        onPasswordChange={handlePasswordChange}
        isSaving={saving}
      />

      {/* Overlay de salvamento */}
      {saving && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="font-medium text-gray-700">Salvando alterações...</span>
          </div>
        </div>
      )}
    </div>
  );
}