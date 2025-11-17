// app/atendente/responsaveis/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Dog } from 'lucide-react'; 

import PageHeader from '@/components/AtendenteComponents/PageHeader';
// --- ATUALIZAÇÃO: Importando o TIPO junto com o componente ---
import ResponsavelCard, { Responsavel } from '@/components/AtendenteComponents/ResponsavelCard';
// -----------------------------------------------------------
import PageSearchBar from '@/components/AtendenteComponents/BarraDeBusca';
import DetalhesModal from '@/components/modals/DetalhesModal'; 
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import TipoResponsavelRadio from '@/components/forms/TipoResponsavelRadio';

// --- ATUALIZAÇÃO: O tipo 'Responsavel' foi removido daqui ---

// 2. Tipo 'ResponsavelForm' (agora usa o 'Responsavel' importado)
type ResponsavelForm = Omit<Responsavel, 'id' | 'animais'>;

// 3. Estado inicial do formulário (alinhado)
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
// ---------------------------------------------------

// --- DADOS MOCADOS (Alinhados com o tipo) ---
const mockResponsaveis: Responsavel[] = [
  { id: '1', tipo: 'PF', nome: 'Ana Silva', cpf: '123.456.789-00', nis: '123.456.789-00', telefone: '(81) 98765-4321', email: 'ana.silva@gmail.com', endereco: 'Rua das Flores, 123 - Recife/PE', animais: ['Rex', 'Mel'], senha: '123' },
  { id: '2', tipo: 'ONG', nome: 'Bruno Costa (ONG)', cnpj: '987.654.321/0001-00', telefone: '(81) 91234-5678', email: 'bruno.costa@gmail.com', endereco: 'Avenida Boa Viagem, 456 - Recife/PE', animais: ['Thor'], senha: '456' },
];
// ---------------------

// Sub-componente para os itens de detalhe
function DetalheItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) {
  return (
    <div className="flex items-start gap-3"> 
      <span className="text-gray-500 mt-0.5">{icon}</span>
      <div>
        <label className="text-sm font-semibold text-gray-600">{label}:</label>
        <p className="text-gray-800">{value || 'N/A'}</p>
      </div>
    </div>
  );
}

