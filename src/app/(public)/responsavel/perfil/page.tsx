"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dog } from 'lucide-react';
import UserProfile, { ProfileData } from '@/components/Perfil/UserProfile';
import { PetOwnerService } from '@/services/petowner.service';

export default function ResponsavelProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await PetOwnerService.getMe();
      
      // Parse do endereço completo em campos separados
      const parseAddress = (fullAddress: string | undefined) => {
        if (!fullAddress) {
          return {
            street: '',
            number: '',
            district: '',
            city: '',
            state: '',
            zip: ''
          };
        }

        // Exemplo de formato esperado: "Rua ABC, 123 - Bairro, Cidade - UF"
        const parts = fullAddress.split(',');
        const street = parts[0]?.trim() || '';
        const numberAndDistrict = parts[1]?.split('-') || [];
        const number = numberAndDistrict[0]?.trim() || '';
        const district = numberAndDistrict[1]?.trim() || '';
        const cityState = parts[2]?.split('-') || [];
        const city = cityState[0]?.trim() || '';
        const state = cityState[1]?.trim() || '';

        return {
          street,
          number,
          district,
          city,
          state,
          zip: ''
        };
      };
      
      const formattedData: ProfileData = {
        name: data.user?.completeName || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        cpf: data.user?.cpf || '',
        role: 'Responsável',
        memberSince: data.user?.createdAt 
          ? new Date(data.user.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })
          : 'N/A',
        lastAccess: 'Agora',
        address: parseAddress(data.fullAddress)
      };
      
      setProfileData(formattedData);
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      
      if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        toast.error('Sessão expirada', { 
          description: 'Faça login novamente para continuar.',
          duration: 5000
        });
      } else if (error.message?.includes('Network') || error.message?.includes('rede')) {
        toast.error('Erro de conexão', { 
          description: 'Verifique sua internet e tente novamente.' 
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
    try {
      setIsSaving(true);

      // Montar endereço completo a partir dos campos separados
      let fullAddress = '';
      if (data.address) {
        const parts: string[] = [];
        
        // Rua e número
        if (data.address.street) {
          let streetPart = data.address.street;
          if (data.address.number) {
            streetPart += `, ${data.address.number}`;
          }
          parts.push(streetPart);
        }
        
        // Bairro
        if (data.address.district) {
          const lastPart = parts[parts.length - 1];
          if (lastPart) {
            parts[parts.length - 1] = `${lastPart} - ${data.address.district}`;
          } else {
            parts.push(data.address.district);
          }
        }
        
        // Cidade e estado
        if (data.address.city || data.address.state) {
          let cityStatePart = data.address.city || '';
          if (data.address.state) {
            cityStatePart += ` - ${data.address.state}`;
          }
          parts.push(cityStatePart);
        }
        
        fullAddress = parts.join(', ').trim();
      }
      
      const updateData: any = {
        completeName: data.name,
        email: data.email,
        phone: data.phone,
      };

      // Apenas incluir fullAddress se houver conteúdo
      if (fullAddress) {
        updateData.fullAddress = fullAddress;
      }
      
      await PetOwnerService.updateMe(updateData);
      
      toast.success('Perfil atualizado com sucesso!', {
        description: 'Suas informações foram salvas.',
        duration: 3000
      });
      
      // Recarregar perfil para refletir mudanças
      await fetchProfile();
      
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      const errorMessage = error.response?.data?.message;
      const displayMessage = Array.isArray(errorMessage) 
        ? errorMessage[0] 
        : (errorMessage || error.message || 'Erro ao atualizar perfil');
      
      toast.error('Erro ao atualizar perfil', {
        description: displayMessage,
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (passwordData: any) => {
    try {
      setIsSaving(true);

      // Validações
      if (!passwordData.current_password) {
        toast.error('Senha atual é obrigatória');
        return;
      }

      if (!passwordData.new_password || passwordData.new_password.length < 6) {
        toast.error('Nova senha deve ter no mínimo 6 caracteres');
        return;
      }

      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('As senhas não coincidem');
        return;
      }

      // Atualizar senha via PetOwnerService
      await PetOwnerService.updateMe({
        password: passwordData.new_password
      });

      toast.success('Senha alterada com sucesso!', {
        description: 'Use sua nova senha no próximo login.',
        duration: 3000
      });

    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      const errorMessage = error.response?.data?.message;
      const displayMessage = Array.isArray(errorMessage) 
        ? errorMessage[0] 
        : (errorMessage || error.message || 'Erro ao alterar senha');
      
      toast.error('Erro ao alterar senha', {
        description: displayMessage,
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Dog size={24} className="text-green-600/50" />
          </div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <header className="flex flex-col gap-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold mb-1 w-fit">
            Configurações da Conta
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Meu Perfil
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Gerencie suas informações pessoais e segurança da conta.
          </p>
        </header>
        
        {profileData && (
          <UserProfile 
            initialData={profileData} 
            onSave={handleSave}
            onPasswordChange={handlePasswordChange}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}