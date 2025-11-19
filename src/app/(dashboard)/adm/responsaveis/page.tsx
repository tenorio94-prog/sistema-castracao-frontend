"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { User, Building2 } from 'lucide-react';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
// IMPORTAÇÃO ATUALIZADA
import ResponsavelCardAdm, { ResponsavelAdmUI } from '@/components/CRUD/ResponsavelAdmCard';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { PetOwnerService, PetOwner, CreatePetOwnerData, UpdatePetOwnerData } from '@/services/petowner.service';

// --- CONSTANTES E TIPOS ---
const TYPE_MAP = { 'INDIVIDUAL': 'Pessoa Física', 'NGO': 'ONG' } as const;
const TYPE_REVERSE_MAP = { 'Pessoa Física': 'INDIVIDUAL', 'ONG': 'NGO' } as const;

type TipoResponsavel = 'Pessoa Física' | 'ONG';

// Usando a tipagem do novo componente
type Responsavel = ResponsavelAdmUI; 

type ResponsavelForm = {
  nome: string;
  tipo: TipoResponsavel;
  cpf: string;
  nis: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  senha: string;
};

const emptyForm: ResponsavelForm = {
  nome: '', tipo: 'Pessoa Física', cpf: '', nis: '', cnpj: '', telefone: '', email: '', endereco: '', senha: '',
};

