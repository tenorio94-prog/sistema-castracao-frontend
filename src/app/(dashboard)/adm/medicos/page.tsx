"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Stethoscope, Syringe, Activity } from 'lucide-react'; // Ícones para filtros

import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import MedicoCard, { MedicoUI } from '@/components/CRUD/MedicoCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { VeterinarianService, Veterinarian, UpdateVeterinarianData } from '@/services/veterinarian.service';
import { AuthService } from '@/services/auth.service';
import { CreateUserDto, Role } from '@/types/auth.types';
import { maskCPF, maskPhone, unmask, validateCPF, validatePhone } from '@/lib/masks';

type MedicoForm = {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  crmv: string;
  especialidade: string;
  senha: string;
};

const emptyForm: MedicoForm = {
  nome: '', email: '', cpf: '', telefone: '', crmv: '', especialidade: '', senha: '',
};

export default function PaginaMedicos() {
  // --- ESTADOS ---
  const [medicos, setMedicos] = useState<MedicoUI[]>([]);
  
  // Filtros
  const [filterSurgery, setFilterSurgery] = useState(false);
  const [filterGeneral, setFilterGeneral] = useState(false);

  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedMedico, setSelectedMedico] = useState<MedicoUI | null>(null);
  const [createFormData, setCreateFormData] = useState<MedicoForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<MedicoForm | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LOADERS ---
  const loadMedicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await VeterinarianService.getAll();
      
      const medicosFormatados: MedicoUI[] = data.map((vet: Veterinarian) => ({
        id: vet.id,
        userId: vet.userId,
        nome: vet.user?.completeName || 'Nome não informado',
        email: vet.user?.email || 'Email não informado',
        cpf: vet.user?.cpf || '',
        telefone: vet.user?.phone || '',
        crmv: vet.crmv || '',
        especialidade: vet.specialty || 'Clínica Geral',
        ativo: vet.active ?? true, // Default true se undefined
      }));

      setMedicos(medicosFormatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar médicos');
      console.error('Erro ao carregar médicos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMedicos(); }, []);

  // --- FILTRAGEM ---
  const filteredMedicos = useMemo(() => {
    return medicos.filter(medico => {
      const especialidade = medico.especialidade.toLowerCase();
      
      // Lógica: Se nenhum filtro ativo, mostra todos. Se algum ativo, filtra por ele.
      let match = true;
      
      if (filterSurgery || filterGeneral) {
        const isCirurgia = especialidade.includes('cirurgia');
        const isClinica = especialidade.includes('clínica') || especialidade.includes('clinica') || especialidade.includes('geral');
        
        match = false; // Reseta para false e verifica qual botão está ativo
        if (filterSurgery && isCirurgia) match = true;
        if (filterGeneral && isClinica) match = true;
      }

      return match;
    });
  }, [medicos, filterSurgery, filterGeneral]);

  // --- HANDLERS ---
  const handleView = (medico: MedicoUI) => { setSelectedMedico(medico); setIsViewModalOpen(true); };
  
  const handleEdit = (medico: MedicoUI) => {
    setEditFormData({
      nome: medico.nome, email: medico.email, cpf: maskCPF(medico.cpf), telefone: maskPhone(medico.telefone),
      crmv: medico.crmv, especialidade: medico.especialidade, senha: '',
    });
    setSelectedMedico(medico); setIsEditModalOpen(true);
  };

  const handleDelete = async (medico: MedicoUI) => {
    if (!window.confirm(`Deletar ${medico.nome}?`)) return;
    try {
      setLoading(true); await VeterinarianService.delete(medico.userId); await loadMedicos();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => { setCreateFormData(emptyForm); setIsCreateModalOpen(true); };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validações
      if (!validateCPF(createFormData.cpf)) { 
        alert('CPF inválido'); 
        setLoading(false); 
        return; 
      }
      
      if (!createFormData.senha || createFormData.senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }
      
      if (!createFormData.crmv || createFormData.crmv.trim() === '') {
        alert('CRMV é obrigatório para médicos veterinários');
        setLoading(false);
        return;
      }
      
      // auth/register cria o usuário E o veterinarian automaticamente
      const createUserDto: CreateUserDto = {
        completeName: createFormData.nome, 
        email: createFormData.email, 
        password: createFormData.senha,
        cpf: unmask(createFormData.cpf), 
        phone: unmask(createFormData.telefone), 
        role: Role.veterinarian,
        crmv: createFormData.crmv, 
        specialty: createFormData.especialidade || undefined,
      };
      
      await AuthService.register(createUserDto);
      await loadMedicos(); 
      setIsCreateModalOpen(false); 
      setCreateFormData(emptyForm);
      alert('Médico cadastrado com sucesso!');
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedMedico) return;
    
    try {
      setLoading(true);
      
      // Validações
      if (editFormData.cpf && !validateCPF(editFormData.cpf)) {
        alert('CPF inválido');
        setLoading(false);
        return;
      }
      
      if (editFormData.senha && editFormData.senha.length > 0 && editFormData.senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }
      
      // Monta o objeto apenas com campos que foram modificados
      const updateData: UpdateVeterinarianData = {};
      
      // Campos do User
      if (editFormData.nome && editFormData.nome !== selectedMedico.nome) {
        updateData.completeName = editFormData.nome;
      }
      if (editFormData.email && editFormData.email !== selectedMedico.email) {
        updateData.email = editFormData.email;
      }
      if (editFormData.cpf && unmask(editFormData.cpf) !== selectedMedico.cpf) {
        updateData.cpf = unmask(editFormData.cpf);
      }
      if (editFormData.telefone && unmask(editFormData.telefone) !== selectedMedico.telefone) {
        updateData.phone = unmask(editFormData.telefone);
      }
      if (editFormData.senha && editFormData.senha.trim() !== '') {
        updateData.password = editFormData.senha;
      }
      
      // Campos do Veterinarian
      if (editFormData.crmv && editFormData.crmv !== selectedMedico.crmv) {
        updateData.crmv = editFormData.crmv;
      }
      if (editFormData.especialidade !== selectedMedico.especialidade) {
        updateData.specialty = editFormData.especialidade || undefined;
      }
      
      await VeterinarianService.update(selectedMedico.userId, updateData);
      await loadMedicos(); 
      setIsEditModalOpen(false); 
      setSelectedMedico(null);
      alert('Médico atualizado com sucesso!');
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // Handlers de Input Controlado
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

  // --- DEFINIÇÃO DAS COLUNAS ---
  const columns: ColumnDefinition<MedicoUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'CRMV', cell: (item) => <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-700">{item.crmv}</span> },
    { header: 'Especialidade', cell: (item) => <span className="text-blue-600 font-medium">{item.especialidade}</span> },
    { header: 'Telefone', cell: (item) => <span className="text-gray-600">{item.telefone ? maskPhone(item.telefone) : '-'}</span> },
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
        title="Gestão de Médicos"
        description="Administre o corpo clínico, especialidades e permissões."
        buttonText="Cadastrar Médico"
        onButtonClick={handleOpenCreate} 
      />

      {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
      
      {/* CORREÇÃO AQUI: Trocado 'data={medicos}' por 'data={filteredMedicos}' */}
      <CrudDisplay<MedicoUI>
        data={filteredMedicos}
        columns={columns}
        searchPlaceholder="Buscar por nome, CRMV ou especialidade..."
        emptyMessage="Nenhum médico encontrado com os filtros atuais."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        
        // FILTROS EXTRAS
        extraFilters={
          <>
             <button onClick={() => setFilterSurgery(!filterSurgery)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterSurgery ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Activity size={16} /> Cirurgia
              </button>
              <button onClick={() => setFilterGeneral(!filterGeneral)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterGeneral ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Stethoscope size={16} /> Clínica Geral
              </button>
          </>
        }

        // GRID VIEW
        renderGrid={(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(medico => (
              <MedicoCard 
                key={medico.id} 
                medico={medico} 
                onView={handleView} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      />
      
      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Perfil: ${selectedMedico?.nome}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
               <Stethoscope size={32} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedMedico?.nome}</h3>
               <p className="text-sm text-gray-500">{selectedMedico?.especialidade}</p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="text-xs font-bold text-gray-400 uppercase">CRMV</label><p className="font-medium">{selectedMedico?.crmv}</p></div>
             <div><label className="text-xs font-bold text-gray-400 uppercase">Status</label><p className={`font-medium ${selectedMedico?.ativo ? 'text-green-600' : 'text-red-600'}`}>{selectedMedico?.ativo ? 'Ativo' : 'Inativo'}</p></div>
             <div><label className="text-xs font-bold text-gray-400 uppercase">CPF</label><p className="font-medium">{selectedMedico?.cpf ? maskCPF(selectedMedico.cpf) : '-'}</p></div>
             <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="font-medium">{selectedMedico?.telefone ? maskPhone(selectedMedico.telefone) : '-'}</p></div>
          </div>
          <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium text-gray-900">{selectedMedico?.email}</p></div>
        </div>
      </ViewModal>

      {/* --- MODAL CREATE --- */}
      <CadastroModal isOpen={isCreateModalOpen} onClose={() => {setIsCreateModalOpen(false); setCreateFormData(emptyForm);}} onSubmit={handleCreateSave} title="Novo Médico" saveText="Cadastrar">
        <FormInput label="Nome Completo" name="nome" value={createFormData.nome} onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} required />
        <FormInput label="Email" name="email" type="email" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} required />
        <div className="grid grid-cols-2 gap-4">
           <FormInput label="CPF" name="cpf" value={createFormData.cpf} onChange={e => handleCPFChange(e, false)} placeholder="000.000.000-00" required />
           <FormInput label="Telefone" name="telefone" value={createFormData.telefone} onChange={e => handlePhoneChange(e, false)} placeholder="(00) 00000-0000" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <FormInput label="CRMV" name="crmv" value={createFormData.crmv} onChange={e => setCreateFormData({...createFormData, crmv: e.target.value})} required />
           <FormInput label="Especialidade" name="especialidade" value={createFormData.especialidade} onChange={e => setCreateFormData({...createFormData, especialidade: e.target.value})} placeholder="Ex: Cirurgia" />
        </div>
        <FormInput label="Senha de Acesso" name="senha" type="password" value={createFormData.senha} onChange={e => setCreateFormData({...createFormData, senha: e.target.value})} required />
      </CadastroModal>

      {/* --- MODAL EDIT --- */}
      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Médico" saveText="Salvar">
        <FormInput label="Nome Completo" name="nome" value={editFormData?.nome || ''} onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} />
        <FormInput label="Email" name="email" type="email" value={editFormData?.email || ''} onChange={e => setEditFormData(prev => prev ? {...prev, email: e.target.value} : null)} />
        <div className="grid grid-cols-2 gap-4">
           <FormInput label="CPF" name="cpf" value={editFormData?.cpf || ''} onChange={e => handleCPFChange(e, true)} />
           <FormInput label="Telefone" name="telefone" value={editFormData?.telefone || ''} onChange={e => handlePhoneChange(e, true)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <FormInput label="CRMV" name="crmv" value={editFormData?.crmv || ''} onChange={e => setEditFormData(prev => prev ? {...prev, crmv: e.target.value} : null)} />
           <FormInput label="Especialidade" name="especialidade" value={editFormData?.especialidade || ''} onChange={e => setEditFormData(prev => prev ? {...prev, especialidade: e.target.value} : null)} />
        </div>
        <div className="pt-4 border-t border-gray-100 mt-2">
          <p className="text-xs text-gray-500 mb-2">Deixe em branco para manter a senha atual.</p>
          <FormInput label="Nova Senha" name="senha" type="password" value={editFormData?.senha || ''} onChange={e => setEditFormData(prev => prev ? {...prev, senha: e.target.value} : null)} />
        </div>
      </CadastroModal>

    </div>
  );
}