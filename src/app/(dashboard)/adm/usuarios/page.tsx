"use client"; 

import React, { useEffect, useState, useMemo } from 'react';
import { User, Stethoscope, Users, HeartHandshake, Shield } from 'lucide-react';
import { toast } from 'sonner';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import UsuarioCard, { UsuarioUI } from '@/components/CRUD/UsuarioCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import { UserService, User as UserType } from '@/services/user.service';
import { AuthService } from '@/services/auth.service'; 
import { CreateUserDto, Role } from '@/types/auth.types';
import { maskCPF, maskPhone, unmask, validateCPF } from '@/lib/masks';

// --- MAPEAMENTOS ---
const ROLE_TO_PERFIL: Record<Role, string> = {
  [Role.administrator]: 'Administrador',
  [Role.veterinarian]: 'Médico',
  [Role.receptionist]: 'Atendente',
  [Role.semas]: 'SEMAS',
  [Role.petOwner]: 'Responsável',
  [Role.student]: 'Estudante',
};

const PERFIL_TO_ROLE: Record<string, Role> = {
  'Administrador': Role.administrator,
  'Médico': Role.veterinarian,
  'Atendente': Role.receptionist,
  'SEMAS': Role.semas,
  'Responsável': Role.petOwner,
  'Estudante': Role.student,
};

// --- TIPOS ---
type Perfil = 'Médico' | 'Atendente' | 'Responsável' | 'Administrador' | 'SEMAS' | 'Estudante';

type UsuarioForm = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  perfil: Perfil;
  senha: string;
  crmv?: string;
  especialidade?: string;
  endereco?: string;
  nis?: string;
};

const emptyForm: UsuarioForm = { 
  nome: '',
  email: '', 
  cpf: '', 
  telefone: '', 
  perfil: 'Atendente', 
  senha: '', 
  crmv: '', 
  especialidade: '',
  endereco: '',
  nis: ''
};

