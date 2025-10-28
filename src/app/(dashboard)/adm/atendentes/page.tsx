"use client"; 

import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import React, { useEffect, useState } from 'react';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';

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
    // const response = await fetch('/api/atendentes'); 
    // ...
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

// [REQUISITO 5] Componente FormInput com lógica de VISUALIZAR SENHA
const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => {
  const { label, type, ...rest } = props;
  
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label htmlFor={props.id || props.name} className="block text-sm font-semibold text-gray-600">{label}</label>
      <div className="relative w-full">
        <input
          {...rest}
          id={props.id || props.name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          // Estilo condicional: adiciona 'bg-gray-100' se estiver desabilitado
          className={`w-full mt-1 p-2 pr-10 border border-gray-300 rounded-lg text-gray-500 ${props.disabled ? 'bg-gray-100' : ''}`}
        />
        {isPassword && (
          <button
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600"
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};


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
        // [REQUISITO 2] Placeholder atualizado
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
        {/* [REQUISITO 3 e 4] Label "CPF" e campo desabilitado */}
        <FormInput
          label="CPF:"
          name="cpf"
          value={editFormData?.cpf || ''}
          disabled // <-- AQUI: Campo desabilitado para edição
          // O onChange foi removido pois o campo não é mais editável
        />
        {/* [REQUISITO 5] Funcionalidade de senha já aplicada */}
        <FormInput
          label="Senha:"
          name="senha"
          type="password" // O FormInput cuida da lógica de visualização
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
        {/* [REQUISITO 1] Bug do CPF corrigido */}
        <FormInput
          label="CPF:"
          name="cpf"
          value={createFormData.cpf}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, cpf: e.target.value }))}
        />
        {/* [REQUISITO 5] Funcionalidade de senha já aplicada */}
        <FormInput
          label="Senha:"
          name="senha"
          type="password" // O FormInput cuida da lógica de visualização
          value={createFormData.senha}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, senha: e.target.value }))}
        />
      </CadastroModal>
    </div>
  );
}