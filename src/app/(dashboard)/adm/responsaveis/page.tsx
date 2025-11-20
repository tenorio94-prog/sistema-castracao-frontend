"use client";

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import ResponsavelCardAdm, { ResponsavelAdmUI } from '@/components/CRUD/ResponsavelAdmCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { PetOwnerService, PetOwner, UpdatePetOwnerData } from '@/services/petowner.service';
import { AuthService } from '@/services/auth.service';
import { CreateUserDto, Role } from '@/types/auth.types';
import { maskCPF, maskPhone, unmask, validateCPF } from '@/lib/masks';

type ResponsavelForm = {
  nome: string;
  cpf: string;
  nis: string;
  telefone: string;
  email: string;
  endereco: string;
  documentUrl: string;
  senha: string;
};

const emptyForm: ResponsavelForm = {
  nome: '', cpf: '', nis: '', telefone: '', email: '', endereco: '', documentUrl: '', senha: '',
};

export default function PaginaGestaoResponsaveis() {
  // --- ESTADOS ---
  const [responsaveis, setResponsaveis] = useState<ResponsavelAdmUI[]>([]);

  // Modais e Forms
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedResponsavel, setSelectedResponsavel] = useState<ResponsavelAdmUI | null>(null);
  const [editFormData, setEditFormData] = useState<ResponsavelForm | null>(null);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LOADERS ---
  const loadResponsaveis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PetOwnerService.getAll();
      
      const formatados: ResponsavelAdmUI[] = data.map((petOwner: PetOwner) => ({
        id: petOwner.id.toString(),
        nome: petOwner.user?.completeName || 'Nome não informado',
        tipo: 'Pessoa Física' as const,
        cpf: petOwner.user?.cpf || '',
        nis: petOwner.nis || '',
        cnpj: '',
        telefone: petOwner.user?.phone || '',
        email: petOwner.user?.email || '',
        endereco: petOwner.fullAddress || '',
        quantidadeAnimais: petOwner._count?.animals || 0,
      }));
      
      setResponsaveis(formatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar responsáveis');
      console.error('Erro ao carregar responsáveis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResponsaveis(); }, []);

  // --- HANDLERS ---
  const handleView = (responsavel: ResponsavelAdmUI) => { 
    setSelectedResponsavel(responsavel); 
    setIsViewModalOpen(true); 
  };
  
  const handleEdit = (responsavel: ResponsavelAdmUI) => {
    setEditFormData({
      nome: responsavel.nome, 
      cpf: maskCPF(responsavel.cpf || ''), 
      nis: responsavel.nis || '',
      telefone: maskPhone(responsavel.telefone || ''), 
      email: responsavel.email || '',
      endereco: responsavel.endereco || '', 
      documentUrl: '',
      senha: '',
    });
    setSelectedResponsavel(responsavel); 
    setIsEditModalOpen(true);
  };

  const handleDelete = async (responsavel: ResponsavelAdmUI) => {
    if (!window.confirm(`Deletar ${responsavel.nome}?`)) return;
    try {
      setLoading(true); 
      // Buscar o petOwner para pegar o userId
      const allData = await PetOwnerService.getAll();
      const petOwner = allData.find(p => p.id.toString() === responsavel.id);
      if (petOwner) {
        await PetOwnerService.delete(petOwner.userId);
        await loadResponsaveis();
        alert('Responsável deletado com sucesso!');
      } else {
        alert('Erro: Responsável não encontrado');
      }
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validações detalhadas
      if (!createFormData.nome || createFormData.nome.trim() === '') {
        alert('Nome completo é obrigatório');
        setLoading(false);
        return;
      }
      
      if (!createFormData.email || createFormData.email.trim() === '') {
        alert('Email é obrigatório');
        setLoading(false);
        return;
      }
      
      if (!createFormData.cpf || !validateCPF(createFormData.cpf)) { 
        alert('CPF inválido ou não preenchido'); 
        setLoading(false); 
        return; 
      }
      
      if (!createFormData.telefone || createFormData.telefone.trim() === '') {
        alert('Telefone é obrigatório');
        setLoading(false);
        return;
      }
      
      if (!createFormData.endereco || createFormData.endereco.trim() === '') {
        alert('Endereço completo é obrigatório para responsáveis');
        setLoading(false);
        return;
      }
      
      if (!createFormData.senha || createFormData.senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        setLoading(false);
        return;
      }
      
      // Criar usuário PetOwner via /auth/register
      // O backend do AuthService DEVE criar automaticamente o PetOwner quando role=petOwner
      // e fullAddress estiver presente
      const createUserDto: CreateUserDto = {
        completeName: createFormData.nome.trim(),
        email: createFormData.email.trim(),
        password: createFormData.senha,
        cpf: unmask(createFormData.cpf),
        phone: unmask(createFormData.telefone),
        role: Role.petOwner,
        // Campos específicos para PetOwner
        fullAddress: createFormData.endereco.trim(),
        nis: createFormData.nis && createFormData.nis.trim() !== '' ? createFormData.nis.trim() : undefined,
        documentUrl: createFormData.documentUrl && createFormData.documentUrl.trim() !== '' ? createFormData.documentUrl.trim() : undefined,
      };
      
      console.log('📤 Criando responsável via /auth/register:', JSON.stringify(createUserDto, null, 2));
      
      const result = await AuthService.register(createUserDto);
      console.log('✅ Responsável criado com sucesso:', result);
      
      await loadResponsaveis();
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      alert('Responsável cadastrado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao cadastrar responsável:', err);
      console.error('❌ Response completo:', err.response);
      console.error('❌ Response data:', err.response?.data);
      console.error('❌ Response status:', err.response?.status);
      
      // Mensagem de erro mais específica
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao cadastrar responsável';
      alert(errorMessage); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedResponsavel) return;
    
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
      
      if (editFormData.endereco && editFormData.endereco.trim() === '') {
        alert('Endereço não pode ser vazio');
        setLoading(false);
        return;
      }
      
      // Buscar o petOwner para pegar o userId
      const allData = await PetOwnerService.getAll();
      const petOwner = allData.find(p => p.id.toString() === selectedResponsavel.id);
      
      if (!petOwner) {
        alert('Erro: Responsável não encontrado');
        setLoading(false);
        return;
      }
      
      // Monta o objeto apenas com campos modificados
      const updateData: UpdatePetOwnerData = {};
      
      // Campos do User
      if (editFormData.nome && editFormData.nome.trim() !== '' && editFormData.nome !== selectedResponsavel.nome) {
        updateData.completeName = editFormData.nome.trim();
      }
      if (editFormData.email && editFormData.email.trim() !== '' && editFormData.email !== selectedResponsavel.email) {
        updateData.email = editFormData.email.trim();
      }
      if (editFormData.cpf && unmask(editFormData.cpf) !== selectedResponsavel.cpf) {
        updateData.cpf = unmask(editFormData.cpf);
      }
      if (editFormData.telefone && unmask(editFormData.telefone) !== selectedResponsavel.telefone) {
        updateData.phone = unmask(editFormData.telefone);
      }
      if (editFormData.senha && editFormData.senha.trim() !== '') {
        updateData.password = editFormData.senha;
      }
      
      // Campos do PetOwner
      if (editFormData.endereco && editFormData.endereco !== selectedResponsavel.endereco) {
        updateData.fullAddress = editFormData.endereco;
      }
      if (editFormData.documentUrl && editFormData.documentUrl.trim() !== '') {
        updateData.documentUrl = editFormData.documentUrl;
      }
      
      await PetOwnerService.update(petOwner.userId, updateData);
      await loadResponsaveis();
      setIsEditModalOpen(false);
      setSelectedResponsavel(null);
      alert('Responsável atualizado com sucesso!');
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

  // --- COLUNAS ---
  const columns: ColumnDefinition<ResponsavelAdmUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'CPF', cell: (item) => <span className="text-gray-600 font-mono text-xs">{item.cpf ? maskCPF(item.cpf) : '-'}</span> },
    { header: 'Telefone', cell: (item) => <span className="text-gray-600">{item.telefone ? maskPhone(item.telefone) : '-'}</span> },
    { header: 'Email', cell: (item) => <span className="text-gray-600">{item.email || '-'}</span> },
    { header: 'Animais', cell: (item) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
          {item.quantidadeAnimais || 0}
        </span>
      ) 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <CrudHeader 
        title="Gestão de Responsáveis"
        description="Cadastre e gerencie os tutores responsáveis pelos animais."
        buttonText="Cadastrar Responsável"
        onButtonClick={() => setIsCreateModalOpen(true)}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <CrudDisplay
        data={responsaveis}
        columns={columns}
        searchPlaceholder="Buscar por nome, CPF ou email..."
        emptyMessage="Nenhum responsável encontrado."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}

        // GRID VIEW
        renderGrid={(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(resp => (
              <ResponsavelCardAdm
                key={resp.id} 
                responsavel={resp} 
                onView={handleView} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      />

      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalhes do Responsável">
        <div className="space-y-4">
           <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-16 w-16 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
               <User size={32}/>
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedResponsavel?.nome}</h3>
               <span className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase bg-blue-100 text-blue-700">Tutor</span>
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">CPF</label><p className="font-medium">{selectedResponsavel?.cpf ? maskCPF(selectedResponsavel.cpf) : '-'}</p></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">NIS</label><p className="font-medium">{selectedResponsavel?.nis || '-'}</p></div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="font-medium">{selectedResponsavel?.telefone ? maskPhone(selectedResponsavel.telefone) : '-'}</p></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium">{selectedResponsavel?.email || '-'}</p></div>
           </div>
           <div><label className="text-xs font-bold text-gray-400 uppercase">Endereço</label><p className="font-medium text-gray-900">{selectedResponsavel?.endereco || '-'}</p></div>
           <div><label className="text-xs font-bold text-gray-400 uppercase">Quantidade de Animais</label><p className="font-medium text-blue-600 text-lg">{selectedResponsavel?.quantidadeAnimais || 0}</p></div>
        </div>
      </ViewModal>

      {/* --- MODAL CADASTRO --- */}
      <CadastroModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {setIsCreateModalOpen(false); setCreateFormData(emptyForm);}} 
        onSubmit={handleCreateSave} 
        title="Novo Responsável" 
        saveText="Cadastrar"
      >
         <FormInput 
           label="Nome Completo" 
           name="nome" 
           value={createFormData.nome} 
           onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} 
           required 
         />
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="CPF *" 
              name="cpf" 
              value={createFormData.cpf} 
              onChange={e => handleCPFChange(e, false)} 
              placeholder="000.000.000-00"
              required 
            />
            <FormInput 
              label="NIS" 
              name="nis" 
              value={createFormData.nis} 
              onChange={e => setCreateFormData({...createFormData, nis: e.target.value})} 
            />
         </div>

         <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Telefone *" 
              name="telefone" 
              value={createFormData.telefone} 
              onChange={e => handlePhoneChange(e, false)} 
              placeholder="(00) 00000-0000"
              required
            />
            <FormInput 
              label="Email *" 
              name="email" 
              type="email" 
              value={createFormData.email} 
              onChange={e => setCreateFormData({...createFormData, email: e.target.value})} 
              required
            />
         </div>
         
         <FormInput 
           label="Endereço Completo *" 
           name="endereco" 
           value={createFormData.endereco} 
           onChange={e => setCreateFormData({...createFormData, endereco: e.target.value})} 
           placeholder="Rua, número, bairro, cidade..."
           required
         />
         
         <FormInput 
           label="URL do Documento (Opcional)" 
           name="documentUrl" 
           value={createFormData.documentUrl} 
           onChange={e => setCreateFormData({...createFormData, documentUrl: e.target.value})} 
           placeholder="https://..."
         />
         
         <FormInput 
           label="Senha de Acesso *" 
           name="senha" 
           type="password" 
           value={createFormData.senha} 
           onChange={e => setCreateFormData({...createFormData, senha: e.target.value})} 
           required 
         />
      </CadastroModal>

      {/* --- MODAL EDIÇÃO --- */}
      <CadastroModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSubmit={handleEditSave} 
        title="Editar Responsável" 
        saveText="Salvar"
      >
         <FormInput 
           label="Nome Completo" 
           name="nome" 
           value={editFormData?.nome || ''} 
           onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} 
         />
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="CPF" 
              name="cpf" 
              value={editFormData?.cpf || ''} 
              onChange={e => handleCPFChange(e, true)} 
            />
            <FormInput 
              label="NIS" 
              name="nis" 
              value={editFormData?.nis || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, nis: e.target.value} : null)} 
              disabled
            />
         </div>
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Telefone" 
              name="telefone" 
              value={editFormData?.telefone || ''} 
              onChange={e => handlePhoneChange(e, true)} 
            />
            <FormInput 
              label="Email" 
              name="email" 
              type="email" 
              value={editFormData?.email || ''} 
              onChange={e => setEditFormData(prev => prev ? {...prev, email: e.target.value} : null)} 
            />
         </div>
         
         <FormInput 
           label="Endereço" 
           name="endereco" 
           value={editFormData?.endereco || ''} 
           onChange={e => setEditFormData(prev => prev ? {...prev, endereco: e.target.value} : null)} 
         />
         
         <FormInput 
           label="URL do Documento" 
           name="documentUrl" 
           value={editFormData?.documentUrl || ''} 
           onChange={e => setEditFormData(prev => prev ? {...prev, documentUrl: e.target.value} : null)} 
         />
         
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
