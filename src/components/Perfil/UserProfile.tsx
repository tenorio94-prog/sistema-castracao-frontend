"use client";

import React, { useState } from 'react';
import { 
  User, Camera, Calendar, Clock, Lock, Save, MapPin, Shield
} from 'lucide-react';
import FormInput from '@/components/forms/FormInput';

// --- Tipos Flexíveis ---
export type ProfileData = {
  // Adicionado ID opcional para facilitar updates
  id?: string | number;

  // Dados Básicos
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  avatarUrl?: string;
  
  // Metadados do Sistema (Read-only)
  role: string; 
  memberSince: string;
  lastAccess?: string;

  // Dados Específicos (Médicos)
  crmv?: string;      
  specialty?: string; 
  
  // Endereço (Responsáveis)
  address?: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip: string;
  };
};

type Props = {
  initialData: ProfileData;
  onSave: (data: ProfileData) => void;
  onPasswordChange?: (data: any) => void;
  isSaving?: boolean;
};

export default function UserProfile({ initialData, onSave, onPasswordChange, isSaving = false }: Props) {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Helpers de renderização condicional
  const hasAddress = formData.address !== undefined;
  const hasProfessionalData = formData.crmv !== undefined;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAddressChange = (field: string, value: string) => {
    if (!formData.address) return;
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address!, [field]: value }
    }));
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async () => {
    if (onPasswordChange) {
      await onPasswordChange(passwordData);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setIsEditingPassword(false);
    }
  };

  const handleSaveProfile = async () => {
    await onSave(formData);
    setHasChanges(false);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* --- COLUNA ESQUERDA: INFO --- */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Card Principal */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-gray-100 to-gray-200"></div>
          
          <div className="relative mt-8 mb-4 group">
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center shadow-md overflow-hidden">
               {formData.avatarUrl ? (
                 <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User size={48} className="text-gray-300" />
               )}
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
          <span className="inline-block px-3 py-1 mt-2 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
            {formData.role}
          </span>

          <div className="w-full mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-500 text-left">
            {formData.lastAccess && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} /> <span>Último acesso</span>
                </div>
                <span className="font-medium text-green-600">{formData.lastAccess}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <Shield className="text-blue-600 shrink-0" size={20} />
          <div>
            <h4 className="text-sm font-bold text-blue-900">Conta Segura</h4>
            <p className="text-xs text-blue-700 mt-1">Recomendamos atualizar sua senha periodicamente.</p>
          </div>
        </div>
      </div>

      {/* --- COLUNA DIREITA: FORMULÁRIOS --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Seção 1: Dados Pessoais */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <User size={18} className="text-gray-400" /> Informações Pessoais
            </h3>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput 
                label="Nome Completo" 
                value={formData.name} 
                onChange={(e) => handleInputChange('name', e.target.value)} 
              />
              <FormInput 
                label="CPF" 
                value={formData.cpf || ''} 
                onChange={(e) => handleInputChange('cpf', e.target.value)} 
                disabled 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput 
                label="E-mail" 
                type="email"
                value={formData.email} 
                onChange={(e) => handleInputChange('email', e.target.value)} 
              />
              <FormInput 
                label="Telefone" 
                value={formData.phone} 
                onChange={(e) => handleInputChange('phone', e.target.value)} 
              />
            </div>

            {/* Campos de Médico */}
            {hasProfessionalData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-100 mt-4">
                 <FormInput 
                  label="CRMV" 
                  value={formData.crmv || ''} 
                  onChange={(e) => handleInputChange('crmv', e.target.value)} 
                  disabled
                />
                 <FormInput 
                  label="Especialidade" 
                  value={formData.specialty || ''} 
                  onChange={(e) => handleInputChange('specialty', e.target.value)} 
                />
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
             <button 
               onClick={handleSaveProfile}
               disabled={isSaving || !hasChanges}
               className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSaving ? (
                 <>
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                   Salvando...
                 </>
               ) : (
                 <>
                   <Save size={16} />
                   {hasChanges ? 'Salvar Alterações' : 'Dados Salvos'}
                 </>
               )}
             </button>
          </div>
        </section>

        {/* Seção 2: Endereço (Apenas se existir no perfil) */}
        {hasAddress && formData.address && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MapPin size={18} className="text-gray-400" /> Endereço
              </h3>
            </div>
            <div className="p-6 space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <div className="md:col-span-2">
                   <FormInput label="Rua / Logradouro" value={formData.address.street} onChange={(e) => handleAddressChange('street', e.target.value)} />
                 </div>
                 <FormInput label="Número" value={formData.address.number} onChange={(e) => handleAddressChange('number', e.target.value)} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <FormInput label="Bairro" value={formData.address.district} onChange={(e) => handleAddressChange('district', e.target.value)} />
                 <FormInput label="Cidade" value={formData.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} />
                 <FormInput label="Estado" value={formData.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} />
               </div>
               <FormInput label="CEP" value={formData.address.zip} onChange={(e) => handleAddressChange('zip', e.target.value)} />
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
               <button 
                 onClick={() => onSave(formData)}
                 className="ml-2 flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 rounded-xl text-sm font-medium transition-all"
               >
                 Atualizar Endereço
               </button>
            </div>
          </section>
        )}

        {/* Seção 3: Segurança */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Lock size={18} className="text-gray-400" /> Segurança
            </h3>
          </div>
          <div className="p-6">
            {!isEditingPassword ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Senha</p>
                  <p className="text-sm text-gray-500">••••••••••••••••</p>
                </div>
                <button 
                  onClick={() => setIsEditingPassword(true)}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Alterar senha
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <FormInput 
                  label="Senha Atual" 
                  type="password" 
                  name="current_password" 
                  value={passwordData.current_password}
                  onChange={handlePasswordInput}
                  hidePasswordGenerators
                  placeholder="Digite sua senha atual"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput 
                    label="Nova Senha" 
                    type="password" 
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordInput}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <FormInput 
                    label="Confirmar Nova Senha" 
                    type="password" 
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordInput}
                    hidePasswordGenerators
                    placeholder="Digite a senha novamente"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                   <button 
                     onClick={() => {
                       setIsEditingPassword(false);
                       setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                     }}
                     disabled={isSaving}
                     className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleSavePassword}
                     disabled={isSaving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                     className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSaving ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                         Atualizando...
                       </>
                     ) : (
                       'Atualizar Senha'
                     )}
                   </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}