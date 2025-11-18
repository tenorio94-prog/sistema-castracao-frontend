"use client";

import React, { useEffect, useState } from 'react';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { VeterinarianService, Veterinarian, UpdateVeterinarianData } from '@/services/veterinarian.service';
import { AuthService } from '@/services/auth.service';
import { CreateUserDto, Role } from '@/types/auth.types';
import { maskCPF, maskPhone, unmask, validateCPF, validatePhone } from '@/lib/masks';

type MedicoUI = {
  id: number;
  userId: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  crmv: string;
  especialidade: string;
  ativo: boolean;
};

type MedicoForm = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  crmv: string;
  especialidade: string;
  senha: string;
};

const emptyForm: MedicoForm = {
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  crmv: '',
  especialidade: '',
  senha: '',
};

export default function PaginaMedicos() {
  const [medicos, setMedicos] = useState<MedicoUI[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState<MedicoUI | null>(null);
  const [createFormData, setCreateFormData] = useState<MedicoForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<MedicoForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar médicos do backend
   */
  const loadMedicos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando veterinários...');
      const data = await VeterinarianService.getAll();
      
      console.log('📦 Dados brutos do backend:', data);

      const medicosFormatados: MedicoUI[] = data.map((vet: Veterinarian) => {
        console.log('🔍 Veterinário individual:', vet);
        console.log('👤 User do veterinário:', vet.user);
        
        return {
          id: vet.id,
          userId: vet.userId,
          nome: vet.user?.completeName || 'Nome não informado',
          email: vet.user?.email || 'Email não informado',
          cpf: vet.user?.cpf || '',
          telefone: vet.user?.phone || '',
          crmv: vet.crmv || '',
          especialidade: vet.specialty || '',
          ativo: vet.active,
        };
      });

      console.log('✅ Médicos formatados:', medicosFormatados);
      setMedicos(medicosFormatados);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar médicos veterinários';
      setError(errorMessage);
      console.error('❌ Erro ao carregar médicos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicos();
  }, []);

  /**
   * Colunas da tabela
   */
  const columns: ColumnDefinition<MedicoUI>[] = [
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
      header: 'CRMV',
      cell: (item) => <span className="font-mono">{item.crmv || 'Não informado'}</span>,
    },
    {
      header: 'Especialidade',
      cell: (item) => <span className="text-gray-600">{item.especialidade || 'Não informada'}</span>,
    },
    {
      header: 'Telefone',
      cell: (item) => <span>{item.telefone ? maskPhone(item.telefone) : 'Não informado'}</span>,
    },
    {
      header: 'Status',
      cell: (item) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            item.ativo
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  /**
   * Visualizar detalhes
   */
  const handleView = (medico: MedicoUI) => {
    setSelectedMedico(medico);
    setIsViewModalOpen(true);
  };

  /**
   * Editar médico
   */
  const handleEdit = (medico: MedicoUI) => {
    setEditFormData({
      nome: medico.nome,
      email: medico.email,
      cpf: maskCPF(medico.cpf),
      telefone: maskPhone(medico.telefone),
      crmv: medico.crmv,
      especialidade: medico.especialidade,
      senha: '',
    });
    setSelectedMedico(medico);
    setIsEditModalOpen(true);
  };

  /**
   * Deletar médico
   */
  const handleDelete = async (medico: MedicoUI) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${medico.nome}?`)) {
      return;
    }

    try {
      setLoading(true);
      await VeterinarianService.delete(medico.userId);
      await loadMedicos();
      alert('Médico deletado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao deletar médico: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal de cadastro
   */
  const handleOpenCreate = () => {
    setCreateFormData(emptyForm);
    setIsCreateModalOpen(true);
  };

  /**
   * Salvar novo médico - Usa POST /auth/register
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
      if (!createFormData.crmv.trim()) {
        alert('CRMV é obrigatório');
        return;
      }

      // Criar usuário via AuthService (POST /auth/register)
      const createUserDto: CreateUserDto = {
        completeName: createFormData.nome,
        email: createFormData.email,
        password: createFormData.senha,
        cpf: unmask(createFormData.cpf),
        phone: unmask(createFormData.telefone),
        role: Role.veterinarian,
        crmv: createFormData.crmv,
        specialty: createFormData.especialidade || undefined,
      };

      console.log('📤 Criando usuário veterinário:', createUserDto);
      await AuthService.register(createUserDto);

      await loadMedicos();
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      alert('Médico cadastrado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao cadastrar médico:', err);
      alert(`Erro ao cadastrar médico: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Salvar edição - Usa PATCH /veterinarian/:id
   */
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedMedico) return;

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

      const updateData: UpdateVeterinarianData = {
        completeName: editFormData.nome,
        email: editFormData.email,
        cpf: unmask(editFormData.cpf),
        phone: unmask(editFormData.telefone),
        crmv: editFormData.crmv,
        specialty: editFormData.especialidade || undefined,
      };

      // Só inclui senha se foi preenchida
      if (editFormData.senha && editFormData.senha.trim() !== '') {
        updateData.password = editFormData.senha;
      }

      console.log('📤 Atualizando veterinário:', updateData);
      await VeterinarianService.update(selectedMedico.userId, updateData);

      await loadMedicos();
      setIsEditModalOpen(false);
      setSelectedMedico(null);
      alert('Médico atualizado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar médico:', err);
      alert(`Erro ao atualizar médico: ${err.message}`);
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
        title="Gerenciar Médicos"
        buttonText="Cadastrar Médico"
        onButtonClick={handleOpenCreate} 
      />
      
      <CrudDisplay<Medico>
        data={medicos}
        columns={columns}
        searchPlaceholder="Buscar por nome ou CRMV..."
        emptyMessage="Nenhum médico veterinário cadastrado."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      {/* Modal de Visualização */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedMedico}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Médico"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedMedico?.nome || 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Email:</label>
          <p className="text-gray-800">{selectedMedico?.email || 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CPF:</label>
          <p className="text-gray-800">{selectedMedico?.cpf ? maskCPF(selectedMedico.cpf) : 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CRMV:</label>
          <p className="text-gray-800">{selectedMedico?.crmv || 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Especialidade:</label>
          <p className="text-gray-800">{selectedMedico?.especialidade || 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Telefone:</label>
          <p className="text-gray-800">{selectedMedico?.telefone ? maskPhone(selectedMedico.telefone) : 'Não informado'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Status:</label>
          <p className="text-gray-800">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                selectedMedico?.ativo
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {selectedMedico?.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </p>
        </div>
      </ViewModal>

      {/* Modal de Edição */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Médico"
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
          label="CRMV:"
          name="crmv"
          value={editFormData?.crmv || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, crmv: e.target.value } : null)}
          required
        />
        <FormInput
          label="Especialidade:"
          name="especialidade"
          value={editFormData?.especialidade || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, especialidade: e.target.value } : null)}
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
        title="Cadastrar Novo Médico"
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
          label="CRMV:"
          name="crmv"
          value={createFormData.crmv}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, crmv: e.target.value }))}
          required
        />
        <FormInput
          label="Especialidade:"
          name="especialidade"
          value={createFormData.especialidade}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, especialidade: e.target.value }))}
          placeholder="Ex: Cirurgia, Clínica Geral..."
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
          label="Senha:"
          name="senha"
          type="password"
          value={createFormData.senha}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, senha: e.target.value }))}
          required
        />
      </CadastroModal>
    </div>
  );
}