export default function PaginaResponsaveis() {
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [masterResponsaveis, setMasterResponsaveis] = useState<Responsavel[]>(mockResponsaveis);
  const [responsaveisFiltrados, setResponsaveisFiltrados] = useState<Responsavel[]>(mockResponsaveis);
  
  const [isModalDetalhesOpen, setIsModalDetalhesOpen] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);

  // useEffect para filtragem
  useEffect(() => {
    setLoading(true);
    const filtrados = masterResponsaveis.filter(r => 
      r.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (r.cpf && r.cpf.includes(busca)) ||
      (r.cnpj && r.cnpj.includes(busca)) ||
      r.animais.some(pet => pet.toLowerCase().includes(busca.toLowerCase()))
    );
    setTimeout(() => {
      setResponsaveisFiltrados(filtrados);
      setLoading(false);
    }, 500);
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
    console.log("Criando responsável com:", createFormData); 

    const novoResponsavel: Responsavel = { 
      ...createFormData, 
      id: Math.random().toString(),
      animais: [] 
    }; 
    
    setMasterResponsaveis(prev => [novoResponsavel, ...prev]); 
    handleCloseCreate(); 
    alert('Responsável cadastrado(a)!');
  };
  
  // Handlers do Modal de Detalhes
  const handleVerDetalhes = (responsavel: Responsavel) => {
    setSelectedResponsavel(responsavel);
    setIsModalDetalhesOpen(true);
  };
  
  const handleCloseDetalhes = () => {
    setIsModalDetalhesOpen(false);
    setSelectedResponsavel(null);
  };

  return (
    <div className="flex flex-col gap-8">

      <PageHeader 
        title="Responsáveis"
        description="Gerencie os tutores dos animais"
        buttonLabel="Novo Responsável"
        onButtonClick={handleOpenCreate}
      />

      <PageSearchBar
        title="Buscar"
        placeholder="Digite o nome, CPF ou CNPJ"
        busca={busca}
        onBuscaChange={setBusca}
      />

      {/* Lista de Responsáveis */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Responsáveis</h2>
        <p className="text-sm text-gray-600">
          {loading ? 'Buscando...' : `${responsaveisFiltrados.length} responsável(is) encontrado(s)`}
        </p>

        {loading ? (
          <div className="text-center py-10"><p>Carregando...</p></div>
        ) : responsaveisFiltrados.length > 0 ? (
          <div className="flex flex-col gap-4">
            {responsaveisFiltrados.map(resp => (
              <ResponsavelCard 
                key={resp.id} 
                responsavel={resp}
                onVerDetalhes={handleVerDetalhes} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhum responsável encontrado.</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes (Alinhado) */}
      <DetalhesModal
        isOpen={isModalDetalhesOpen}
        onClose={handleCloseDetalhes}
        title="Detalhes do Responsável"
      >
        {selectedResponsavel && (
          <>
            <DetalheItem icon={<User size={14} />} label="Nome" value={selectedResponsavel.nome} />
            <DetalheItem icon={<User size={14} />} label="Tipo" value={selectedResponsavel.tipo} />
            {selectedResponsavel.tipo === 'PF' ? (
              <>
                <DetalheItem icon={<User size={14} />} label="CPF" value={selectedResponsavel.cpf} />
                <DetalheItem icon={<User size={14} />} label="NIS" value={selectedResponsavel.nis} />
              </>
            ) : (
              <DetalheItem icon={<User size={14} />} label="CNPJ" value={selectedResponsavel.cnpj} />
            )}
            <DetalheItem icon={<Phone size={14} />} label="Telefone" value={selectedResponsavel.telefone} />
            <DetalheItem icon={<Mail size={14} />} label="Email" value={selectedResponsavel.email} />
            <DetalheItem icon={<MapPin size={14} />} label="Endereço" value={selectedResponsavel.endereco} />
            <DetalheItem icon={<Dog size={14} />} label="Animais" value={selectedResponsavel.animais.join(', ')} />
          </>
        )}
      </DetalhesModal>

      {/* Modal de Cadastro (Alinhado) */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Responsável"
        saveText="Cadastrar"
      >
        <TipoResponsavelRadio
          tipo={createFormData.tipo}
          onChange={handleRadioChange}
        />
        
        <FormInput
          label="Nome Completo"
          name="nome"
          placeholder="Insira o nome completo do responsável"
          value={createFormData.nome}
          onChange={handleFormChange}
        />
        
        {createFormData.tipo === 'PF' && (
          <>
            <FormInput
              label="CPF"
              name="cpf"
              placeholder="Insira o CPF do responsável"
              value={createFormData.cpf || ''}
              onChange={handleFormChange}
            />
             <FormInput
              label="Telefone"
              name="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={createFormData.telefone || ''}
              onChange={handleFormChange}
            />
            <FormInput
              label="Número do NIS"
              name="nis"
              placeholder="Insira o NIS do responsável"
              value={createFormData.nis || ''}
              onChange={handleFormChange}
            />
          </>
        )}

        {createFormData.tipo === 'ONG' && (
          <>
            <FormInput
              label="CNPJ"
              name="cnpj"
              placeholder="Insira o CNPJ do responsável"
              value={createFormData.cnpj || ''}
              onChange={handleFormChange}
            />
            <FormInput
              label="Telefone"
              name="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={createFormData.telefone || ''}
              onChange={handleFormChange}
            />
          </>
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
          label="Endereço"
          name="endereco"
          placeholder="Rua, Número, Bairro - Cidade/UF"
          value={createFormData.endereco || ''}
          onChange={handleFormChange}
        />
        <FormInput
          label="Senha" 
          name="senha"
          type="password"
          placeholder="Senha de acesso"
          value={createFormData.senha}
          onChange={handleFormChange}
        />
      </CadastroModal>

    </div>
  );
}