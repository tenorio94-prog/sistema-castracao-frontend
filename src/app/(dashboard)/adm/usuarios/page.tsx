"use client"; 

import React, { useEffect, useState } from 'react';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import { UserService, User, UpdateUserData } from '@/services/user.service';
import { CreateUserDto, Role } from '@/types/auth.types';

// 1. Mapeamento de Perfis
const ROLE_MAP: Record<Role, string> = {
  [Role.administrator]: 'Administrador',
  [Role.veterinarian]: 'Médico',
  [Role.receptionist]: 'Atendente',
  [Role.semas]: 'SEMAS',
  [Role.student]: 'Estudante',
  [Role.petOwner]: 'Responsável',
} as const;

const ROLE_REVERSE_MAP: Record<string, Role> = {
  'Administrador': Role.administrator,
  'Médico': Role.veterinarian,
  'Atendente': Role.receptionist,
  'SEMAS': Role.semas,
  'Estudante': Role.student,
  'Responsável': Role.petOwner,
} as const;

type Perfil = 'Médico' | 'Atendente' | 'Responsável' | 'Administrador' | 'SEMAS' | 'Estudante';

type Usuario = {
  id: string;
  email: string;
  cpf?: string;
  telefone?: string;
  perfil: Perfil;
  crmv?: string;
  endereco?: string;
};

type UsuarioForm = {
  email: string;
  cpf: string;
  telefone: string;
  perfil: Perfil;
  senha: string;
  nome?: string;
  crmv?: string;
  endereco?: string;
};

