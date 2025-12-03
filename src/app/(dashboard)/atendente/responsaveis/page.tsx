"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Dog, Plus, Search, Users, Building2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import ResponsavelCard, { Responsavel } from '@/components/AtendenteComponents/ResponsavelCard';
import DetalhesModal from '@/components/modals/DetalhesModal'; 
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import TipoResponsavelRadio from '@/components/forms/TipoResponsavelRadio';
import { PetOwnerService } from '@/services/petowner.service';
import { AuthService, Role } from '@/services/auth.service';
import { maskCPF, maskPhone, maskCNPJ, validateCPF, validatePhone, unmask } from '@/lib/masks';

// --- TIPOS ---
// Enum local (não exportado) - corresponde ao PetOwnerType do Prisma
enum PetOwnerTypeEnum {
  individual = 'individual',
  ngo = 'ngo'
}

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
        const isONG = owner.type === 'ngo'; // Comparar com string diretamente
        
        return {
          id: owner.id.toString(),
          tipo: isONG ? 'ONG' : 'PF',
          nome: owner.user?.completeName || 'N/A',
          cpf: !isONG && owner.user?.cpf ? maskCPF(owner.user.cpf) : '',
          nis: owner.nis || '',
          cnpj: isONG && owner.user?.cnpj ? maskCNPJ(owner.user.cnpj) : '',
          telefone: owner.user?.phone ? maskPhone(owner.user.phone) : 'N/A',
          email: owner.user?.email || 'N/A',
          endereco: owner.fullAddress || 'N/A',
          animais: [], // Backend não retorna lista de nomes diretamente
          quantidadeAnimais: owner._count?.animals || 0,
          senha: '',
        };
      });
      
      setMasterResponsaveis(responsaveisUI);
      setResponsaveisFiltrados(responsaveisUI);
    } catch (error: any) {
      console.error('Erro ao buscar responsáveis:', error);
      toast.error(error.message || 'Erro ao carregar responsáveis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchResponsaveis(); 
  }, []);

  // Filtragem
  useEffect(() => {
    const filtrados = masterResponsaveis.filter(r => {
      const searchLower = busca.toLowerCase();
      return (
        r.nome.toLowerCase().includes(searchLower) ||
        (r.cpf && r.cpf.includes(busca)) ||
        (r.cnpj && r.cnpj.includes(busca)) ||
        (r.email && r.email.toLowerCase().includes(searchLower))
      );
    });
    
    setResponsaveisFiltrados(filtrados);
  }, [busca, masterResponsaveis]); 
  
  // Handlers de Cadastro
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let maskedValue = value;
    
    // Aplicar máscaras conforme o campo
    if (name === 'cpf') {
      maskedValue = maskCPF(value);
    } else if (name === 'telefone') {
      maskedValue = maskPhone(value);
    } else if (name === 'cnpj') {
      maskedValue = maskCNPJ(value);
    }
    
    setCreateFormData(prev => ({ ...prev, [name]: maskedValue }));
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTipo = e.target.value as 'PF' | 'ONG';
    setCreateFormData(prev => ({ 
      ...prev,
      tipo: newTipo,
      // Limpar campos específicos ao trocar tipo
      cpf: '',
      nis: '',
      cnpj: ''
    }));
  };

  const handleOpenCreate = () => { 
    setCreateFormData(emptyForm); 
    setIsCreateModalOpen(true); 
  };
  
  const handleCloseCreate = () => { 
    setIsCreateModalOpen(false); 
    setCreateFormData(emptyForm); 
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    
    try {
      // Validações básicas
      if (!createFormData.nome?.trim()) {
        toast.error('Nome completo é obrigatório');
        return;
      }

      if (!createFormData.email?.trim()) {
        toast.error('Email é obrigatório');
        return;
      }

      if (!createFormData.telefone?.trim()) {
        toast.error('Telefone é obrigatório');
        return;
      }

      if (!validatePhone(createFormData.telefone)) {
        toast.error('Telefone inválido');
        return;
      }

      if (!createFormData.senha || createFormData.senha.length < 6) {
        toast.error('Senha deve ter no mínimo 6 caracteres');
        return;
      }

      if (!createFormData.endereco?.trim()) {
        toast.error('Endereço é obrigatório');
        return;
      }

      // Validações específicas por tipo
      if (createFormData.tipo === 'PF') {
        if (!createFormData.cpf?.trim()) {
          toast.error('CPF é obrigatório para Pessoa Física');
          return;
        }
        
        if (!validateCPF(createFormData.cpf)) {
          toast.error('CPF inválido');
          return;
        }
      } else if (createFormData.tipo === 'ONG') {
        if (!createFormData.cnpj?.trim()) {
          toast.error('CNPJ é obrigatório para ONGs');
          return;
        }
        
        // Validação básica de CNPJ (14 dígitos)
        if (unmask(createFormData.cnpj).length !== 14) {
          toast.error('CNPJ deve conter 14 dígitos');
          return;
        }
      }

      // Montar payload
      const payload: any = {
        completeName: createFormData.nome.trim(),
        email: createFormData.email.trim().toLowerCase(),
        phone: unmask(createFormData.telefone),
        password: createFormData.senha,
        role: Role.petOwner,
        address: createFormData.endereco.trim(),
        petOwnerType: createFormData.tipo === 'ONG' ? 'ngo' : 'individual', // String literal
      };

      if (createFormData.tipo === 'PF') {
        payload.cpf = unmask(createFormData.cpf);
        if (createFormData.nis?.trim()) {
          payload.nis = createFormData.nis.trim();
        }
      } else {
        payload.cnpj = unmask(createFormData.cnpj);
      }

      console.log('📤 Enviando cadastro:', {
        tipo: createFormData.tipo,
        nome: payload.completeName,
        email: payload.email,
        petOwnerType: payload.petOwnerType
      });

      // Chamar serviço de registro
      await AuthService.register(payload);

      toast.success('Responsável cadastrado com sucesso!');
      await fetchResponsaveis();
      handleCloseCreate();
    } catch (error: any) {
      console.error('Erro ao cadastrar responsável:', error);
      
      const errorMessage = error.message || 'Erro ao cadastrar responsável';
      
      if (errorMessage.includes('CPF já cadastrado')) {
        toast.error('CPF já cadastrado no sistema');
      } else if (errorMessage.includes('CNPJ já cadastrado')) {
        toast.error('CNPJ já cadastrado no sistema');
      } else if (errorMessage.includes('Email já cadastrado')) {
        toast.error('Email já cadastrado no sistema');
      } else if (errorMessage.includes('inválido')) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
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
          description="Gerencie o cadastro de proprietários e ONGs parceiras"
        />
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Responsável</span>
        </button>
      </div>

      {/* Barra de Busca */}
      <div className="relative w-full md:w-96">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, CPF, CNPJ ou email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm transition-all"
        />
      </div>

      {/* Lista de Responsáveis */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Lista de Cadastros</h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            {responsaveisFiltrados.length} registro{responsaveisFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
            <p className="text-sm text-gray-500 mt-1">
              {busca ? 'Tente buscar por outro termo' : 'Comece cadastrando um novo responsável'}
            </p>
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
            <DetalheItem 
              icon={<User size={16} />} 
              label="Nome Completo" 
              value={selectedResponsavel.nome} 
            />
            <DetalheItem 
              icon={selectedResponsavel.tipo === 'ONG' ? <Building2 size={16} /> : <User size={16} />} 
              label="Tipo de Cadastro" 
              value={selectedResponsavel.tipo === 'ONG' ? 'Organização (ONG)' : 'Pessoa Física'} 
            />
            
            {selectedResponsavel.tipo === 'PF' ? (
              <>
                <DetalheItem 
                  icon={<FileText size={16} />} 
                  label="CPF" 
                  value={selectedResponsavel.cpf || 'Não informado'} 
                />
                {selectedResponsavel.nis && (
                  <DetalheItem 
                    icon={<FileText size={16} />} 
                    label="NIS" 
                    value={selectedResponsavel.nis} 
                  />
                )}
              </>
            ) : (
              <DetalheItem 
                icon={<Building2 size={16} />} 
                label="CNPJ" 
                value={selectedResponsavel.cnpj || 'Não informado'} 
              />
            )}
            
            <DetalheItem 
              icon={<Phone size={16} />} 
              label="Telefone" 
              value={selectedResponsavel.telefone} 
            />
            <DetalheItem 
              icon={<Mail size={16} />} 
              label="Email" 
              value={selectedResponsavel.email} 
            />
            <DetalheItem 
              icon={<MapPin size={16} />} 
              label="Endereço" 
              value={selectedResponsavel.endereco} 
            />
            <DetalheItem 
              icon={<Dog size={16} />} 
              label="Pets Vinculados" 
              value={selectedResponsavel.quantidadeAnimais 
                ? `${selectedResponsavel.quantidadeAnimais} ${selectedResponsavel.quantidadeAnimais === 1 ? 'animal' : 'animais'}`
                : 'Nenhum animal cadastrado'
              } 
            />
          </div>
        )}
      </DetalhesModal>

      {/* Modal de Cadastro */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSave}
        title="Cadastrar Responsável"
        saveText={loadingSubmit ? "Cadastrando..." : "Salvar Cadastro"}
      >
        <div className="space-y-4">
          <TipoResponsavelRadio
            tipo={createFormData.tipo}
            onChange={handleRadioChange}
          />
          
          <FormInput
            label="Nome Completo *"
            name="nome"
            placeholder={createFormData.tipo === 'ONG' ? "Nome da Organização" : "Nome do responsável"}
            value={createFormData.nome}
            onChange={handleFormChange}
          />
          
          {createFormData.tipo === 'PF' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="CPF *"
                name="cpf"
                placeholder="000.000.000-00"
                value={createFormData.cpf}
                onChange={handleFormChange}
                maxLength={14}
              />
              <FormInput
                label="NIS (Opcional)"
                name="nis"
                placeholder="Número de Identificação Social"
                value={createFormData.nis}
                onChange={handleFormChange}
              />
            </div>
          ) : (
            <FormInput
              label="CNPJ *"
              name="cnpj"
              placeholder="00.000.000/0001-00"
              value={createFormData.cnpj}
              onChange={handleFormChange}
              maxLength={18}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Email *"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              value={createFormData.email}
              onChange={handleFormChange}
            />
            <FormInput
              label="Telefone *"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={createFormData.telefone}
              onChange={handleFormChange}
              maxLength={15}
            />
          </div>
          
          <FormInput
            label="Endereço Completo *"
            name="endereco"
            placeholder="Rua, Número, Bairro - Cidade"
            value={createFormData.endereco}
            onChange={handleFormChange}
          />
          
          <FormInput
            label="Senha de Acesso *" 
            name="senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={createFormData.senha}
            onChange={handleFormChange}
          />
          
          <div className="text-xs text-gray-500 mt-2">
            * Campos obrigatórios
          </div>
        </div>
      </CadastroModal>
    </div>
  );
}