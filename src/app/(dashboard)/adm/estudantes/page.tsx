"use client";

import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import EstudanteCard, { EstudanteUI } from '@/components/CRUD/EstudanteCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { maskCPF, maskPhone, validateCPF } from '@/lib/masks';

// --- MOCK SERVICE (Simulação - Sem Instituição) ---
const MOCK_DB: EstudanteUI[] = [
  { id: 1, userId: 201, nome: 'Lucas Pereira', email: 'lucas.p@uni.edu.br', cpf: '111.222.333-44', telefone: '(81) 91111-2222', ativo: true },
  { id: 2, userId: 202, nome: 'Fernanda Lima', email: 'fernanda.l@uni.edu.br', cpf: '222.333.444-55', telefone: '(81) 93333-4444', ativo: true },
  { id: 3, userId: 203, nome: 'Ricardo Gomes', email: 'ricardo.g@uni.edu.br', cpf: '333.444.555-66', telefone: '(81) 95555-6666', ativo: false },
];

const MockStudentService = {
  getAll: async (): Promise<EstudanteUI[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DB]), 600));
  },
  create: async (data: any): Promise<EstudanteUI> => {
    return new Promise((resolve) => setTimeout(() => resolve({
      id: Math.random(),
      userId: Math.random(),
      nome: data.nome,
      email: data.email,
      cpf: data.cpf,
      telefone: data.telefone,
      ativo: true
    }), 600));
  },
  update: async (id: number, data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 600));
  },
  delete: async (id: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 600));
  }
};

type EstudanteForm = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
};

const emptyForm: EstudanteForm = { nome: '', email: '', cpf: '', telefone: '', senha: '' };

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
      const data = await MockStudentService.getAll();
      setEstudantes(data);
    } catch (err: any) {
      setError('Erro ao carregar estudantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEstudantes(); }, []);

  // --- HANDLERS ---
  const handleView = (item: EstudanteUI) => { setSelectedEstudante(item); setIsViewModalOpen(true); };

  const handleEdit = (item: EstudanteUI) => {
    setEditFormData({
      nome: item.nome, email: item.email, cpf: maskCPF(item.cpf), telefone: maskPhone(item.telefone), senha: ''
    });
    setSelectedEstudante(item); setIsEditModalOpen(true);
  };

  const handleDelete = async (item: EstudanteUI) => {
    if (!window.confirm(`Deletar estudante ${item.nome}?`)) return;
    try {
      setLoading(true); 
      await MockStudentService.delete(item.userId); 
      setEstudantes(prev => prev.filter(est => est.userId !== item.userId));
    } catch (err: any) { alert('Erro ao deletar'); } finally { setLoading(false); }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!validateCPF(createFormData.cpf)) { alert('CPF inválido'); setLoading(false); return; }
      
      const newData = { ...createFormData };
      const createdUser = await MockStudentService.create(newData);
      setEstudantes(prev => [...prev, createdUser]);
      
      setIsCreateModalOpen(false); setCreateFormData(emptyForm);
      alert('Estudante cadastrado com sucesso!');
    } catch (err: any) { alert('Erro ao cadastrar'); } finally { setLoading(false); }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedEstudante) return;
    try {
      setLoading(true);
      await MockStudentService.update(selectedEstudante.userId, editFormData);
      
      setEstudantes(prev => prev.map(est => 
        est.userId === selectedEstudante.userId 
          ? { ...est, ...editFormData } 
          : est
      ));
      
      setIsEditModalOpen(false); setSelectedEstudante(null);
      alert('Estudante atualizado com sucesso!');
    } catch (err: any) { alert('Erro ao atualizar'); } finally { setLoading(false); }
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
        
        // Grid View
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
           <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium">{selectedEstudante?.email}</p></div>
           
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
         <div className="pt-4 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-500 mb-2">Deixe em branco para manter a senha atual.</p>
            <FormInput label="Nova Senha" name="senha" type="password" value={editFormData?.senha || ''} onChange={e => setEditFormData(prev => prev ? {...prev, senha: e.target.value} : null)} />
         </div>
      </CadastroModal>

    </div>
  );
}