// 2. Componente de Badge de Perfil
const PerfilBadge: React.FC<{ perfil: Perfil }> = ({ perfil }) => {
  const getStatusClasses = () => {
    switch (perfil) {
      case 'Médico':
        return 'bg-green-200 text-green-800'; 
      case 'Atendente':
        return 'bg-blue-200 text-blue-800 border border-blue-300'; 
      case 'Responsável':
        return 'bg-purple-200 text-purple-800 border border-purple-300'; 
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

const emptyForm: UsuarioForm = { 
  email: '', 
  cpf: '',
  telefone: '',
  perfil: 'Atendente',
  senha: '',
  crmv: '',
  endereco: ''
};

// 3. Componente da Página
export default function PaginaGestaoUsuarios() {
  // 4. Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [editFormData, setEditFormData] = useState<UsuarioForm | null>(null);
  const [createFormData, setCreateFormData] = useState<UsuarioForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5. Carregar usuários da API
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UserService.getAll();
      
      // Converter dados da API para formato da UI
      const data = Array.isArray(response) ? response : response.data;
      const usuariosFormatados: Usuario[] = data.map((user: User) => ({
        id: user.id,
        email: user.email,
        cpf: user.cpf || '',
        telefone: user.phone || '',
        perfil: ROLE_MAP[user.role] as Perfil,
        crmv: user.role === Role.veterinarian ? 'CRMV-PE' : undefined,
        endereco: user.role === Role.petOwner ? 'Endereço' : undefined
      }));
      
      setUsuarios(usuariosFormatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  // 6. Definição das Colunas
  const columns: ColumnDefinition<Usuario>[] = [
    { header: 'Email', cell: (item) => <span className="font-medium text-gray-900">{item.email}</span> },
    { header: 'CPF', cell: (item) => <span className="text-gray-700">{item.cpf || 'N/A'}</span> },
    { header: 'Telefone', cell: (item) => <span>{item.telefone || 'N/A'}</span> },
    { header: 'Perfil', cell: (item) => <PerfilBadge perfil={item.perfil} /> },
  ];

  // 7. Handlers
  const handleView = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsViewModalOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditFormData({ 
      email: usuario.email,
      cpf: usuario.cpf || '',
      telefone: usuario.telefone || '',
      perfil: usuario.perfil,
      senha: '',
      crmv: usuario.crmv || '',
      endereco: usuario.endereco || ''
    }); 
    setSelectedUsuario(usuario); 
    setIsEditModalOpen(true);
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!window.confirm(`Tem certeza que deseja deletar o usuário ${usuario.email}?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await UserService.delete(usuario.id);
      await loadUsuarios(); // Recarrega a lista
      alert('Usuário deletado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao deletar usuário: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedUsuario) return; 

    try {
      setLoading(true);
      
      const updateData: UpdateUserData = {
        email: editFormData.email,
        cpf: editFormData.cpf,
        phone: editFormData.telefone,
        role: ROLE_REVERSE_MAP[editFormData.perfil] as any
      };

      // Campos específicos por role
      if (editFormData.perfil === 'Médico') {
        updateData.crmv = editFormData.crmv;
      }
      if (editFormData.perfil === 'Responsável') {
        updateData.address = editFormData.endereco;
      }

      // Só inclui senha se foi preenchida
      if (editFormData.senha && editFormData.senha.trim() !== '') {
        updateData.password = editFormData.senha;
      }

      await UserService.update(selectedUsuario.id, updateData);
      await loadUsuarios(); // Recarrega a lista
      setIsEditModalOpen(false);
      setSelectedUsuario(null);
      alert('Usuário atualizado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao atualizar usuário: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const createData: CreateUserDto = {
        email: createFormData.email,
        password: createFormData.senha,
        cpf: createFormData.cpf,
        phone: createFormData.telefone,
        completeName: createFormData.nome || createFormData.email.split('@')[0],
        role: ROLE_REVERSE_MAP[createFormData.perfil],
      };

      // Campos obrigatórios por role
      if (createFormData.perfil === 'Médico') {
        if (!createFormData.crmv) {
          alert('CRMV é obrigatório para veterinários');
          return;
        }
        createData.crmv = createFormData.crmv;
      }
      
      if (createFormData.perfil === 'Responsável') {
        if (!createFormData.endereco) {
          alert('Endereço é obrigatório para responsáveis');
          return;
        }
        createData.address = createFormData.endereco;
      }

      await UserService.create(createData);
      await loadUsuarios(); // Recarrega a lista
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      alert('Usuário criado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao criar usuário: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 8. JSX (Renderização)
  return (
    <div className="space-y-4">
      {/* Cabeçalho com botão de adicionar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Gestão de Usuários</h1>
          <p className="text-gray-600">
            {loading ? 'Carregando...' : `${usuarios.length} usuário(s) cadastrado(s)`}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          disabled={loading}
        >
          + Novo Usuário
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Tabela de usuários */}
      <CrudDisplay<Usuario>
        data={usuarios}
        columns={columns}
        searchPlaceholder="Buscar por email ou CPF..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedUsuario}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Usuário"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Email:</label>
          <p className="text-gray-800">{selectedUsuario?.email}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">CPF:</label>
          <p className="text-gray-800">{selectedUsuario?.cpf || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Telefone:</label>
          <p className="text-gray-800">{selectedUsuario?.telefone || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Perfil:</label>
          <p className="text-gray-800">{selectedUsuario?.perfil}</p>
        </div>
        {selectedUsuario?.crmv && (
          <div>
            <label className="text-sm font-semibold text-gray-600">CRMV:</label>
            <p className="text-gray-800">{selectedUsuario.crmv}</p>
          </div>
        )}
        {selectedUsuario?.endereco && (
          <div>
            <label className="text-sm font-semibold text-gray-600">Endereço:</label>
            <p className="text-gray-800">{selectedUsuario.endereco}</p>
          </div>
        )}
      </ViewModal>

      {/* Modal de Edição */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Usuário"
        saveText="Salvar Alterações"
      >
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
        />
        <FormInput
          label="Telefone:"
          name="telefone"
          value={editFormData?.telefone || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, telefone: e.target.value } : null)}
        />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Perfil:</label>
          <select
            value={editFormData?.perfil || ''}
            onChange={(e) => setEditFormData(prev => prev ? { ...prev, perfil: e.target.value as Perfil } : null)}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          >
            <option value="Médico">Médico</option>
            <option value="Atendente">Atendente</option>
            <option value="Responsável">Responsável</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
        
        {editFormData?.perfil === 'Médico' && (
          <FormInput
            label="CRMV:"
            name="crmv"
            value={editFormData?.crmv || ''}
            onChange={(e) => setEditFormData(prev => prev ? { ...prev, crmv: e.target.value } : null)}
          />
        )}
        
        {editFormData?.perfil === 'Responsável' && (
          <FormInput
            label="Endereço:"
            name="endereco"
            value={editFormData?.endereco || ''}
            onChange={(e) => setEditFormData(prev => prev ? { ...prev, endereco: e.target.value } : null)}
          />
        )}
        
        <FormInput
          label="Nova Senha:"
          name="senha"
          type="password"
          placeholder="Deixe em branco para não alterar"
          value={editFormData?.senha || ''} 
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, senha: e.target.value } : null)}
        />
      </CadastroModal>

      {/* Modal de Criação */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateFormData(emptyForm);
        }}
        onSubmit={handleCreateSave}
        title="Novo Usuário"
        saveText="Cadastrar"
      >
        <FormInput
          label="Email:"
          name="email"
          type="email"
          value={createFormData.email}
          onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
          required
        />
        <FormInput
          label="CPF:"
          name="cpf"
          value={createFormData.cpf}
          onChange={(e) => setCreateFormData({ ...createFormData, cpf: e.target.value })}
        />
        <FormInput
          label="Telefone:"
          name="telefone"
          value={createFormData.telefone}
          onChange={(e) => setCreateFormData({ ...createFormData, telefone: e.target.value })}
        />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Perfil:</label>
          <select
            value={createFormData.perfil}
            onChange={(e) => setCreateFormData({ ...createFormData, perfil: e.target.value as Perfil })}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          >
            <option value="Médico">Médico</option>
            <option value="Atendente">Atendente</option>
            <option value="Responsável">Responsável</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
        
        {createFormData.perfil === 'Médico' && (
          <FormInput
            label="CRMV: *"
            name="crmv"
            value={createFormData.crmv || ''}
            onChange={(e) => setCreateFormData({ ...createFormData, crmv: e.target.value })}
            required
          />
        )}
        
        {createFormData.perfil === 'Responsável' && (
          <FormInput
            label="Endereço: *"
            name="endereco"
            value={createFormData.endereco || ''}
            onChange={(e) => setCreateFormData({ ...createFormData, endereco: e.target.value })}
            required
          />
        )}
        
        <FormInput
          label="Senha:"
          name="senha"
          type="password"
          value={createFormData.senha}
          onChange={(e) => setCreateFormData({ ...createFormData, senha: e.target.value })}
          required
        />
      </CadastroModal>
    </div>
  );
}
