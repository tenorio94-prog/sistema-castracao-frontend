// app/atendente/responsaveis/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Dog, Plus, Search, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import ResponsavelCard, { Responsavel } from '@/components/AtendenteComponents/ResponsavelCard';
import DetalhesModal from '@/components/modals/DetalhesModal'; 
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import TipoResponsavelRadio from '@/components/forms/TipoResponsavelRadio';
import { PetOwnerService } from '@/services/petowner.service';
import { AuthService, Role } from '@/services/auth.service';
import { maskCPF, maskPhone, validateCPF } from '@/lib/masks';

// --- TIPOS ---
type ResponsavelForm = {
  tipo: 'PF' | 'ONG';
  nome: string;
  cpf: string;
  nis: string;
  cnpj: string;
  telefone: string;
  senha: string;
  email: string;
  endereco: string;
};

const emptyForm: ResponsavelForm = { 
  tipo: 'PF', 
  nome: '', 
  cpf: '', 
  nis: '',
  cnpj: '',
  telefone: '',
  senha: '',
  email: '',
  endereco: ''
};

// Sub-componente para modal
function DetalheItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"> 
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wide block mb-0.5">{label}</label>
        <p className="text-gray-800 font-medium">{value || 'Não informado'}</p>
      </div>
    </div>
  );
}

