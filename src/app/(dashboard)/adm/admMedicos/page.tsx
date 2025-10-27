"use client"; 
// Seus imports
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import React, { useEffect, useState } from 'react';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal'; // Usei 'CadastroModal' como você importou

// --- (ERRO 1 e 2 CORRIGIDOS) ---
// Definição dos Tipos (Estavam faltando)
type Medico = {
  id: string;
  nome: string;
  crmv: string;
  especialidade: string;
};

type MedicoForm = Omit<Medico, 'id'>;
const emptyForm: MedicoForm = { nome: '', crmv: '', especialidade: '' };

// Função para buscar dados da API (Estava faltando)
async function fetchMedicos(): Promise<Medico[]> {
  try {
    // Descomente quando sua API estiver pronta
    // const response = await fetch('/api/medicos');
    // if (!response.ok) {
    //   throw new Error('Falha ao buscar dados');
    // }
    // return await response.json();

    // Dados simulados por enquanto:
    return [
      { id: '1', nome: 'Dra. Cecília', crmv: 'CRMV-PE 1546', especialidade: 'Cirurgia Veterinária' },
      { id: '2', nome: 'Dr. Carlos', crmv: 'CRMV-PE 6532', especialidade: 'Anestesiologia' },
      { id: '3', nome: 'Dr. Roberto Santos', crmv: 'CRMV-PE 8548', especialidade: 'Clínica Geral' },
    ];
  } catch (error) {
    console.error(error);
    return []; // Retorna um array vazio em caso de erro
  }
}

// Componente de Input (Estava faltando)
const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-semibold text-gray-600">{props.label}</label>
    <input
      {...props}
      id={props.id || props.name}
      className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
    />
  </div>
);


export default function PaginaMedicos() {
  // --- (ERRO 3 CORRIGIDO) ---
  // Todos os states (Estavam faltando)
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [createFormData, setCreateFormData] = useState<MedicoForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<Medico | null>(null);

  
  // Lógica para buscar os dados da API
  useEffect(() => {
    fetchMedicos().then(data => setMedicos(data));
  }, []);

  // Definição das Colunas (Estava faltando)
  const columns: ColumnDefinition<Medico>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium">{item.nome}</span> },
    { header: 'CRMV', cell: (item) => <span>{item.crmv}</span> },
    { header: 'Especialidade', cell: (item) => <span>{item.especialidade}</span> },
  ];

  // Funções de Ação (Estavam faltando)

  // Ações do CrudDisplay
  const handleView = (medico: Medico) => {
    setSelectedMedico(medico);
    setIsViewModalOpen(true);
  };

  const handleEdit = (medico: Medico) => {
    setEditFormData(medico);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (medico: Medico) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${medico.nome}?`)) {
      return;
    }
    // ... lógica de API DELETE ...
    setMedicos(medicos.filter(m => m.id !== medico.id));
    alert('Médico deletado com sucesso!');
  };

  // Ação para abrir o modal de cadastro
  const handleOpenCreate = () => {
    setCreateFormData(emptyForm); 
    setIsCreateModalOpen(true);
  };

  // Função para "salvar" o NOVO médico
  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    // ... (lógica de API POST para 'createFormData')
    const novoMedico = { ...createFormData, id: Math.random().toString() }; 
    setMedicos([...medicos, novoMedico]); 
    setIsCreateModalOpen(false); 
    alert('Médico cadastrado!');
  };

  // Função para "salvar" a EDIÇÃO
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return; 
    // ... (lógica de API PUT/PATCH para 'editFormData')
    setMedicos(medicos.map(m => m.id === editFormData.id ? editFormData : m));
    setIsEditModalOpen(false);
  };


  return (
    <div className="space-y-4">
      
      {/* Cabeçalho */}
      <CrudHeader
        title="Gerenciar Médicos"
        buttonText="Cadastrar Médico"
        onButtonClick={handleOpenCreate} 
      />
      
      {/* 6. Use o Componente Crud! */}
      {/* --- (ERRO 4 CORRIGIDO) --- */}
      {/* Propriedades preenchidas */}
      <CrudDisplay<Medico>
        data={medicos}
        columns={columns}
        searchPlaceholder="Buscar por nome ou CRMV..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 7. Renderização dos Modais */}
      
      {/* Modal de Visualização */}
      {/* --- (ERRO 4 CORRIGIDO) --- */}
      {/* Props 'isOpen', 'onClose', 'title' e 'children' preenchidas */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedMedico}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Médico"
      >
        {/* Children: Conteúdo do modal */}
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedMedico?.nome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CRMV:</label>
          <p className="text-gray-800">{selectedMedico?.crmv}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Especialidade:</label>
          <p className="text-gray-800">{selectedMedico?.especialidade}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição (Usando CadastroModal) */}
      {/* --- (ERRO 4 CORRIGIDO) --- */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Médico"
        saveText="Salvar Alterações"
      >
        {/* Children: Inputs do formulário */}
        <FormInput
          label="Nome:"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, nome: e.target.value } : null)}
        />
        <FormInput
          label="CRMV:"
          name="crmv"
          value={editFormData?.crmv || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, crmv: e.target.value } : null)}
        />
        <FormInput
          label="Especialidade:"
          name="especialidade"
          value={editFormData?.especialidade || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, especialidade: e.target.value } : null)}
        />
      </CadastroModal>

      {/* Modal de Cadastro (Usando CadastroModal) */}
      {/* --- (ERRO 4 CORRIGIDO) --- */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Médico"
        saveText="Cadastrar"
      >
        {/* Children: Inputs do formulário */}
        <FormInput
          label="Nome:"
          name="nome"
          value={createFormData.nome}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, nome: e.target.value }))}
        />
        <FormInput
          label="CRMV:"
          name="crmv"
          value={createFormData.crmv}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, crmv: e.target.value }))}
        />
        <FormInput
          label="Especialidade:"
          name="especialidade"
          value={createFormData.especialidade}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, especialidade: e.target.value }))}
        />
      </CadastroModal>
    </div>
  );
}

// REMOVA a função 'setMedicos' extra que estava aqui