"use client"; 

import React, { useEffect, useState, useMemo } from 'react';
import { User, Stethoscope, Users, HeartHandshake, Shield } from 'lucide-react';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import UsuarioCard, { UsuarioUI } from '@/components/CRUD/UsuarioCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import { maskCPF, maskPhone, validateCPF } from '@/lib/masks';

// --- TIPOS ---
type Perfil = 'Médico' | 'Atendente' | 'Responsável' | 'Administrador' | 'SEMAS' | 'Estudante';

type Usuario = UsuarioUI; // Reutiliza a tipagem do Card

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

const emptyForm: UsuarioForm = { 
  email: '', cpf: '', telefone: '', perfil: 'Atendente', senha: '', crmv: '', endereco: ''
};

// --- MOCK SERVICE ---
const MOCK_DB: Usuario[] = [
  { id: '1', email: 'admin@vet.com', perfil: 'Administrador', telefone: '(81) 99999-9999', cpf: '000.000.000-00' },
  { id: '2', email: 'medico@vet.com', perfil: 'Médico', telefone: '(81) 98888-8888', crmv: '1234-PE', cpf: '111.111.111-11' },
  { id: '3', email: 'atendente@vet.com', perfil: 'Atendente', telefone: '(81) 97777-7777', cpf: '222.222.222-22' },
  { id: '4', email: 'ana.cliente@gmail.com', perfil: 'Responsável', telefone: '(81) 96666-6666', endereco: 'Rua A, 123', cpf: '333.333.333-33' },
];

const MockUserService = {
  getAll: async (): Promise<Usuario[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_DB]), 600));
  },
  create: async (data: any): Promise<Usuario> => {
    return new Promise(resolve => setTimeout(() => resolve({ ...data, id: Math.random().toString() }), 600));
  },
  update: async (id: string, data: any): Promise<void> => {
    return new Promise(resolve => setTimeout(() => resolve(), 600));
  },
  delete: async (id: string): Promise<void> => {
    return new Promise(resolve => setTimeout(() => resolve(), 600));
  }
};

