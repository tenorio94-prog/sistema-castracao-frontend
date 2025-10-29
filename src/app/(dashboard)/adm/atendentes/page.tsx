"use client"; 

import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import React, { useEffect, useState } from 'react';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 

type Atendente = {
    id: string;
    nome: string;
    cpf: string;
    senha: string;
};

type AtendenteForm = Omit<Atendente, 'id'>;
const emptyForm: AtendenteForm = { nome: '', cpf: '', senha: ''};


async function fetchAtendentes(): Promise<Atendente[]> {
  try {
    // Simulação de dados:
    return [
      { id: '1', nome: 'Atendente Cecília', cpf: '107.004.678-32', senha: 'senha1' },
      { id: '2', nome: 'Atendente Carlos',  cpf: '112.654.897-09', senha: 'senha2' },
      { id: '3', nome: 'Atendente Roberto Santos', cpf: '109.432.574-32', senha: 'senha3' },
    ];
  } catch (error) {
    console.error(error);
    return []; 
  }
}


export default function PaginaAtendentes() {
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAtendente, setSelectedAtendente] = useState<Atendente | null>(null);
  const [createFormData, setCreateFormData] = useState<AtendenteForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<Atendente | null>(null);

  
  useEffect(() => {
    fetchAtendentes().then(data => setAtendentes(data));
  }, []);

  const columns: ColumnDefinition<Atendente>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium">{item.nome}</span> },
    { header: 'CPF', cell: (item) => <span>{item.cpf}</span> },
  ];

  // Funções de Ação
  const handleView = (atendente: Atendente) => {
    setSelectedAtendente(atendente);
    setIsViewModalOpen(true);
  };

  const handleEdit = (atendente: Atendente) => {
    setEditFormData(atendente);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (atendente: Atendente) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${atendente.nome}?`)) {
      return;
    }
    setAtendentes(atendentes.filter(m => m.id !== atendente.id));
    alert('Atendente deletado(a) com sucesso!');
  };

  const handleOpenCreate = () => {
    setCreateFormData(emptyForm); 
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    console.log("Criando atendente com:", createFormData); 
    const novoAtendente = { ...createFormData, id: Math.random().toString() }; 
    setAtendentes([...atendentes, novoAtendente]); 
    setIsCreateModalOpen(false); 
    alert('Atendente cadastrado(a)!');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return; 
    console.log("Salvando edição:", editFormData);
    setAtendentes(atendentes.map(m => m.id === editFormData.id ? editFormData : m));
    setIsEditModalOpen(false);
  };


  return (
    <div className="space-y-4">
      
      <CrudHeader
        title="Gerenciar Atendentes"
        buttonText="Cadastrar Atendente"
        onButtonClick={handleOpenCreate} 
      />
      
      <CrudDisplay<Atendente>
        data={atendentes}
        columns={columns}
        searchPlaceholder="Buscar por nome ou CPF..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedAtendente}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do(a) Atendente"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedAtendente?.nome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CPF:</label>
          <p className="text-gray-800">{selectedAtendente?.cpf}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Atendente"
        saveText="Salvar Alterações"
      >
        <FormInput
          label="Nome:"
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
          label="Senha:"
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
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo(a) Atendente"
        saveText="Cadastrar"
      >
        <FormInput
          label="Nome:"
          name="nome"
          value={createFormData.nome}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, nome: e.target.value }))}
        />
        <FormInput
          label="CPF:"
          name="cpf"
          value={createFormData.cpf}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, cpf: e.target.value }))} // <-- CORRIGIDO
        />
        <FormInput
          label="Senha:"
          name="senha"
          type="password" 
          value={createFormData.senha}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, senha: e.target.value }))}
        />
      </CadastroModal>
    </div>
  );
}