// Badge de Perfil para Tabela
const PerfilBadge: React.FC<{ perfil: string }> = ({ perfil }) => {
  const styles: Record<string, string> = {
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
  const [usuarios, setUsuarios] = useState<UsuarioUI[]>([]);
  
  // Filtros
  const [filterVet, setFilterVet] = useState(false);
  const [filterAttendant, setFilterAttendant] = useState(false);
  const [filterOwner, setFilterOwner] = useState(false);

  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioUI | null>(null);
  const [editFormData, setEditFormData] = useState<UsuarioForm | null>(null);
  const [createFormData, setCreateFormData] = useState<UsuarioForm>(emptyForm);
  
  const [loadingTable, setLoadingTable] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LOADERS ---
  const loadUsuarios = async () => {
    try {
      setLoadingTable(true);
      setError(null);
      
      const allUsers = await UserService.getAll();
      
      // Formatar para o formato da UI
      const formatados: UsuarioUI[] = allUsers.map((user: UserType) => ({
        id: user.id.toString(),
        nome: user.completeName, // Agora 'nome' existe em UsuarioUI
        email: user.email || 'Email não informado',
        perfil: (ROLE_TO_PERFIL[user.role] || 'Atendente') as UsuarioUI['perfil'],
        telefone: user.phone || '',
        cpf: user.cpf || '',
        crmv: user.veterinarian?.crmv || undefined,
        endereco: user.petOwner?.fullAddress || undefined,
      }));
      
      setUsuarios(formatados);
    } catch (err: any) {
      const msg = err.message || 'Erro ao carregar usuários';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => { loadUsuarios(); }, []);

  // --- BUSCAR DADOS FRESCOS ---
  const fetchFullDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      return await UserService.getById(Number(id));
    } catch (err) {
      toast.error("Erro ao buscar detalhes do usuário");
      throw err;
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- FILTRAGEM ---
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(user => {
      let match = true;
      if (filterVet || filterAttendant || filterOwner) {
        match = false;
        if (filterVet && (user.perfil === 'Médico' || user.perfil === 'Estudante')) match = true;
        if (filterAttendant && (user.perfil === 'Atendente' || user.perfil === 'SEMAS')) match = true;
        if (filterOwner && user.perfil === 'Responsável') match = true;
      }
      return match;
    });
  }, [usuarios, filterVet, filterAttendant, filterOwner]);

  // --- HANDLERS ---
  const handleView = async (usuario: UsuarioUI) => { 
    try {
      const freshData = await fetchFullDetails(usuario.id);
      const usuarioAtualizado: UsuarioUI = {
        ...usuario,
        nome: freshData.completeName, // Uso correto de 'nome'
        email: freshData.email,
        cpf: freshData.cpf,
        telefone: freshData.phone,
        crmv: freshData.veterinarian?.crmv || undefined,
        endereco: freshData.petOwner?.fullAddress || undefined
      };
      setSelectedUsuario(usuarioAtualizado); 
      setIsViewModalOpen(true); 
    } catch (e) { console.error(e); }
  };

  const handleEdit = async (usuario: UsuarioUI) => {
    try {
      const freshData = await fetchFullDetails(usuario.id);
      
      setEditFormData({ 
        nome: freshData.completeName,
        email: freshData.email, 
        cpf: maskCPF(freshData.cpf || ''), 
        telefone: maskPhone(freshData.phone || ''),
        perfil: (ROLE_TO_PERFIL[freshData.role] || 'Atendente') as Perfil, 
        senha: '', 
        crmv: freshData.veterinarian?.crmv || '', 
        especialidade: freshData.veterinarian?.specialty || '',
        endereco: freshData.petOwner?.fullAddress || '',
        nis: freshData.petOwner?.nis || '' // Acesso seguro pois atualizamos a interface User
      }); 
      
      setSelectedUsuario(usuario); 
      setIsEditModalOpen(true);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (usuario: UsuarioUI) => {
    toast(`Deletar usuário ${usuario.email}?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Deletar',
        onClick: async () => {
          try {
            setLoadingTable(true); 
            await UserService.delete(Number(usuario.id));
            await loadUsuarios();
            toast.success('Usuário deletado com sucesso!');
          } catch (err: any) { 
            toast.error(err.message || 'Erro ao deletar'); 
          } finally { 
            setLoadingTable(false); 
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingTable(true);
      
      if (!validateCPF(createFormData.cpf)) { toast.error('CPF inválido'); setLoadingTable(false); return; }
      if (!createFormData.senha || createFormData.senha.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); setLoadingTable(false); return; }
      if (!createFormData.nome?.trim()) { toast.error('Nome completo é obrigatório'); setLoadingTable(false); return; }
      if (createFormData.perfil === 'Médico' && !createFormData.crmv) { toast.error('CRMV é obrigatório para médicos'); setLoadingTable(false); return; }
      if (createFormData.perfil === 'Responsável' && !createFormData.endereco) { toast.error('Endereço é obrigatório para responsáveis'); setLoadingTable(false); return; }
      
      const role = PERFIL_TO_ROLE[createFormData.perfil];
      
      const createUserDto: CreateUserDto = {
        completeName: createFormData.nome,
        email: createFormData.email,
        password: createFormData.senha,
        cpf: unmask(createFormData.cpf),
        phone: unmask(createFormData.telefone),
        role: role,
      };
      
      if (role === Role.veterinarian || role === Role.student) {
        createUserDto.crmv = createFormData.crmv;
        createUserDto.specialty = createFormData.especialidade || undefined;
      }
      if (role === Role.petOwner) {
        createUserDto.address = createFormData.endereco; 
        createUserDto.nis = createFormData.nis || undefined;
      }
      
      await UserService.create(createUserDto); 
      
      await loadUsuarios();
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      toast.success('Usuário cadastrado com sucesso!');
    } catch (err: any) { 
      const msg = err.response?.data?.message || err.message;
      toast.error(`Erro ao cadastrar: ${msg}`);
    } finally { 
      setLoadingTable(false); 
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedUsuario) return; 
    
    try {
      setLoadingTable(true);
      
      if (editFormData.cpf && !validateCPF(editFormData.cpf)) { toast.error('CPF inválido'); setLoadingTable(false); return; }
      if (editFormData.senha && editFormData.senha.length > 0 && editFormData.senha.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); setLoadingTable(false); return; }
      
      const updateData: any = {};
      
      if (editFormData.nome?.trim()) updateData.completeName = editFormData.nome;
      if (editFormData.email) updateData.email = editFormData.email;
      if (editFormData.cpf) updateData.cpf = unmask(editFormData.cpf);
      if (editFormData.telefone) updateData.phone = unmask(editFormData.telefone);
      if (editFormData.senha?.trim()) updateData.password = editFormData.senha;
      
      if (editFormData.crmv) updateData.crmv = editFormData.crmv;
      if (editFormData.especialidade) updateData.specialty = editFormData.especialidade;
      if (editFormData.endereco) updateData.address = editFormData.endereco;
      if (editFormData.nis) updateData.nis = editFormData.nis;
      
      await UserService.update(Number(selectedUsuario.id), updateData);
      
      await loadUsuarios();
      setIsEditModalOpen(false);
      setSelectedUsuario(null);
      toast.success('Usuário atualizado com sucesso!');
    } catch (err: any) { 
      const msg = err.response?.data?.message || err.message;
      toast.error(`Erro ao atualizar: ${msg}`);
    } finally { 
      setLoadingTable(false); 
    }
  };

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

  const columns: ColumnDefinition<UsuarioUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Email', cell: (item) => <span className="text-gray-600">{item.email}</span> },
    { header: 'CPF', cell: (item) => <span className="text-gray-600 font-mono text-xs">{item.cpf ? maskCPF(item.cpf) : '-'}</span> },
    { header: 'Telefone', cell: (item) => <span className="text-gray-600">{item.telefone ? maskPhone(item.telefone) : '-'}</span> },
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

      {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2"><Shield size={16}/>{error}</div>}
      
      <CrudDisplay<UsuarioUI>
        data={filteredUsuarios}
        columns={columns}
        searchPlaceholder="Buscar por nome, email ou CPF..."
        isLoading={loadingTable}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        
        extraFilters={
          <>
             <button onClick={() => setFilterVet(!filterVet)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterVet ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Stethoscope size={16} /> Médicos
             </button>
             <button onClick={() => setFilterAttendant(!filterAttendant)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterAttendant ? 'bg-teal-50 border-teal-200 text-teal-700 ring-2 ring-teal-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Users size={16} /> Atendentes
             </button>
             <button onClick={() => setFilterOwner(!filterOwner)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterOwner ? 'bg-purple-50 border-purple-200 text-purple-700 ring-2 ring-purple-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <HeartHandshake size={16} /> Tutores
             </button>
          </>
        }

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

      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhes do Usuário">
        {loadingDetails ? (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                <User size={32} />
                </div>
                <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUsuario?.nome}</h3>
                <p className="text-sm text-gray-500">{selectedUsuario?.email}</p>
                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-bold uppercase mt-1">{selectedUsuario?.perfil}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400 uppercase">CPF</label><p className="font-medium">{selectedUsuario?.cpf ? maskCPF(selectedUsuario.cpf) : '-'}</p></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="font-medium">{selectedUsuario?.telefone ? maskPhone(selectedUsuario.telefone) : '-'}</p></div>
            </div>
            {selectedUsuario?.perfil === 'Médico' && (
                <div><label className="text-xs font-bold text-gray-400 uppercase">CRMV</label><p className="font-medium">{selectedUsuario.crmv || '-'}</p></div>
            )}
            {selectedUsuario?.perfil === 'Responsável' && (
                <div><label className="text-xs font-bold text-gray-400 uppercase">Endereço</label><p className="font-medium">{selectedUsuario.endereco || '-'}</p></div>
            )}
            </div>
        )}
      </ViewModal>

      <CadastroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSave} title="Novo Usuário" saveText="Cadastrar">
        <FormInput 
          label="Nome Completo" 
          name="nome" 
          value={createFormData.nome} 
          onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} 
          required 
        />
        <FormInput 
          label="Email" 
          name="email" 
          type="email" 
          value={createFormData.email} 
          onChange={e => setCreateFormData({...createFormData, email: e.target.value})} 
          required 
        />
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
            <option value="SEMAS">SEMAS</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormInput label="CPF" name="cpf" value={createFormData.cpf} onChange={e => handleCPFChange(e, false)} required />
          <FormInput label="Telefone" name="telefone" value={createFormData.telefone} onChange={e => handlePhoneChange(e, false)} required />
        </div>

        {(createFormData.perfil === 'Médico' || createFormData.perfil === 'Estudante') && (
          <>
            <FormInput 
              label="CRMV" 
              name="crmv" 
              value={createFormData.crmv} 
              onChange={e => setCreateFormData({...createFormData, crmv: e.target.value})} 
              required={createFormData.perfil === 'Médico'}
            />
            <FormInput 
              label="Especialidade (Opcional)" 
              name="especialidade" 
              value={createFormData.especialidade} 
              onChange={e => setCreateFormData({...createFormData, especialidade: e.target.value})} 
            />
          </>
        )}
        {createFormData.perfil === 'Responsável' && (
          <>
            <FormInput 
              label="Endereço Completo" 
              name="endereco" 
              value={createFormData.endereco} 
              onChange={e => setCreateFormData({...createFormData, endereco: e.target.value})} 
              required 
            />
            <FormInput 
              label="NIS (Opcional)" 
              name="nis" 
              value={createFormData.nis} 
              onChange={e => setCreateFormData({...createFormData, nis: e.target.value})} 
            />
          </>
        )}

        <FormInput 
          label="Senha" 
          name="senha" 
          type="password" 
          value={createFormData.senha} 
          onChange={e => setCreateFormData({...createFormData, senha: e.target.value})} 
          required 
        />
      </CadastroModal>

      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Usuário" saveText="Salvar">
        <FormInput 
          label="Nome Completo (Opcional)" 
          name="nome" 
          value={editFormData?.nome || ''} 
          onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} 
        />
        <FormInput 
          label="Email" 
          name="email" 
          type="email" 
          value={editFormData?.email || ''} 
          onChange={e => setEditFormData(prev => prev ? {...prev, email: e.target.value} : null)} 
        />
        
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Perfil (Somente Visualização)</label>
          <input 
            type="text"
            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none cursor-not-allowed"
            value={editFormData?.perfil || ''} 
            disabled
          />
          <p className="text-xs text-gray-500 mt-1">O perfil não pode ser alterado após a criação.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="CPF" name="cpf" value={editFormData?.cpf || ''} onChange={e => handleCPFChange(e, true)} />
          <FormInput label="Telefone" name="telefone" value={editFormData?.telefone || ''} onChange={e => handlePhoneChange(e, true)} />
        </div>

        {(editFormData?.perfil === 'Médico' || editFormData?.perfil === 'Estudante') && (
          <>
            <FormInput 
              label="CRMV" 
              name="crmv" 
              value={editFormData.crmv || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, crmv: e.target.value} : null)} 
            />
            <FormInput 
              label="Especialidade" 
              name="especialidade" 
              value={editFormData.especialidade || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, especialidade: e.target.value} : null)} 
            />
          </>
        )}

        {editFormData?.perfil === 'Responsável' && (
          <>
            <FormInput 
              label="Endereço" 
              name="endereco" 
              value={editFormData.endereco || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, endereco: e.target.value} : null)} 
            />
            <FormInput 
              label="NIS" 
              name="nis" 
              value={editFormData.nis || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, nis: e.target.value} : null)} 
            />
          </>
        )}

        <div className="pt-4 border-t border-gray-100 mt-2">
          <p className="text-xs text-gray-500 mb-2">Deixe em branco para manter a senha atual.</p>
          <FormInput 
            label="Nova Senha" 
            name="senha" 
            type="password" 
            value={editFormData?.senha || ''} 
            onChange={e => setEditFormData(prev => prev ? {...prev, senha: e.target.value} : null)} 
          />
        </div>
      </CadastroModal>
    </div>
  );
}