// Badge de Perfil para Tabela
const PerfilBadge: React.FC<{ perfil: Perfil }> = ({ perfil }) => {
  const styles = {
    'Médico': 'bg-blue-100 text-blue-700',
    'Atendente': 'bg-teal-100 text-teal-700',
    'Responsável': 'bg-purple-100 text-purple-700',
    'Administrador': 'bg-slate-800 text-white',
    'Estudante': 'bg-amber-100 text-amber-700',
    'SEMAS': 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[perfil] || 'bg-gray-100'}`}>
      {perfil}
    </span>
  );
};

export default function PaginaGestaoUsuarios() {
  // --- ESTADOS ---
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  // Filtros
  const [filterVet, setFilterVet] = useState(false);
  const [filterAttendant, setFilterAttendant] = useState(false);
  const [filterOwner, setFilterOwner] = useState(false);

  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [editFormData, setEditFormData] = useState<UsuarioForm | null>(null);
  const [createFormData, setCreateFormData] = useState<UsuarioForm>(emptyForm);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LOADERS ---
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await MockUserService.getAll();
      setUsuarios(data);
    } catch (err: any) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsuarios(); }, []);

  // --- FILTRAGEM ---
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(user => {
      let match = true;
      if (filterVet || filterAttendant || filterOwner) {
        match = false;
        if (filterVet && user.perfil === 'Médico') match = true;
        if (filterAttendant && user.perfil === 'Atendente') match = true;
        if (filterOwner && user.perfil === 'Responsável') match = true;
      }
      return match;
    });
  }, [usuarios, filterVet, filterAttendant, filterOwner]);

  // --- HANDLERS ---
  const handleView = (usuario: Usuario) => { setSelectedUsuario(usuario); setIsViewModalOpen(true); };

  const handleEdit = (usuario: Usuario) => {
    setEditFormData({ 
      email: usuario.email, cpf: maskCPF(usuario.cpf || ''), telefone: maskPhone(usuario.telefone || ''),
      perfil: usuario.perfil, senha: '', crmv: usuario.crmv || '', endereco: usuario.endereco || ''
    }); 
    setSelectedUsuario(usuario); setIsEditModalOpen(true);
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!window.confirm(`Deletar usuário ${usuario.email}?`)) return;
    try {
      setLoading(true); 
      await MockUserService.delete(usuario.id);
      setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
      alert('Usuário deletado com sucesso!');
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Validação simples
      if (createFormData.perfil === 'Médico' && !createFormData.crmv) { alert('CRMV Obrigatório'); setLoading(false); return; }
      
      const newUser = await MockUserService.create({ ...createFormData });
      setUsuarios(prev => [...prev, newUser]);
      setIsCreateModalOpen(false); setCreateFormData(emptyForm);
      alert('Criado com sucesso!');
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedUsuario) return; 
    try {
      setLoading(true);
      await MockUserService.update(selectedUsuario.id, editFormData);
      
      setUsuarios(prev => prev.map(u => u.id === selectedUsuario.id ? { ...u, ...editFormData } : u));
      setIsEditModalOpen(false); setSelectedUsuario(null);
      alert('Atualizado com sucesso!');
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  // Handlers de Input
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const val = maskCPF(e.target.value);
    if (isEdit) setEditFormData(prev => prev ? { ...prev, cpf: val } : null);
    else setCreateFormData(prev => ({ ...prev, cpf: val }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const val = maskPhone(e.target.value);
    if (isEdit) setEditFormData(prev => prev ? { ...prev, telefone: val } : null);
    else setCreateFormData(prev => ({ ...prev, telefone: val }));
  };

  // --- COLUNAS ---
  const columns: ColumnDefinition<Usuario>[] = [
    { header: 'Email', cell: (item) => <span className="font-bold text-gray-900">{item.email}</span> },
    { header: 'CPF', cell: (item) => <span className="text-gray-600 font-mono text-xs">{item.cpf || '-'}</span> },
    { header: 'Telefone', cell: (item) => <span className="text-gray-600">{item.telefone || '-'}</span> },
    { header: 'Perfil', cell: (item) => <PerfilBadge perfil={item.perfil} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <CrudHeader 
        title="Gestão de Usuários"
        description="Controle central de acesso e perfis do sistema."
        buttonText="Novo Usuário"
        onButtonClick={() => { setCreateFormData(emptyForm); setIsCreateModalOpen(true); }}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
      
      <CrudDisplay<Usuario>
        data={filteredUsuarios}
        columns={columns}
        searchPlaceholder="Buscar por email ou CPF..."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        
        // FILTROS
        extraFilters={
          <>
             <button onClick={() => setFilterVet(!filterVet)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterVet ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Stethoscope size={16} /> Médicos
              </button>
              <button onClick={() => setFilterAttendant(!filterAttendant)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterAttendant ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Users size={16} /> Atendentes
              </button>
              <button onClick={() => setFilterOwner(!filterOwner)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterOwner ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <HeartHandshake size={16} /> Tutores
              </button>
          </>
        }

        // GRID VIEW
        renderGrid={(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(user => (
              <UsuarioCard 
                key={user.id} 
                usuario={user} 
                onView={handleView} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      />

      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhes do Usuário">
        <div className="space-y-4">
           <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
               <Shield size={32} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedUsuario?.email}</h3>
               <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-bold uppercase mt-1">{selectedUsuario?.perfil}</span>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div><label className="text-xs font-bold text-gray-400 uppercase">CPF</label><p className="font-medium">{selectedUsuario?.cpf || '-'}</p></div>
             <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="font-medium">{selectedUsuario?.telefone || '-'}</p></div>
           </div>
           {selectedUsuario?.perfil === 'Médico' && (
             <div><label className="text-xs font-bold text-gray-400 uppercase">CRMV</label><p className="font-medium">{selectedUsuario.crmv || '-'}</p></div>
           )}
           {selectedUsuario?.perfil === 'Responsável' && (
             <div><label className="text-xs font-bold text-gray-400 uppercase">Endereço</label><p className="font-medium">{selectedUsuario.endereco || '-'}</p></div>
           )}
        </div>
      </ViewModal>

      {/* --- MODAL CADASTRO --- */}
      <CadastroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSave} title="Novo Usuário" saveText="Cadastrar">
        <FormInput label="Email" name="email" type="email" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} required />
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Perfil</label>
          <select 
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
            value={createFormData.perfil} 
            onChange={e => setCreateFormData({...createFormData, perfil: e.target.value as Perfil})}
          >
            <option value="Atendente">Atendente</option>
            <option value="Médico">Médico</option>
            <option value="Responsável">Responsável</option>
            <option value="Administrador">Administrador</option>
            <option value="Estudante">Estudante</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="CPF" name="cpf" value={createFormData.cpf} onChange={e => handleCPFChange(e, false)} />
          <FormInput label="Telefone" name="telefone" value={createFormData.telefone} onChange={e => handlePhoneChange(e, false)} />
        </div>

        {/* Campos Condicionais */}
        {createFormData.perfil === 'Médico' && (
           <FormInput label="CRMV" name="crmv" value={createFormData.crmv} onChange={e => setCreateFormData({...createFormData, crmv: e.target.value})} required />
        )}
        {createFormData.perfil === 'Responsável' && (
           <FormInput label="Endereço" name="endereco" value={createFormData.endereco} onChange={e => setCreateFormData({...createFormData, endereco: e.target.value})} required />
        )}

        <FormInput label="Senha" name="senha" type="password" value={createFormData.senha} onChange={e => setCreateFormData({...createFormData, senha: e.target.value})} required />
      </CadastroModal>

      {/* --- MODAL EDIÇÃO --- */}
      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Usuário" saveText="Salvar">
        <FormInput label="Email" name="email" type="email" value={editFormData?.email || ''} onChange={e => setEditFormData(prev => prev ? {...prev, email: e.target.value} : null)} />
        
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Perfil</label>
          <select 
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
            value={editFormData?.perfil} 
            onChange={e => setEditFormData(prev => prev ? {...prev, perfil: e.target.value as Perfil} : null)}
          >
            <option value="Atendente">Atendente</option>
            <option value="Médico">Médico</option>
            <option value="Responsável">Responsável</option>
            <option value="Administrador">Administrador</option>
            <option value="Estudante">Estudante</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="CPF" name="cpf" value={editFormData?.cpf || ''} onChange={e => handleCPFChange(e, true)} />
          <FormInput label="Telefone" name="telefone" value={editFormData?.telefone || ''} onChange={e => handlePhoneChange(e, true)} />
        </div>

        {editFormData?.perfil === 'Médico' && (
           <FormInput label="CRMV" name="crmv" value={editFormData?.crmv || ''} onChange={e => setEditFormData(prev => prev ? {...prev, crmv: e.target.value} : null)} />
        )}
        {editFormData?.perfil === 'Responsável' && (
           <FormInput label="Endereço" name="endereco" value={editFormData?.endereco || ''} onChange={e => setEditFormData(prev => prev ? {...prev, endereco: e.target.value} : null)} />
        )}

        <div className="pt-4 border-t border-gray-100 mt-2">
          <p className="text-xs text-gray-500 mb-2">Deixe em branco para manter a senha atual.</p>
          <FormInput label="Nova Senha" name="senha" type="password" value={editFormData?.senha || ''} onChange={e => setEditFormData(prev => prev ? {...prev, senha: e.target.value} : null)} />
        </div>
      </CadastroModal>
    </div>
  );
}