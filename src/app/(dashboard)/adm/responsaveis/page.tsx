"use client";

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { toast } from 'sonner';

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
  const [responsaveis, setResponsaveis] = useState<ResponsavelAdmUI[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   
  const [selectedResponsavel, setSelectedResponsavel] = useState<ResponsavelAdmUI | null>(null);
  const [editFormData, setEditFormData] = useState<ResponsavelForm | null>(null);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);
   
  // 1. SEPARAÇÃO DOS ESTADOS DE LOADING
  const [loadingTable, setLoadingTable] = useState(false); // Usado apenas para a tabela
  const [loadingDetails, setLoadingDetails] = useState(false); // Usado para as ações de ver/editar
  const [error, setError] = useState<string | null>(null);

  const loadResponsaveis = async () => {
    try {
      setLoadingTable(true); // Usa loadingTable
      setError(null);
      const data = await PetOwnerService.getAll();
      
      const formatados: ResponsavelAdmUI[] = data.map((petOwner: PetOwner) => ({
        id: petOwner.userId.toString(), 
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
      setLoadingTable(false); // Finaliza loadingTable
    }
  };

  useEffect(() => { loadResponsaveis(); }, []);

  // Função auxiliar para buscar dados frescos
  const fetchFullDetails = async (userId: string) => {
    try {
      setLoadingDetails(true); // 2. Usa loadingDetails (não afeta a tabela)
      const fullData = await PetOwnerService.getById(Number(userId));
      return fullData;
    } catch (error) {
      toast.error('Erro ao buscar detalhes atualizados do servidor.');
      throw error;
    } finally {
      setLoadingDetails(false); // Finaliza loadingDetails
    }
  };

  const handleView = async (responsavel: ResponsavelAdmUI) => {
    try {
        // Opcional: Mostrar um toast de "Carregando..." se a conexão for lenta, 
        // já que removemos o feedback visual da tabela.
        const fullData = await fetchFullDetails(responsavel.id);
        
        const responsavelCompleto: ResponsavelAdmUI = {
            ...responsavel,
            telefone: fullData.user?.phone || responsavel.telefone,
            nome: fullData.user?.completeName || responsavel.nome,
            email: fullData.user?.email || responsavel.email,
            endereco: fullData.fullAddress || responsavel.endereco,
            cpf: fullData.user?.cpf || responsavel.cpf,
            nis: fullData.nis || responsavel.nis
        };

        setSelectedResponsavel(responsavelCompleto);
        setIsViewModalOpen(true);
    } catch (error) {
        console.error(error);
    }
  };
   
  const handleEdit = async (responsavel: ResponsavelAdmUI) => {
    try {
        const fullData = await fetchFullDetails(responsavel.id);

        setEditFormData({
            nome: fullData.user?.completeName || '',
            cpf: maskCPF(fullData.user?.cpf || ''),
            nis: fullData.nis || '',
            telefone: maskPhone(fullData.user?.phone || ''), 
            email: fullData.user?.email || '',
            endereco: fullData.fullAddress || '',
            documentUrl: fullData.documentUrl || '',
            senha: '',
        });
        
        setSelectedResponsavel(responsavel);
        setIsEditModalOpen(true);
    } catch (error) {
        console.error(error);
    }
  };

  const handleDelete = async (responsavel: ResponsavelAdmUI) => {
    toast(`Deletar ${responsavel.nome}?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Deletar',
        onClick: async () => {
          try {
            setLoadingTable(true);
            await PetOwnerService.delete(Number(responsavel.id));
            await loadResponsaveis();
            toast.success('Responsável deletado com sucesso!');
          } catch (err: any) { 
            toast.error(err.message); 
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
      setLoadingTable(true); // Bloqueia a tabela durante o salvamento
      
      // ... (Validações mantidas igual) ...
      if (!createFormData.nome?.trim()) { toast.error('Nome completo é obrigatório'); setLoadingTable(false); return; }
      if (!createFormData.email?.trim()) { toast.error('Email é obrigatório'); setLoadingTable(false); return; }
      if (!createFormData.cpf || !validateCPF(createFormData.cpf)) { toast.error('CPF inválido ou não preenchido'); setLoadingTable(false); return; }
      if (!createFormData.telefone?.trim()) { toast.error('Telefone é obrigatório'); setLoadingTable(false); return; }
      if (!createFormData.endereco?.trim()) { toast.error('Endereço completo é obrigatório'); setLoadingTable(false); return; }
      if (!createFormData.senha || createFormData.senha.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); setLoadingTable(false); return; }
      
      const createUserDto: CreateUserDto = {
        completeName: createFormData.nome.trim(),
        email: createFormData.email.trim(),
        password: createFormData.senha,
        cpf: unmask(createFormData.cpf),
        phone: unmask(createFormData.telefone),
        role: Role.petOwner,
        address: createFormData.endereco.trim(),
        nis: createFormData.nis?.trim() || undefined,
        documentUrl: createFormData.documentUrl?.trim() || undefined,
      };
      
      await AuthService.register(createUserDto);
      
      await loadResponsaveis();
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      toast.success('Responsável cadastrado com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao cadastrar:', err);
      const message = err.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : (message || err.message);
      toast.error(`Erro ao cadastrar: ${displayMessage}`);
    } finally { 
      setLoadingTable(false); 
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedResponsavel) return;
    
    try {
      setLoadingTable(true); // Bloqueia tabela pois os dados vão mudar
      
      // ... (Validações mantidas) ...
      if (editFormData.cpf && !validateCPF(editFormData.cpf)) { toast.error('CPF inválido'); setLoadingTable(false); return; }
      if (editFormData.senha && editFormData.senha.length > 0 && editFormData.senha.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); setLoadingTable(false); return; }
      
      const updateData: UpdatePetOwnerData = {};
      
      if (editFormData.nome) updateData.completeName = editFormData.nome.trim();
      if (editFormData.email) updateData.email = editFormData.email.trim();
      if (editFormData.cpf) updateData.cpf = unmask(editFormData.cpf);
      if (editFormData.telefone) updateData.phone = unmask(editFormData.telefone);
      if (editFormData.senha?.trim()) updateData.password = editFormData.senha;
      if (editFormData.endereco) updateData.fullAddress = editFormData.endereco.trim();
      if (editFormData.documentUrl?.trim()) updateData.documentUrl = editFormData.documentUrl.trim();
      
      await PetOwnerService.update(Number(selectedResponsavel.id), updateData);
      
      await loadResponsaveis();
      setIsEditModalOpen(false);
      setSelectedResponsavel(null);
      toast.success('Responsável atualizado com sucesso!');
    } catch (err: any) { 
      const message = err.response?.data?.message;
      const displayMessage = Array.isArray(message) ? message[0] : (message || err.message);
      toast.error(displayMessage);
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
        // 3. A tabela agora só reage ao loadingTable
        isLoading={loadingTable}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
         {/* Opcional: Você pode usar loadingDetails aqui para mostrar um spinner dentro do modal se quiser */}
         {loadingDetails ? (
             <div className="flex justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
         ) : (
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
         )}
      </ViewModal>

      {/* --- MODAL CADASTRO --- */}
      <CadastroModal 
        isOpen={isCreateModalOpen} 
        onClose={() => {setIsCreateModalOpen(false); setCreateFormData(emptyForm);}} 
        onSubmit={handleCreateSave} 
        title="Novo Responsável" 
        saveText="Cadastrar"
      >
        {/* Conteúdo do modal mantido igual */}
         <FormInput 
           label="Nome Completo *" 
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
        {/* Conteúdo do modal mantido igual */}
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