"use client";

import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import EstudanteCard, { EstudanteUI } from '@/components/CRUD/EstudanteCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { maskCPF, maskPhone, unmask, validateCPF } from '@/lib/masks';
import { UserService, User } from '@/services/user.service';
import { CreateUserDto, Role } from '@/types/auth.types';

// --- TIPOS ---
type EstudanteForm = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
  matricula?: string; // Usaremos o campo CRMV do backend para armazenar a matrícula/código
};

const emptyForm: EstudanteForm = { 
  nome: '', 
  email: '', 
  cpf: '', 
  telefone: '', 
  senha: '', 
  matricula: '' 
};

export default function PaginaEstudantes() {
  // --- ESTADOS ---
  const [estudantes, setEstudantes] = useState<EstudanteUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedEstudante, setSelectedEstudante] = useState<EstudanteUI | null>(null);
  const [createFormData, setCreateFormData] = useState<EstudanteForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<EstudanteForm | null>(null);

  // --- LOADERS ---
  const loadEstudantes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Busca todos os usuários
      const allUsers = await UserService.getAll();
      
      // 2. Filtra apenas estudantes usando o método estático do serviço
      const studentUsers = UserService.filterByRole(allUsers, Role.student);
      
      // 3. Mapeia para a UI
      const data: EstudanteUI[] = studentUsers.map((user: User) => ({
        id: user.id, // UI espera number aqui (conforme interface EstudanteCard)
        userId: user.id,
        nome: user.completeName,
        email: user.email,
        cpf: user.cpf,
        telefone: user.phone,
        // Se tiver registro na tabela Veterinarian, pegamos o status active, senão default true
        ativo: user.veterinarian ? user.veterinarian.active : true,
        // Usamos o campo CRMV para exibir matrícula/código se existir
        matricula: user.veterinarian?.crmv || undefined
      }));

      setEstudantes(data);
    } catch (err: any) {
      const msg = err.message || 'Erro ao carregar estudantes';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEstudantes(); }, []);

  // --- HANDLERS ---
  const handleView = (item: EstudanteUI) => { 
    setSelectedEstudante(item); 
    setIsViewModalOpen(true); 
  };

  const handleEdit = (item: EstudanteUI) => {
    setEditFormData({
      nome: item.nome, 
      email: item.email, 
      cpf: maskCPF(item.cpf), 
      telefone: maskPhone(item.telefone), 
      senha: '',
      matricula: item.matricula || ''
    });
    setSelectedEstudante(item); 
    setIsEditModalOpen(true);
  };

  const handleDelete = async (item: EstudanteUI) => {
    if (!window.confirm(`Deletar estudante ${item.nome}?`)) return;
    try {
      setLoading(true); 
      await UserService.delete(item.userId); 
      await loadEstudantes();
      toast.success('Estudante deletado com sucesso!');
    } catch (err: any) { 
      toast.error(err.message || 'Erro ao deletar'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!createFormData.nome?.trim()) { toast.error('Nome é obrigatório'); setLoading(false); return; }
      if (!validateCPF(createFormData.cpf)) { toast.error('CPF inválido'); setLoading(false); return; }
      if (!createFormData.senha || createFormData.senha.length < 6) { 
        toast.error('Senha deve ter no mínimo 6 caracteres'); 
        setLoading(false); 
        return; 
      }
      
      const newUserDto: CreateUserDto = {
        completeName: createFormData.nome,
        email: createFormData.email,
        password: createFormData.senha,
        cpf: unmask(createFormData.cpf),
        phone: unmask(createFormData.telefone),
        role: Role.student,
        // Opcional: passar matrícula como CRMV para registro interno
        crmv: createFormData.matricula || undefined,
        // Define especialidade como Estudante automaticamente no backend
      };

      await UserService.create(newUserDto);
      
      await loadEstudantes();
      setIsCreateModalOpen(false); 
      setCreateFormData(emptyForm);
      toast.success('Estudante cadastrado com sucesso!');
    } catch (err: any) { 
      toast.error(err.message || 'Erro ao cadastrar'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedEstudante) return;
    
    try {
      setLoading(true);
      
      if (editFormData.cpf && !validateCPF(editFormData.cpf)) {
        toast.error('CPF inválido');
        setLoading(false);
        return;
      }

      const updateData: any = {}; // Usando any para flexibilidade com campos extras do backend
      
      if (editFormData.nome !== selectedEstudante.nome) updateData.completeName = editFormData.nome;
      if (editFormData.email !== selectedEstudante.email) updateData.email = editFormData.email;
      if (unmask(editFormData.cpf) !== selectedEstudante.cpf) updateData.cpf = unmask(editFormData.cpf);
      if (unmask(editFormData.telefone) !== selectedEstudante.telefone) updateData.phone = unmask(editFormData.telefone);
      if (editFormData.senha) updateData.password = editFormData.senha;
      
      // Atualiza matrícula (mapeada para crmv no backend para estudantes)
      if (editFormData.matricula !== selectedEstudante.matricula) {
        updateData.crmv = editFormData.matricula;
      }

      await UserService.update(selectedEstudante.userId, updateData);
      
      await loadEstudantes();
      setIsEditModalOpen(false); 
      setSelectedEstudante(null);
      toast.success('Estudante atualizado com sucesso!');
    } catch (err: any) { 
      toast.error(err.message || 'Erro ao atualizar'); 
    } finally { 
      setLoading(false); 
    }
  };

  // Inputs Controlados
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
  const columns: ColumnDefinition<EstudanteUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Email', cell: (item) => <span className="text-gray-600">{item.email}</span> },
    { header: 'Telefone', cell: (item) => <span>{item.telefone ? maskPhone(item.telefone) : '-'}</span> },
    { header: 'Status', cell: (item) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.ativo ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {item.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ) 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      
      <CrudHeader
        title="Gestão de Estudantes"
        description="Cadastre e gerencie os estagiários do sistema."
        buttonText="Cadastrar Estudante"
        onButtonClick={() => { setCreateFormData(emptyForm); setIsCreateModalOpen(true); }}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <CrudDisplay
        data={estudantes}
        columns={columns}
        searchPlaceholder="Buscar por nome ou email..."
        emptyMessage="Nenhum estudante cadastrado."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        
        renderGrid={(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(estudante => (
              <EstudanteCard 
                key={estudante.id} 
                estudante={estudante} 
                onView={handleView} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      />

      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhes do Estudante">
        <div className="space-y-4">
           <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
               <GraduationCap size={32} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedEstudante?.nome}</h3>
               <p className="text-sm text-gray-500">Estudante / Estagiário</p>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div><label className="text-xs font-bold text-gray-400 uppercase">CPF</label><p className="font-medium">{selectedEstudante?.cpf ? maskCPF(selectedEstudante.cpf) : '-'}</p></div>
             <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="font-medium">{selectedEstudante?.telefone ? maskPhone(selectedEstudante.telefone) : '-'}</p></div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium">{selectedEstudante?.email}</p></div>
              {selectedEstudante?.matricula && (
                <div><label className="text-xs font-bold text-gray-400 uppercase">Matrícula (Interna)</label><p className="font-medium">{selectedEstudante.matricula}</p></div>
              )}
           </div>
           
           <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
              <p className={`font-medium ${selectedEstudante?.ativo ? 'text-green-600' : 'text-red-600'}`}>
                {selectedEstudante?.ativo ? 'Ativo' : 'Inativo'}
              </p>
           </div>
        </div>
      </ViewModal>

      {/* --- MODAL CADASTRO --- */}
      <CadastroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSave} title="Cadastrar Estudante" saveText="Cadastrar">
         <FormInput label="Nome Completo" name="nome" value={createFormData.nome} onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} required />
         <FormInput label="Email" name="email" type="email" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} required />
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="CPF" name="cpf" value={createFormData.cpf} onChange={e => handleCPFChange(e, false)} placeholder="000.000.000-00" required />
            <FormInput label="Telefone" name="telefone" value={createFormData.telefone} onChange={e => handlePhoneChange(e, false)} placeholder="(00) 00000-0000" required />
         </div>
         
         <FormInput 
           label="Matrícula / Código (Opcional)" 
           name="matricula" 
           value={createFormData.matricula || ''} 
           onChange={e => setCreateFormData({...createFormData, matricula: e.target.value})} 
           placeholder="Ex: 2023001"
         />

         <FormInput label="Senha de Acesso" name="senha" type="password" value={createFormData.senha} onChange={e => setCreateFormData({...createFormData, senha: e.target.value})} required />
      </CadastroModal>

      {/* --- MODAL EDIÇÃO --- */}
      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Estudante" saveText="Salvar">
         <FormInput label="Nome Completo" name="nome" value={editFormData?.nome || ''} onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} />
         <FormInput label="Email" name="email" type="email" value={editFormData?.email || ''} onChange={e => setEditFormData(prev => prev ? {...prev, email: e.target.value} : null)} />
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="CPF" name="cpf" value={editFormData?.cpf || ''} onChange={e => handleCPFChange(e, true)} />
            <FormInput label="Telefone" name="telefone" value={editFormData?.telefone || ''} onChange={e => handlePhoneChange(e, true)} />
         </div>

         <FormInput 
           label="Matrícula / Código" 
           name="matricula" 
           value={editFormData?.matricula || ''} 
           onChange={e => setEditFormData(prev => prev ? {...prev, matricula: e.target.value} : null)} 
         />

         <div className="pt-4 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-500 mb-2">Deixe em branco para manter a senha atual.</p>
            <FormInput label="Nova Senha" name="senha" type="password" value={editFormData?.senha || ''} onChange={e => setEditFormData(prev => prev ? {...prev, senha: e.target.value} : null)} />
         </div>
      </CadastroModal>

    </div>
  );
}