export default function PaginaResponsaveis() {
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  
  const [masterResponsaveis, setMasterResponsaveis] = useState<Responsavel[]>([]);
  const [responsaveisFiltrados, setResponsaveisFiltrados] = useState<Responsavel[]>([]);
  
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);

  // Buscar responsáveis do backend
  const fetchResponsaveis = async () => {
    setLoading(true);
    try {
      const data = await PetOwnerService.getAll();
      const responsaveisUI: Responsavel[] = data.map(owner => {
        const isSemas = owner.user?.role === Role.semas;
        return {
          id: owner.id.toString(),
          tipo: isSemas ? 'ONG' : 'PF',
          nome: owner.user?.completeName || 'N/A',
          cpf: owner.user?.cpf || 'N/A',
          nis: owner.nis || '',
          cnpj: isSemas ? owner.user?.cpf : '',
          telefone: owner.user?.phone || 'N/A',
          email: owner.user?.email || 'N/A',
          endereco: owner.fullAddress || 'N/A',
          animais: [], // backend não retorna lista de nomes de animais facilmente
          senha: '',
        };
      });
      setMasterResponsaveis(responsaveisUI);
      setResponsaveisFiltrados(responsaveisUI);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar responsáveis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResponsaveis(); }, []);

  // useEffect para filtragem
  useEffect(() => {
    setLoading(true);
    const filtrados = masterResponsaveis.filter(r => 
      r.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (r.cpf && r.cpf.includes(busca)) ||
      (r.cnpj && r.cnpj.includes(busca)) ||
      r.animais.some(pet => pet.toLowerCase().includes(busca.toLowerCase()))
    );
    
    // Simulando delay pequeno para UX
    const timeout = setTimeout(() => {
      setResponsaveisFiltrados(filtrados);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [busca, masterResponsaveis]); 
  
  // Handlers de Cadastro
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTipo = e.target.value as 'PF' | 'ONG';
    setCreateFormData(prev => ({ 
      ...emptyForm, 
      tipo: newTipo, 
      nome: prev.nome 
    }));
  };

  const handleOpenCreate = () => { setCreateFormData(emptyForm); setIsCreateModalOpen(true); };
  const handleCloseCreate = () => { setIsCreateModalOpen(false); setCreateFormData(emptyForm); };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    
    try {
      // Validações
      if (!createFormData.nome || !createFormData.email || !createFormData.telefone || !createFormData.senha) {
        toast.warning('Preencha todos os campos obrigatórios.');
        setLoadingSubmit(false);
        return;
      }

      if (!createFormData.endereco?.trim()) {
        toast.warning('Endereço é obrigatório.');
        setLoadingSubmit(false);
        return;
      }

      if (createFormData.tipo === 'PF') {
        if (!createFormData.cpf || !validateCPF(createFormData.cpf)) {
          toast.warning('CPF inválido.');
          setLoadingSubmit(false);
          return;
        }
      }

      const role = createFormData.tipo === 'ONG' ? Role.semas : Role.petOwner;

      const payload = {
        completeName: createFormData.nome,
        cpf: createFormData.cpf.replace(/\D/g, ''),
        phone: createFormData.telefone.replace(/\D/g, ''),
        email: createFormData.email,
        password: createFormData.senha,
        role: role,
        address: createFormData.endereco || '',
        nis: createFormData.nis || undefined,
      };

      console.log('📤 Enviando payload:', payload);

      // Usar rota específica para recepcionistas/SEMAS cadastrarem responsáveis
      await AuthService.registerPetOwnerByReceptionist(payload);

      toast.success('Responsável cadastrado com sucesso!');
      await fetchResponsaveis();
      handleCloseCreate();
    } catch (error: any) {
      console.error('Erro ao cadastrar responsável:', error);
      
      if (error.response?.status === 409) {
        const message = error.response?.data?.message;
        if (message) {
          toast.error(message);
        } else {
          toast.error('CPF ou e-mail já cadastrado no sistema.');
        }
      } else if (error.response?.status === 403) {
        toast.error('Você não tem permissão para cadastrar responsáveis.');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (Array.isArray(message)) {
          toast.error(message.join(', '));
        } else {
          toast.error(message || 'Dados inválidos. Verifique os campos.');
        }
      } else {
        const msg = error.response?.data?.message || error.message || 'Erro ao cadastrar responsável.';
        toast.error(msg);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };
  
  // Handlers Detalhes
  const handleVerDetalhes = (responsavel: Responsavel) => {
    setSelectedResponsavel(responsavel);
    setIsModalDetalhesOpen(true);
  };
  
  const handleCloseDetalhes = () => {
    setIsModalDetalhesOpen(false);
    setSelectedResponsavel(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header com Botão de Ação */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title="Responsáveis e ONGs"
          description="Gerencie o cadastro de proprietários e ONGs parceiras."
        />
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-gray-200 active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Responsável</span>
        </button>
      </div>

      {/* Barra de Busca Limpa */}
      <div className="relative w-full md:w-96">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF, CNPJ ou animal..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm transition-all"
        />
      </div>

      {/* Lista de Responsáveis */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Lista de Cadastros</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {responsaveisFiltrados.length} registros
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-100 rounded"></div>
            </div>
          </div>
        ) : responsaveisFiltrados.length > 0 ? (
          <div className="space-y-3">
            {responsaveisFiltrados.map(resp => (
              <ResponsavelCard 
                key={resp.id} 
                responsavel={resp}
                onVerDetalhes={handleVerDetalhes} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Users size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">Nenhum responsável encontrado</p>
            <p className="text-sm text-gray-500 mt-1">Tente buscar por outro termo.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <DetalhesModal
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        title="Perfil do Responsável"
      >
        {selectedResponsavel && (
          <div className="space-y-2">
            <DetalheItem icon={<User size={16} />} label="Nome Completo" value={selectedResponsavel.nome} />
            <DetalheItem icon={<Users size={16} />} label="Tipo de Cadastro" value={selectedResponsavel.tipo} />
            
            {selectedResponsavel.tipo === 'PF' ? (
              <>
                <DetalheItem icon={<User size={16} />} label="CPF" value={selectedResponsavel.cpf} />
                <DetalheItem icon={<User size={16} />} label="NIS" value={selectedResponsavel.nis} />
              </>
            ) : (
              <DetalheItem icon={<Building2 size={16} />} label="CNPJ" value={selectedResponsavel.cnpj} />
            )}
            
            <DetalheItem icon={<Phone size={16} />} label="Telefone" value={selectedResponsavel.telefone} />
            <DetalheItem icon={<Mail size={16} />} label="Email" value={selectedResponsavel.email} />
            <DetalheItem icon={<MapPin size={16} />} label="Endereço" value={selectedResponsavel.endereco} />
            <DetalheItem icon={<Dog size={16} />} label="Pets Vinculados" value={selectedResponsavel.animais.join(', ')} />
          </div>
        )}
      </DetalhesModal>

      {/* Modal de Cadastro (Mantido a estrutura, apenas alinhado visualmente se necessário) */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSave}
        title="Cadastrar Responsável"
        saveText={loadingSubmit ? "Cadastrando..." : "Salvar Cadastro"}
      >
        <TipoResponsavelRadio
          tipo={createFormData.tipo}
          onChange={handleRadioChange}
        />
        
        <FormInput
          label="Nome Completo"
          name="nome"
          placeholder="Ex: Maria da Silva"
          value={createFormData.nome}
          onChange={handleFormChange}
        />
        
        {createFormData.tipo === 'PF' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="CPF"
              name="cpf"
              placeholder="000.000.000-00"
              value={maskCPF(createFormData.cpf || '')}
              onChange={handleFormChange}
            />
             <FormInput
              label="Telefone"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={maskPhone(createFormData.telefone || '')}
              onChange={handleFormChange}
            />
          </div>
        )}

        {createFormData.tipo === 'ONG' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="CNPJ"
              name="cnpj"
              placeholder="00.000.000/0001-00"
              value={createFormData.cnpj || ''}
              onChange={handleFormChange}
            />
            <FormInput
              label="Telefone"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={maskPhone(createFormData.telefone || '')}
              onChange={handleFormChange}
            />
          </div>
        )}
        
        {createFormData.tipo === 'PF' && (
          <FormInput
            label="Número do NIS (Opcional)"
            name="nis"
            placeholder="Para programas sociais"
            value={createFormData.nis || ''}
            onChange={handleFormChange}
          />
        )}

        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="email@exemplo.com"
          value={createFormData.email || ''}
          onChange={handleFormChange}
        />
        <FormInput
          label="Endereço Completo"
          name="endereco"
          placeholder="Rua, Número, Bairro - Cidade"
          value={createFormData.endereco || ''}
          onChange={handleFormChange}
        />
        <FormInput
          label="Senha de Acesso" 
          name="senha"
          type="password"
          placeholder="******"
          value={createFormData.senha}
          onChange={handleFormChange}
        />
      </CadastroModal>
    </div>
  );
}