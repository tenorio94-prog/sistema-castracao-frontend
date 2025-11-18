"use client";

import React, { useEffect, useState } from 'react';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { PetOwnerService, PetOwner, UpdatePetOwnerDto } from '@/services/petowner.service';
import { AuthService } from '@/services/auth.service';
import { CreateUserDto, Role } from '@/types/auth.types';
import { maskCPF, maskPhone, unmask, validateCPF, validatePhone } from '@/lib/masks';

type ResponsavelUI = {
  id: number;
  userId: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
  qtdAnimais: number;
};

type ResponsavelForm = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  endereco: string;
  senha: string;
};

const emptyForm: ResponsavelForm = {
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  endereco: '',
  senha: '',
};

export default function PaginaResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<ResponsavelUI[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<ResponsavelUI | null>(null);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<ResponsavelForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar responsáveis do backend
   */
  const loadResponsaveis = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando responsáveis (PetOwners)...');
      const data = await PetOwnerService.getAll();

      console.log('📦 Dados brutos do backend:', data);

      const responsaveisFormatados: ResponsavelUI[] = data.map((petOwner: PetOwner) => {
        console.log('🔍 PetOwner individual:', petOwner);
        console.log('👤 User do petOwner:', petOwner.user);
        
        return {
          id: petOwner.id,
          userId: petOwner.userId,
          nome: petOwner.user?.completeName || 'Nome não informado',
          email: petOwner.user?.email || 'Email não informado',
          cpf: petOwner.user?.cpf || '',
          telefone: petOwner.user?.phone || '',
          endereco: petOwner.fullAddress || '',
          qtdAnimais: petOwner._count?.animals || 0,
        };
      });

      console.log('✅ Responsáveis formatados:', responsaveisFormatados);
      setResponsaveis(responsaveisFormatados);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar responsáveis';
      setError(errorMessage);
      console.error('❌ Erro ao carregar responsáveis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponsaveis();
  }, []);

  /**
   * Colunas da tabela
   */
  const columns: ColumnDefinition<ResponsavelUI>[] = [
    {
      header: 'Nome',
      cell: (item) => <span className="font-medium text-gray-900">{item.nome}</span>,
    },
    {
      header: 'CPF',
      cell: (item) => <span className="text-gray-700">{item.cpf ? maskCPF(item.cpf) : 'Não informado'}</span>,
    },
    {
      header: 'Email',
      cell: (item) => <span className="text-gray-700">{item.email}</span>,
    },
    {
      header: 'Telefone',
      cell: (item) => <span>{item.telefone ? maskPhone(item.telefone) : 'Não informado'}</span>,
    },
    {
      header: 'Animais',
      cell: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
          {item.qtdAnimais} {item.qtdAnimais === 1 ? 'animal' : 'animais'}
        </span>
      ),
    },
  ];

  /**
   * Visualizar detalhes
   */
  const handleView = (responsavel: ResponsavelUI) => {
    setSelectedResponsavel(responsavel);
    setIsViewModalOpen(true);
  };

  /**
   * Editar responsável
   */
  const handleEdit = (responsavel: ResponsavelUI) => {
    setEditFormData({
      nome: responsavel.nome,
      email: responsavel.email,
      cpf: maskCPF(responsavel.cpf),
      telefone: maskPhone(responsavel.telefone),
      endereco: responsavel.endereco,
      senha: '',
    });
    setSelectedResponsavel(responsavel);
    setIsEditModalOpen(true);
  };

  /**
   * Deletar responsável
   */
  const handleDelete = async (responsavel: ResponsavelUI) => {
    if (!window.confirm(`Tem certeza que deseja deletar o responsável ${responsavel.nome}?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log(`🗑️ Deletando responsável userId: ${responsavel.userId}`);
      await PetOwnerService.delete(responsavel.userId);
      await loadResponsaveis();
      alert('Responsável deletado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao deletar:', err);
      alert(`Erro ao deletar responsável: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal de criação
   */
  const handleOpenCreate = () => {
    setCreateFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  /**
   * Salvar novo responsável
   * 1. Cria User via POST /auth/register
   * 2. PetOwner é criado automaticamente pelo backend
   */
  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validações
      if (!createFormData.nome.trim()) {
        alert('Nome é obrigatório');
        return;
      }
      if (!createFormData.email.trim()) {
        alert('Email é obrigatório');
        return;
      }
      if (!createFormData.senha || createFormData.senha.length < 6) {
        alert('Senha deve ter no mínimo 6 caracteres');
        return;
      }
      if (!validateCPF(createFormData.cpf)) {
        alert('CPF inválido');
        return;
      }
      if (!validatePhone(createFormData.telefone)) {
        alert('Telefone inválido');
        return;
      }
      if (!createFormData.endereco.trim()) {
        alert('Endereço é obrigatório');
        return;
      }

      // Criar usuário via AuthService (POST /auth/register)
      const createUserDto: CreateUserDto = {
        completeName: createFormData.nome,
        email: createFormData.email,
        password: createFormData.senha,
        cpf: unmask(createFormData.cpf),
        phone: unmask(createFormData.telefone),
        role: Role.petOwner,
        address: createFormData.endereco,
      };

      console.log('📤 Criando usuário responsável:', createUserDto);
      await AuthService.register(createUserDto);

      await loadResponsaveis();
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      alert('Responsável cadastrado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao cadastrar responsável:', err);
      alert(`Erro ao cadastrar responsável: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Salvar edição - Usa PATCH /pet-owner/:userId
   */
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedResponsavel) return;

    try {
      setLoading(true);

      // Validações
      if (editFormData.cpf && !validateCPF(editFormData.cpf)) {
        alert('CPF inválido');
        return;
      }
      if (editFormData.telefone && !validatePhone(editFormData.telefone)) {
        alert('Telefone inválido');
        return;
      }

      const updateData: UpdatePetOwnerDto = {
        completeName: editFormData.nome,
        email: editFormData.email,
        cpf: unmask(editFormData.cpf),
        phone: unmask(editFormData.telefone),
        fullAddress: editFormData.endereco,
      };

      // Só inclui senha se foi preenchida
      if (editFormData.senha && editFormData.senha.trim() !== '') {
        updateData.password = editFormData.senha;
      }

      console.log('📤 Atualizando responsável:', updateData);
      await PetOwnerService.update(selectedResponsavel.userId, updateData);

      await loadResponsaveis();
      setIsEditModalOpen(false);
      setSelectedResponsavel(null);
      alert('Responsável atualizado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar responsável:', err);
      alert(`Erro ao atualizar responsável: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handlers de input com máscaras
   */
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const masked = maskCPF(e.target.value);
    if (isEdit) {
      setEditFormData((prev) => (prev ? { ...prev, cpf: masked } : null));
    } else {
      setCreateFormData((prev) => ({ ...prev, cpf: masked }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const masked = maskPhone(e.target.value);
    if (isEdit) {
      setEditFormData((prev) => (prev ? { ...prev, telefone: masked } : null));
    } else {
      setCreateFormData((prev) => ({ ...prev, telefone: masked }));
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <CrudHeader
        title="Gerenciar Responsáveis"
        buttonText="Cadastrar Responsável"
        onButtonClick={handleOpenCreate} 
      />
      
      <CrudDisplay<ResponsavelUI>
        data={responsaveis}
        columns={columns}
        searchPlaceholder="Buscar por nome, CPF ou email..."
        emptyMessage="Nenhum responsável cadastrado."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Modal de Visualização */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedResponsavel}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Responsável"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedResponsavel?.nome || 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Email:</label>
          <p className="text-gray-800">{selectedResponsavel?.email || 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CPF:</label>
          <p className="text-gray-800">{selectedResponsavel?.cpf ? maskCPF(selectedResponsavel.cpf) : 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Telefone:</label>
          <p className="text-gray-800">{selectedResponsavel?.telefone ? maskPhone(selectedResponsavel.telefone) : 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Endereço:</label>
          <p className="text-gray-800">{selectedResponsavel?.endereco || 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Quantidade de Animais:</label>
          <p className="text-gray-800">{selectedResponsavel?.qtdAnimais || 0}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Responsável"
        saveText="Salvar Alterações"
      >
        <FormInput
          label="Nome:"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, nome: e.target.value } : null)}
          required
        />
        <FormInput
          label="Email:"
          name="email"
          type="email"
          value={editFormData?.email || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, email: e.target.value } : null)}
          required
        />
        <FormInput
          label="CPF:"
          name="cpf"
          value={editFormData?.cpf || ''}
          onChange={(e) => handleCPFChange(e, true)}
          placeholder="000.000.000-00"
          maxLength={14}
        />
        <FormInput
          label="Telefone:"
          name="telefone"
          value={editFormData?.telefone || ''}
          onChange={(e) => handlePhoneChange(e, true)}
          placeholder="(00) 00000-0000"
          maxLength={15}
        />
        <FormInput
          label="Endereço:"
          name="endereco"
          value={editFormData?.endereco || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, endereco: e.target.value } : null)}
        />
        <FormInput
          label="Nova Senha:"
          name="senha"
          type="password" 
          placeholder="Deixe em branco para não alterar"
          value={editFormData?.senha || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, senha: e.target.value } : null)}
        />
      </CadastroModal>

      {/* Modal de Cadastro */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateFormData(emptyForm);
        }}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Responsável"
        saveText="Cadastrar"
      >
        <FormInput
          label="Nome:"
          name="nome"
          value={createFormData.nome}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, nome: e.target.value }))}
          required
        />
        <FormInput
          label="Email:"
          name="email"
          type="email"
          value={createFormData.email}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <FormInput
          label="CPF:"
          name="cpf"
          value={createFormData.cpf}
          onChange={(e) => handleCPFChange(e, false)}
          placeholder="000.000.000-00"
          maxLength={14}
          required
        />
        <FormInput
          label="Telefone:"
          name="telefone"
          value={createFormData.telefone}
          onChange={(e) => handlePhoneChange(e, false)}
          placeholder="(00) 00000-0000"
          maxLength={15}
          required
        />
        <FormInput
          label="Endereço:"
          name="endereco"
          value={createFormData.endereco}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, endereco: e.target.value }))}
          placeholder="Rua, Número, Bairro, Cidade - Estado"
          required
        />
        <FormInput
          label="Senha:"
          name="senha"
          type="password"
          value={createFormData.senha}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, senha: e.target.value }))}
          placeholder="Mínimo 6 caracteres"
          required
        />
      </CadastroModal>
    </div>
  );
}
