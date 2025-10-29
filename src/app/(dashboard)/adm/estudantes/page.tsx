"use client"; 

import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import React, { useEffect, useState } from 'react';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; // Importando o componente global

// 1. Definição de Tipos (agora com 'cpf')
type Estudante = {
  id: string;
  nome: string;
  cpf: string;
  preceptor: string; 
  senha: string;     
};

type EstudanteForm = Omit<Estudante, 'id' | 'preceptor'>;
const emptyForm: EstudanteForm = { nome: '', cpf: '', senha: ''};


// 2. Lógica de API (Fetch)
async function fetchEstudantes(): Promise<Estudante[]> {
  try {
    // Simulação de dados (usei CPFs fictícios)
    return [
      { id: '1', nome: 'Maria Eugênia', cpf: '111.111.111-11', preceptor: 'Dra. Cecília', senha: 'senha1' },
      { id: '2', nome: 'Miguel Tenório', cpf: '222.222.222-22', preceptor: 'Dr. Carlos', senha: 'senha2' },
      { id: '3', nome: 'Gustavo Henrique', cpf: '333.333.333-33', preceptor: 'Dr. Roberto Santos', senha: 'senha3' },
      { id: '4', nome: 'Carlos Guedes', cpf: '444.444.444-44', preceptor: 'Dr. Adriano', senha: 'senha4' },
    ];
  } catch (error) {
    console.error(error);
    return []; 
  }
}


// 3. Componente da Página
export default function PaginaEstudantes() {
  // 4. Estados
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEstudante, setSelectedEstudante] = useState<Estudante | null>(null);
  const [createFormData, setCreateFormData] = useState<EstudanteForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<Estudante | null>(null);

  
  useEffect(() => {
    fetchEstudantes().then(data => setEstudantes(data));
  }, []);

  // Definição das Colunas (agora com 'CPF')
  const columns: ColumnDefinition<Estudante>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium">{item.nome}</span> },
    { header: 'CPF', cell: (item) => <span>{item.cpf}</span> },
    { header: 'Preceptor', cell: (item) => <span>{item.preceptor}</span> },
  ];

  // 5. Handlers
  const handleView = (estudante: Estudante) => {
    setSelectedEstudante(estudante);
    setIsViewModalOpen(true);
  };

  const handleEdit = (estudante: Estudante) => {
    setEditFormData(estudante);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (estudante: Estudante) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${estudante.nome}?`)) {
      return;
    }
    setEstudantes(estudantes.filter(m => m.id !== estudante.id));
    alert('Estudante deletado(a) com sucesso!');
  };

  const handleOpenCreate = () => {
    setCreateFormData(emptyForm); 
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log("Criando estudante com:", createFormData); 

    const novoEstudante: Estudante = { 
      ...createFormData, 
      id: Math.random().toString(),
      preceptor: 'A ser definido' 
    }; 

    setEstudantes([...estudantes, novoEstudante]); 
    setIsCreateModalOpen(false); 
    alert('Estudante cadastrado(a)!');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return; 
    console.log("Salvando edição:", editFormData);
    setEstudantes(estudantes.map(m => m.id === editFormData.id ? editFormData : m));
    setIsEditModalOpen(false);
  };


  // 6. JSX (Renderização)
  return (
    <div className="space-y-4">
      
      <CrudHeader
        title="Estudantes"
        buttonText="Novo Estudante"
        onButtonClick={handleOpenCreate} 
      />
      
      <CrudDisplay<Estudante>
        data={estudantes}
        columns={columns}
        searchPlaceholder="Buscar por nome ou CPF..." // Atualizado
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização (agora com 'CPF') */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedEstudante}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do(a) Estudante"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedEstudante?.nome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CPF:</label>
          <p className="text-gray-800">{selectedEstudante?.cpf}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Preceptor:</label>
          <p className="text-gray-800">{selectedEstudante?.preceptor}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição (agora com 'CPF') */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Estudante"
        saveText="Salvar Alterações"
      >
        <FormInput
          label="Nome Completo:"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, nome: e.target.value } : null)}
        />
        <FormInput
          label="CPF:"
          name="cpf"
          value={editFormData?.cpf || ''}
          disabled 
        />
        <FormInput
          label="Preceptor:"
          name="preceptor"
          value={editFormData?.preceptor || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, preceptor: e.target.value } : null)}
        />
        <FormInput
          label="Senha:"
          name="senha"
          type="password"
          placeholder="Deixe em branco para não alterar"
          value={editFormData?.senha || ''} 
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, senha: e.target.value } : null)}
        />
      </CadastroModal>

      {/* Modal de Cadastro (agora com 'CPF') */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Estudante"
        saveText="Cadastrar"
      >
        <FormInput
          label="Nome Completo"
          name="nome"
          placeholder="Insira o nome completo do estudante"
          value={createFormData.nome}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, nome: e.target.value }))}
        />
        <FormInput
          label="CPF"
          name="cpf"
          placeholder="Insira o CPF do estudante"
          value={createFormData.cpf}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, cpf: e.target.value }))}
        />
        <FormInput
          label="Senha"
          name="senha"
          type="password"
          placeholder="Senha do estudante"
          value={createFormData.senha}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, senha: e.target.value }))}
        />
        <p className="text-sm text-gray-500 mt-2">
          Clique no botão para gerar senha aleatória
        </p>
      </CadastroModal>
    </div>
  );
}