const TipoBadge: React.FC<{ tipo: TipoResponsavel }> = ({ tipo }) => {
  const isPF = tipo === 'Pessoa Física';
  return (
    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${isPF ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
      {tipo}
    </span>
  );
};

export default function PaginaGestaoResponsaveis() {
  // --- ESTADOS ---
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  
  // Filtros
  const [filterPF, setFilterPF] = useState(false);
  const [filterONG, setFilterONG] = useState(false);

  // Modais e Forms
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [editFormData, setEditFormData] = useState<ResponsavelForm | null>(null);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- LOADERS ---
  const loadResponsaveis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PetOwnerService.getAll();
      const data = Array.isArray(response) ? response : response.data;
      
      const formatados: Responsavel[] = data.map((petOwner: PetOwner) => ({
        id: petOwner.id,
        nome: petOwner.name,
        tipo: TYPE_MAP[petOwner.type] || 'Pessoa Física',
        cpf: petOwner.cpf || '',
        nis: petOwner.nis || '',
        cnpj: petOwner.cnpj || '',
        telefone: petOwner.phone || '',
        email: petOwner.email || '',
        endereco: petOwner.address || '',
      }));
      setResponsaveis(formatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar responsáveis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadResponsaveis(); }, []);

  // --- FILTRAGEM ---
  const filteredResponsaveis = useMemo(() => {
    return responsaveis.filter(resp => {
      let match = true;
      if (filterPF || filterONG) {
        const isPF = resp.tipo === 'Pessoa Física';
        const isONG = resp.tipo === 'ONG';
        
        match = false;
        if (filterPF && isPF) match = true;
        if (filterONG && isONG) match = true;
      }
      return match;
    });
  }, [responsaveis, filterPF, filterONG]);

  // --- HANDLERS ---
  const handleView = (responsavel: Responsavel) => { setSelectedResponsavel(responsavel); setIsViewModalOpen(true); };
  
  const handleEdit = (responsavel: Responsavel) => {
    setEditFormData({
      nome: responsavel.nome, tipo: responsavel.tipo, cpf: responsavel.cpf || '', nis: responsavel.nis || '',
      cnpj: responsavel.cnpj || '', telefone: responsavel.telefone || '', email: responsavel.email || '',
      endereco: responsavel.endereco || '', senha: '',
    });
    setSelectedResponsavel(responsavel); setIsEditModalOpen(true);
  };

  const handleDelete = async (responsavel: Responsavel) => {
    if (!window.confirm(`Deletar ${responsavel.nome}?`)) return;
    try {
      setLoading(true); await PetOwnerService.delete(responsavel.id); await loadResponsaveis();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const createData: CreatePetOwnerData = {
        name: createFormData.nome, type: TYPE_REVERSE_MAP[createFormData.tipo] as any,
        phone: createFormData.telefone, email: createFormData.email, address: createFormData.endereco,
        password: createFormData.senha,
      };
      if (createFormData.tipo === 'Pessoa Física') {
        if (!createFormData.cpf) { alert('CPF obrigatório'); setLoading(false); return; }
        createData.cpf = createFormData.cpf; createData.nis = createFormData.nis;
      } else {
        if (!createFormData.cnpj) { alert('CNPJ obrigatório'); setLoading(false); return; }
        createData.cnpj = createFormData.cnpj;
      }
      await PetOwnerService.create(createData); await loadResponsaveis();
      setIsCreateModalOpen(false); setCreateFormData(emptyForm);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedResponsavel) return;
    try {
      setLoading(true);
      const updateData: UpdatePetOwnerData = {
        name: editFormData.nome, type: TYPE_REVERSE_MAP[editFormData.tipo] as any,
        phone: editFormData.telefone, email: editFormData.email, address: editFormData.endereco,
      };
      if (editFormData.tipo === 'Pessoa Física') { updateData.cpf = editFormData.cpf; updateData.nis = editFormData.nis; } 
      else { updateData.cnpj = editFormData.cnpj; }
      if (editFormData.senha) updateData.password = editFormData.senha;
      
      await PetOwnerService.update(selectedResponsavel.id, updateData); await loadResponsaveis();
      setIsEditModalOpen(false); setSelectedResponsavel(null);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  // --- COLUNAS ---
  const columns: ColumnDefinition<Responsavel>[] = [
    { header: 'Nome', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Tipo', cell: (item) => <TipoBadge tipo={item.tipo} /> },
    { header: 'Documento', cell: (item) => <span className="text-gray-600 font-mono text-xs">{item.tipo === 'Pessoa Física' ? item.cpf || '-' : item.cnpj || '-'}</span> },
    { header: 'Telefone', cell: (item) => <span className="text-gray-600">{item.telefone || '-'}</span> },
    { header: 'Email', cell: (item) => <span className="text-gray-600">{item.email || '-'}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <CrudHeader 
        title="Gestão de Responsáveis"
        description="Cadastre e gerencie os tutores e ONGs parceiras."
        buttonText="Cadastrar Responsável"
        onButtonClick={() => setIsCreateModalOpen(true)}
      />

      {error && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

      <CrudDisplay
        data={filteredResponsaveis}
        columns={columns}
        searchPlaceholder="Buscar por nome, documento ou email..."
        emptyMessage="Nenhum responsável encontrado."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        
        // FILTROS EXTRAS
        extraFilters={
          <>
             <button onClick={() => setFilterPF(!filterPF)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterPF ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <User size={16} /> Pessoa Física
              </button>
              <button onClick={() => setFilterONG(!filterONG)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterONG ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Building2 size={16} /> ONG
              </button>
          </>
        }

        // GRID VIEW (Usando o novo componente)
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
             <div className={`h-16 w-16 rounded-full flex items-center justify-center ${selectedResponsavel?.tipo === 'ONG' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
               {selectedResponsavel?.tipo === 'ONG' ? <Building2 size={32}/> : <User size={32}/>}
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedResponsavel?.nome}</h3>
               <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedResponsavel?.tipo === 'ONG' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{selectedResponsavel?.tipo}</span>
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              {selectedResponsavel?.tipo === 'Pessoa Física' ? (
                <>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">CPF</label><p className="font-medium">{selectedResponsavel?.cpf || '-'}</p></div>
                  <div><label className="text-xs font-bold text-gray-400 uppercase">NIS</label><p className="font-medium">{selectedResponsavel?.nis || '-'}</p></div>
                </>
              ) : (
                  <div><label className="text-xs font-bold text-gray-400 uppercase">CNPJ</label><p className="font-medium">{selectedResponsavel?.cnpj || '-'}</p></div>
              )}
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">Telefone</label><p className="font-medium">{selectedResponsavel?.telefone || '-'}</p></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Email</label><p className="font-medium">{selectedResponsavel?.email || '-'}</p></div>
           </div>
           <div><label className="text-xs font-bold text-gray-400 uppercase">Endereço</label><p className="font-medium text-gray-900">{selectedResponsavel?.endereco || '-'}</p></div>
        </div>
      </ViewModal>

      {/* --- MODAL CADASTRO --- */}
      <CadastroModal isOpen={isCreateModalOpen} onClose={() => {setIsCreateModalOpen(false); setCreateFormData(emptyForm);}} onSubmit={handleCreateSave} title="Novo Responsável" saveText="Cadastrar">
         <FormInput label="Nome Completo" name="nome" value={createFormData.nome} onChange={e => setCreateFormData({...createFormData, nome: e.target.value})} required />
         
         <div className="space-y-1">
           <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Tipo de Cadastro</label>
           <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900" value={createFormData.tipo} onChange={e => setCreateFormData({...createFormData, tipo: e.target.value as TipoResponsavel})}>
             <option value="Pessoa Física">Pessoa Física</option>
             <option value="ONG">ONG</option>
           </select>
         </div>

         {createFormData.tipo === 'Pessoa Física' ? (
            <div className="grid grid-cols-2 gap-4">
               <FormInput label="CPF *" name="cpf" value={createFormData.cpf} onChange={e => setCreateFormData({...createFormData, cpf: e.target.value})} required />
               <FormInput label="NIS" name="nis" value={createFormData.nis} onChange={e => setCreateFormData({...createFormData, nis: e.target.value})} />
            </div>
         ) : (
            <FormInput label="CNPJ *" name="cnpj" value={createFormData.cnpj} onChange={e => setCreateFormData({...createFormData, cnpj: e.target.value})} required />
         )}

         <div className="grid grid-cols-2 gap-4">
            <FormInput label="Telefone" name="telefone" value={createFormData.telefone} onChange={e => setCreateFormData({...createFormData, telefone: e.target.value})} />
            <FormInput label="Email" name="email" type="email" value={createFormData.email} onChange={e => setCreateFormData({...createFormData, email: e.target.value})} />
         </div>
         <FormInput label="Endereço" name="endereco" value={createFormData.endereco} onChange={e => setCreateFormData({...createFormData, endereco: e.target.value})} />
         <FormInput label="Senha de Acesso" name="senha" type="password" value={createFormData.senha} onChange={e => setCreateFormData({...createFormData, senha: e.target.value})} required />
      </CadastroModal>

      {/* --- MODAL EDIÇÃO --- */}
      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Responsável" saveText="Salvar">
         <FormInput label="Nome Completo" name="nome" value={editFormData?.nome || ''} onChange={e => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} />
         
         <div className="space-y-1">
           <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Tipo</label>
           <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none" value={editFormData?.tipo} onChange={e => setEditFormData(prev => prev ? {...prev, tipo: e.target.value as TipoResponsavel} : null)}>
             <option value="Pessoa Física">Pessoa Física</option>
             <option value="ONG">ONG</option>
           </select>
         </div>

         {editFormData?.tipo === 'Pessoa Física' ? (
            <div className="grid grid-cols-2 gap-4">
               <FormInput label="CPF" name="cpf" value={editFormData?.cpf || ''} onChange={e => setEditFormData(prev => prev ? {...prev, cpf: e.target.value} : null)} />
               <FormInput label="NIS" name="nis" value={editFormData?.nis || ''} onChange={e => setEditFormData(prev => prev ? {...prev, nis: e.target.value} : null)} />
            </div>
         ) : (
            <FormInput label="CNPJ" name="cnpj" value={editFormData?.cnpj || ''} onChange={e => setEditFormData(prev => prev ? {...prev, cnpj: e.target.value} : null)} />
         )}
         
         <div className="grid grid-cols-2 gap-4">
            <FormInput label="Telefone" name="telefone" value={editFormData?.telefone || ''} onChange={e => setEditFormData(prev => prev ? {...prev, telefone: e.target.value} : null)} />
            <FormInput label="Email" name="email" type="email" value={editFormData?.email || ''} onChange={e => setEditFormData(prev => prev ? {...prev, email: e.target.value} : null)} />
         </div>
         <FormInput label="Endereço" name="endereco" value={editFormData?.endereco || ''} onChange={e => setEditFormData(prev => prev ? {...prev, endereco: e.target.value} : null)} />
         
         <div className="pt-4 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-500 mb-2">Deixe em branco para manter a senha atual.</p>
            <FormInput label="Nova Senha" name="senha" type="password" value={editFormData?.senha || ''} onChange={e => setEditFormData(prev => prev ? {...prev, senha: e.target.value} : null)} />
         </div>
      </CadastroModal>

    </div>
  );
}