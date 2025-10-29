"use client"; 

import React, { useEffect, useState } from 'react';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
// CrudHeader foi REMOVIDO dos imports
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 

// 1. Definição de Tipos
type Perfil = 'Médico' | 'Atendente' | 'Estudante' | 'Administrador';

type Usuario = {
  id: string;
  nome: string;
  documento: string; 
  perfil: Perfil;
  senha: string; 
};

type UsuarioForm = {
  nome: string;
  senha: string;
};

// 2. Componente de Badge de Perfil (sem alteração)
const PerfilBadge: React.FC<{ perfil: Perfil }> = ({ perfil }) => {
  const getStatusClasses = () => {
    switch (perfil) {
      case 'Médico':
        return 'bg-green-200 text-green-800'; 
      case 'Atendente':
        return 'bg-blue-200 text-blue-800 border border-blue-300'; 
      case 'Estudante':
        return 'bg-white text-gray-700 border border-gray-300'; 
      case 'Administrador':
        return 'bg-gray-800 text-white'; 
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full font-semibold text-xs ${getStatusClasses()}`}>
      {perfil}
    </span>
  );
};


// 3. Lógica de API (Fetch Agregado) (sem alteração)
async function fetchUsuarios(): Promise<Usuario[]> {
  try {
    const medicos = [
      { id: 'm1', nome: 'Dr. Maria Cecília', documento: 'CRMV-PE 1234', perfil: 'Médico' as Perfil, senha: '123' },
    ];
    const atendentes = [
      { id: 'a1', nome: 'Miguel Tenório', documento: '123.456.789-00', perfil: 'Atendente' as Perfil, senha: '123' },
    ];
    const estudantes = [
      { id: 'e1', nome: 'Gustavo Henrique', documento: '2021003', perfil: 'Estudante' as Perfil, senha: '123' },
      { id: 'e2', nome: 'Gustavo Henrique', documento: '2021003', perfil: 'Estudante' as Perfil, senha: '123' },
    ];
    const admins = [
      { id: 'adm1', nome: 'Admin', documento: '000.000.000-00', perfil: 'Administrador' as Perfil, senha: '123' },
    ];
    
    return [...medicos, ...atendentes, ...estudantes, ...admins];

  } catch (error) {
    console.error(error);
    return []; 
  }
}

// 4. Componente da Página
export default function PaginaGestaoUsuarios() {
  // 5. Estados (sem alteração)
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [editFormData, setEditFormData] = useState<UsuarioForm | null>(null);

  
  useEffect(() => {
    fetchUsuarios().then(data => setUsuarios(data));
  }, []);

  // 6. Definição das Colunas (sem alteração)
  const columns: ColumnDefinition<Usuario>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium text-gray-900">{item.nome}</span> },
    { header: 'CPF/CMRV', cell: (item) => <span>{item.documento}</span> },
    { header: 'Perfil', cell: (item) => <PerfilBadge perfil={item.perfil} /> },
  ];

  // 7. Handlers (sem alteração)
  const handleView = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsViewModalOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditFormData({ nome: usuario.nome, senha: '' }); 
    setSelectedUsuario(usuario); 
    setIsEditModalOpen(true);
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!window.confirm(`Tem certeza que deseja deletar o usuário ${usuario.nome}?`)) {
      return;
    }
    setUsuarios(usuarios.filter(u => u.id !== usuario.id));
    alert('Usuário deletado com sucesso!');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedUsuario) return; 

    const senhaFinal = editFormData.senha === '' ? selectedUsuario.senha : editFormData.senha;

    setUsuarios(usuarios.map(u => 
      u.id === selectedUsuario.id 
        ? { ...u, nome: editFormData.nome, senha: senhaFinal } 
        : u
    ));
    
    setIsEditModalOpen(false);
    setSelectedUsuario(null);
  };


  // 8. JSX (Renderização ATUALIZADA)
  return (
    <div className="space-y-4">
      
      {/* ########################################## */}
      {/* ### CrudHeader REMOVIDO e substituído ### */}
      {/* ########################################## */}
      <div>
        <h1 className="text-2xl font-bold text-green-700">Gestão de Usuários</h1>
        <p className="text-gray-600">
          {usuarios.length} usuário(s) cadastrado(s)
        </p>
      </div>
      
      {/* O CrudDisplay continua funcionando normalmente */}
      <CrudDisplay<Usuario>
        data={usuarios}
        columns={columns}
        searchPlaceholder="Buscar por nome ou CPF/CMRV..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização (sem alteração) */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedUsuario}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Usuário"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedUsuario?.nome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Documento (CPF/CMRV):</label>
          <p className="text-gray-800">{selectedUsuario?.documento}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Perfil:</label>
          <p className="text-gray-800">{selectedUsuario?.perfil}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição (sem alteração) */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Usuário"
        saveText="Salvar Alterações"
      >
        <FormInput
          label="Nome:"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, nome: e.target.value } : null)}
        />
        <FormInput
          label="Documento (CPF/CMRV):"
          name="documento"
          value={selectedUsuario?.documento || ''}
          disabled 
        />
        <FormInput
          label="Perfil:"
          name="perfil"
          value={selectedUsuario?.perfil || ''}
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
    </div>
  );
}