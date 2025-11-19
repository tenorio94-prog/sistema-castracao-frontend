// app/adm/atendentes/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import AtendenteCard, { AtendenteUI } from '@/components/CRUD/AtendenteCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { maskCPF, maskPhone, unmask, validateCPF } from '@/lib/masks';

// --- MOCK SERVICE (Simulando Backend) ---
// Isso substitui o AttendantService/AuthService temporariamente
const MOCK_DB: AtendenteUI[] = [
  { id: 1, userId: 101, nome: 'Ana Clara Souza', email: 'ana.clara@vet.com', cpf: '123.456.789-00', telefone: '(81) 98888-7777', ativo: true },
  { id: 2, userId: 102, nome: 'João Pedro Silva', email: 'joao.pedro@vet.com', cpf: '987.654.321-11', telefone: '(81) 99999-0000', ativo: true },
  { id: 3, userId: 103, nome: 'Mariana Oliveira', email: 'mariana.o@vet.com', cpf: '456.789.123-22', telefone: '(81) 97777-6666', ativo: false },
];

const MockAttendantService = {
  getAll: async (): Promise<AtendenteUI[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_DB]), 600));
  },
  create: async (data: any): Promise<AtendenteUI> => {
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
// ----------------------------------------

type AtendenteForm = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
};

const emptyForm: AtendenteForm = { nome: '', email: '', cpf: '', telefone: '', senha: '' };

export default function PaginaAtendentes() {
  // --- ESTADOS ---
  const [atendentes, setAtendentes] = useState<AtendenteUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedAtendente, setSelectedAtendente] = useState<AtendenteUI | null>(null);
  const [createFormData, setCreateFormData] = useState<AtendenteForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<AtendenteForm | null>(null);

  // --- LOADERS ---
  const loadAtendentes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Chamada ao Mock
      const data = await MockAttendantService.getAll();
      setAtendentes(data);
    } catch (err: any) {
      setError('Erro ao carregar atendentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAtendentes(); }, []);

  // --- HANDLERS ---
  const handleView = (item: AtendenteUI) => { setSelectedAtendente(item); setIsViewModalOpen(true); };

  const handleEdit = (item: AtendenteUI) => {
    setEditFormData({
      nome: item.nome, email: item.email, cpf: maskCPF(item.cpf), telefone: maskPhone(item.telefone), senha: ''
    });
    setSelectedAtendente(item); setIsEditModalOpen(true);
  };

  const handleDelete = async (item: AtendenteUI) => {
    if (!window.confirm(`Deletar atendente ${item.nome}?`)) return;
    try {
      setLoading(true); 
      await MockAttendantService.delete(item.userId); 
      
      // Atualização Otimista (Remove da lista localmente pois o Mock não persiste)
      setAtendentes(prev => prev.filter(att => att.userId !== item.userId));
      
    } catch (err: any) { alert('Erro ao deletar'); } finally { setLoading(false); }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!validateCPF(createFormData.cpf)) { alert('CPF inválido'); setLoading(false); return; }
      
      // Prepara dados
      const newData = {
        nome: createFormData.nome,
        email: createFormData.email,
        cpf: createFormData.cpf, // Mock aceita mascarado para exibição
        telefone: createFormData.telefone,
        senha: createFormData.senha
      };
      
      // Envia para o Mock
      const createdUser = await MockAttendantService.create(newData);
      
      // Atualiza estado local
      setAtendentes(prev => [...prev, createdUser]);
      
      setIsCreateModalOpen(false); setCreateFormData(emptyForm);
      alert('Atendente cadastrado com sucesso!');
    } catch (err: any) { alert('Erro ao cadastrar'); } finally { setLoading(false); }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedAtendente) return;
    try {
      setLoading(true);
      
      await MockAttendantService.update(selectedAtendente.userId, editFormData);
      
      // Atualiza estado local manualmente (pois o mock não persiste)
      setAtendentes(prev => prev.map(att => 
        att.userId === selectedAtendente.userId 
          ? { ...att, nome: editFormData.nome, email: editFormData.email, cpf: editFormData.cpf, telefone: editFormData.telefone } 
          : att
      ));
      
      setIsEditModalOpen(false); setSelectedAtendente(null);
      alert('Atendente atualizado com sucesso!');
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

  // --- COLUNAS DA TABELA ---
  const columns: ColumnDefinition<AtendenteUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Email', cell: (item) => <span className="text-gray-600">{item.email}</span> },
    { header: 'CPF', cell: (item) => <span className="text-gray-600 font-mono">{maskCPF(item.cpf)}</span> },
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
        title="Gestão de Atendentes"
        description="Cadastre e gerencie a equipe de recepção do sistema."
        buttonText="Cadastrar Atendente"
        onButtonClick={() => { setCreateFormData(emptyForm); setIsCreateModalOpen(true); }}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <CrudDisplay
        data={atendentes}
        columns={columns}
        searchPlaceholder="Buscar por nome, email ou CPF..."
        emptyMessage="Nenhum atendente cadastrado."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        
        // Grid View (Usando o componente que criamos)
        renderGrid={(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(atendente => (
              <AtendenteCard 
                key={atendente.id} 
                atendente={atendente} 
                onView={handleView} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      />

      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhes do Atendente">
        <div className="space-y-4">
           <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
               <Users size={32} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedAtendente?.nome}</h3>
               <p className="text-sm text-gray-500">Recepção / Atendimento</p>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div><label className="text-xs font-bold text-gray-400 uppercase">CPF</label><p className="font-medium">{selectedAtendente?.cpf ? maskCPF(selectedAtendente.cpf) : '-'}</p></div>
             <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="font-medium">{selectedAtendente?.telefone ? maskPhone(selectedAtendente.telefone) : '-'}</p></div>
           </div>
           <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium">{selectedAtendente?.email}</p></div>
           <div className="pt-3 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
              <p className={`font-medium ${selectedAtendente?.ativo ? 'text-green-600' : 'text-red-600'}`}>
                {selectedAtendente?.ativo ? 'Ativo' : 'Inativo'}
              </p>
           </div>
        </div>
      </ViewModal>

      {/* --- MODAL CADASTRO --- */}
      <CadastroModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateSave} title="Cadastrar Atendente" saveText="Cadastrar">
         <FormInput label="Nome Completo" name="nome" value={createFormData.nome} onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} required />
         <FormInput label="Email" name="email" type="email" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} required />
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="CPF" name="cpf" value={createFormData.cpf} onChange={e => handleCPFChange(e, false)} placeholder="000.000.000-00" required />
            <FormInput label="Telefone" name="telefone" value={createFormData.telefone} onChange={e => handlePhoneChange(e, false)} placeholder="(00) 00000-0000" required />
         </div>
         <FormInput label="Senha de Acesso" name="senha" type="password" value={createFormData.senha} onChange={e => setCreateFormData({...createFormData, senha: e.target.value})} required />
      </CadastroModal>

      {/* --- MODAL EDIÇÃO --- */}
      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Atendente" saveText="Salvar">
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