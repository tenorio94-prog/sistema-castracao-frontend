"use client"; 

import React, { useEffect, useState } from 'react';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import { VeterinarianService, Veterinarian, CreateVeterinarianData, UpdateVeterinarianData } from '@/services/veterinarian.service';

type Medico = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  crmv: string;
  especialidade: string;
  telefone: string;
};

type MedicoForm = Omit<Medico, 'id'> & { senha: string };

const emptyForm: MedicoForm = { 
  nome: '', 
  email: '',
  cpf: '',
  crmv: '', 
  especialidade: '', 
  telefone: '',
  senha: ''
};

export default function PaginaMedicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [createFormData, setCreateFormData] = useState<MedicoForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<MedicoForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar médicos da API
  const loadMedicos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Iniciando carregamento de veterinários...');
      const response = await VeterinarianService.getAll();
      console.log('📦 Resposta recebida:', response);
      
      // Converter dados da API para formato da UI
      const data = Array.isArray(response) ? response : response.data;
      console.log('📊 Dados processados:', data);
      console.log('📊 Primeiro veterinário (bruto):', data[0]);
      
      const medicosFormatados: Medico[] = data.map((vet: Veterinarian) => {
        console.log('🔍 Mapeando veterinário:', {
          id: vet.id,
          completeName: vet.completeName,
          email: vet.email,
          cpf: vet.cpf,
          crmv: vet.crmv,
          specialty: vet.specialty,
          phone: vet.phone,
          objetoCompleto: vet
        });
        
        return {
          id: vet.id,
          nome: vet.completeName,
          email: vet.email,
          cpf: vet.cpf || 'Não informado',
          crmv: vet.crmv || 'Não informado',
          especialidade: vet.specialty || 'Não informado',
          telefone: vet.phone || 'Não informado',
        };
      });
      
      console.log('✅ Médicos formatados:', medicosFormatados);
      setMedicos(medicosFormatados);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar médicos veterinários';
      setError(errorMessage);
      console.error('❌ Erro ao carregar médicos:', err);
      console.error('Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicos();
  }, []);

  const columns: ColumnDefinition<Medico>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium text-gray-900">{item.nome}</span> },
    { header: 'Email', cell: (item) => <span className="text-gray-700">{item.email}</span> },
    { header: 'CRMV', cell: (item) => <span>{item.crmv}</span> },
    { header: 'Especialidade', cell: (item) => <span>{item.especialidade}</span> },
  ];

  // Funções de Ação 
  const handleView = (medico: Medico) => {
    setSelectedMedico(medico);
    setIsViewModalOpen(true);
  };

  const handleEdit = (medico: Medico) => {
    setEditFormData({
      nome: medico.nome,
      email: medico.email,
      cpf: medico.cpf,
      crmv: medico.crmv,
      especialidade: medico.especialidade,
      telefone: medico.telefone,
      senha: ''
    });
    setSelectedMedico(medico);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (medico: Medico) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${medico.nome}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await VeterinarianService.delete(medico.id);
      await loadMedicos();
      alert('Médico deletado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao deletar médico: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateFormData(emptyForm); 
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    try {
      setLoading(true);
      setError(null);
      
      // Validação básica
      if (!createFormData.nome || !createFormData.email || !createFormData.senha || 
          !createFormData.cpf || !createFormData.crmv || !createFormData.telefone) {
        alert('Por favor, preencha todos os campos obrigatórios: Nome, Email, CPF, CRMV, Telefone e Senha');
        setLoading(false);
        return;
      }
      
      // O backend usa "completeName" não "name"
      const createData: CreateVeterinarianData = {
        completeName: createFormData.nome,
        email: createFormData.email,
        password: createFormData.senha,
        cpf: createFormData.cpf,
        phone: createFormData.telefone,
        crmv: createFormData.crmv,
        specialty: createFormData.especialidade || undefined
      };

      console.log('📤 Criando médico com dados corretos:', createData);
      await VeterinarianService.create(createData);
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

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedMedico) return; 
    
    try {
      setLoading(true);
      
      const updateData: UpdateVeterinarianData = {
        completeName: editFormData.nome,
        email: editFormData.email,
        cpf: editFormData.cpf,
        phone: editFormData.telefone,
        crmv: editFormData.crmv,
        specialty: editFormData.especialidade
      };

      // Só inclui senha se foi preenchida
      if (editFormData.senha && editFormData.senha.trim() !== '') {
        updateData.password = editFormData.senha;
      }

      await VeterinarianService.update(selectedMedico.id, updateData);
      await loadMedicos();
      setIsEditModalOpen(false);
      setSelectedMedico(null);
      alert('Médico atualizado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao atualizar médico: ${err.message}`);
    } finally {
      setLoading(false);
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
          <p className="text-gray-800">{selectedMedico?.nome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Email:</label>
          <p className="text-gray-800">{selectedMedico?.email}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CPF:</label>
          <p className="text-gray-800">{selectedMedico?.cpf}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CRMV:</label>
          <p className="text-gray-800">{selectedMedico?.crmv}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Especialidade:</label>
          <p className="text-gray-800">{selectedMedico?.especialidade}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Telefone:</label>
          <p className="text-gray-800">{selectedMedico?.telefone}</p>
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
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, cpf: e.target.value } : null)}
          placeholder="000.000.000-00"
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
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, telefone: e.target.value } : null)}
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
          onChange={(e) => setCreateFormData(prev => ({ ...prev, cpf: e.target.value }))}
          placeholder="000.000.000-00"
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
          onChange={(e) => setCreateFormData(prev => ({ ...prev, telefone: e.target.value }))}
          placeholder="(00) 00000-0000"
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
