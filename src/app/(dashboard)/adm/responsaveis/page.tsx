"use client";

import React, { useEffect, useState } from 'react';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { PetOwnerService, PetOwner, CreatePetOwnerData, UpdatePetOwnerData } from '@/services/petowner.service';

const TYPE_MAP = {
  'INDIVIDUAL': 'Pessoa Física',
  'NGO': 'ONG',
} as const;

const TYPE_REVERSE_MAP = {
  'Pessoa Física': 'INDIVIDUAL',
  'ONG': 'NGO',
} as const;

type TipoResponsavel = 'Pessoa Física' | 'ONG';

type Responsavel = {
  id: string;
  nome: string;
  tipo: TipoResponsavel;
  cpf?: string;
  nis?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
};

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

const TipoBadge: React.FC<{ tipo: TipoResponsavel }> = ({ tipo }) => {
  const getClasses = () => {
    return tipo === 'Pessoa Física'
      ? 'bg-blue-200 text-blue-800 border border-blue-300'
      : 'bg-purple-200 text-purple-800 border border-purple-300';
  };

  return <span className={`px-3 py-1 rounded-full font-semibold text-xs ${getClasses()}`}>{tipo}</span>;
};

const emptyForm: ResponsavelForm = {
  nome: '',
  tipo: 'Pessoa Física',
  cpf: '',
  nis: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  senha: '',
};

export default function PaginaGestaoResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<Responsavel | null>(null);
  const [editFormData, setEditFormData] = useState<ResponsavelForm | null>(null);
  const [createFormData, setCreateFormData] = useState<ResponsavelForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResponsaveis = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PetOwnerService.getAll();
      const data = Array.isArray(response) ? response : response.data;
      const responsaveisFormatados: Responsavel[] = data.map((petOwner: PetOwner) => ({
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
      setResponsaveis(responsaveisFormatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar responsáveis');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponsaveis();
  }, []);

  const columns: ColumnDefinition<Responsavel>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium text-gray-900">{item.nome}</span> },
    { header: 'Tipo', cell: (item) => <TipoBadge tipo={item.tipo} /> },
    { header: 'Documento', cell: (item) => <span className="text-gray-700">{item.tipo === 'Pessoa Física' ? item.cpf || 'N/A' : item.cnpj || 'N/A'}</span> },
    { header: 'Telefone', cell: (item) => <span>{item.telefone || 'N/A'}</span> },
    { header: 'Email', cell: (item) => <span>{item.email || 'N/A'}</span> },
  ];

  const handleView = (responsavel: Responsavel) => {
    setSelectedResponsavel(responsavel);
    setIsViewModalOpen(true);
  };

  const handleEdit = (responsavel: Responsavel) => {
    setEditFormData({
      nome: responsavel.nome,
      tipo: responsavel.tipo,
      cpf: responsavel.cpf || '',
      nis: responsavel.nis || '',
      cnpj: responsavel.cnpj || '',
      telefone: responsavel.telefone || '',
      email: responsavel.email || '',
      endereco: responsavel.endereco || '',
      senha: '',
    });
    setSelectedResponsavel(responsavel);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (responsavel: Responsavel) => {
    if (!window.confirm(`Tem certeza que deseja deletar o responsável ${responsavel.nome}?`)) return;
    try {
      setLoading(true);
      await PetOwnerService.delete(responsavel.id);
      await loadResponsaveis();
      alert('Responsável deletado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao deletar responsável: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedResponsavel) return;
    try {
      setLoading(true);
      const updateData: UpdatePetOwnerData = {
        name: editFormData.nome,
        type: TYPE_REVERSE_MAP[editFormData.tipo] as any,
        phone: editFormData.telefone,
        email: editFormData.email,
        address: editFormData.endereco,
      };
      if (editFormData.tipo === 'Pessoa Física') {
        updateData.cpf = editFormData.cpf;
        updateData.nis = editFormData.nis;
      } else {
        updateData.cnpj = editFormData.cnpj;
      }
      if (editFormData.senha && editFormData.senha.trim() !== '') {
        updateData.password = editFormData.senha;
      }
      await PetOwnerService.update(selectedResponsavel.id, updateData);
      await loadResponsaveis();
      setIsEditModalOpen(false);
      setSelectedResponsavel(null);
      alert('Responsável atualizado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao atualizar responsável: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const createData: CreatePetOwnerData = {
        name: createFormData.nome,
        type: TYPE_REVERSE_MAP[createFormData.tipo] as any,
        phone: createFormData.telefone,
        email: createFormData.email,
        address: createFormData.endereco,
        password: createFormData.senha,
      };
      if (createFormData.tipo === 'Pessoa Física') {
        if (!createFormData.cpf) {
          alert('CPF é obrigatório para Pessoa Física');
          return;
        }
        createData.cpf = createFormData.cpf;
        createData.nis = createFormData.nis;
      } else {
        if (!createFormData.cnpj) {
          alert('CNPJ é obrigatório para ONG');
          return;
        }
        createData.cnpj = createFormData.cnpj;
      }
      await PetOwnerService.create(createData);
      await loadResponsaveis();
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      alert('Responsável criado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao criar responsável: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Gestão de Responsáveis</h1>
          <p className="text-gray-600">{loading ? 'Carregando...' : `${responsaveis.length} responsável(is) cadastrado(s)`}</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          disabled={loading}
        >
          + Novo Responsável
        </button>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
      <CrudDisplay<Responsavel>
        data={responsaveis}
        columns={columns}
        searchPlaceholder="Buscar por nome, documento ou email..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ViewModal
        isOpen={isViewModalOpen && !!selectedResponsavel}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Responsável"
      >
        <div><label className="text-sm font-semibold text-gray-600">Nome:</label><p className="text-gray-800">{selectedResponsavel?.nome}</p></div>
        <div><label className="text-sm font-semibold text-gray-600">Tipo:</label><p className="text-gray-800">{selectedResponsavel?.tipo}</p></div>
        {selectedResponsavel?.tipo === 'Pessoa Física' ? (
          <>
            <div><label className="text-sm font-semibold text-gray-600">CPF:</label><p className="text-gray-800">{selectedResponsavel?.cpf || 'N/A'}</p></div>
            <div><label className="text-sm font-semibold text-gray-600">NIS:</label><p className="text-gray-800">{selectedResponsavel?.nis || 'N/A'}</p></div>
          </>
        ) : (
          <div><label className="text-sm font-semibold text-gray-600">CNPJ:</label><p className="text-gray-800">{selectedResponsavel?.cnpj || 'N/A'}</p></div>
        )}
        <div><label className="text-sm font-semibold text-gray-600">Telefone:</label><p className="text-gray-800">{selectedResponsavel?.telefone || 'N/A'}</p></div>
        <div><label className="text-sm font-semibold text-gray-600">Email:</label><p className="text-gray-800">{selectedResponsavel?.email || 'N/A'}</p></div>
        <div><label className="text-sm font-semibold text-gray-600">Endereço:</label><p className="text-gray-800">{selectedResponsavel?.endereco || 'N/A'}</p></div>
      </ViewModal>
      <CadastroModal isOpen={isEditModalOpen && !!editFormData} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Responsável" saveText="Salvar Alterações">
        <FormInput label="Nome:" name="nome" value={editFormData?.nome || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, nome: e.target.value } : null))} required />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Tipo:</label>
          <select value={editFormData?.tipo || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, tipo: e.target.value as TipoResponsavel } : null))} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" required>
            <option value="Pessoa Física">Pessoa Física</option>
            <option value="ONG">ONG</option>
          </select>
        </div>
        {editFormData?.tipo === 'Pessoa Física' ? (
          <>
            <FormInput label="CPF:" name="cpf" value={editFormData?.cpf || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, cpf: e.target.value } : null))} />
            <FormInput label="NIS:" name="nis" value={editFormData?.nis || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, nis: e.target.value } : null))} />
          </>
        ) : (
          <FormInput label="CNPJ:" name="cnpj" value={editFormData?.cnpj || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, cnpj: e.target.value } : null))} />
        )}
        <FormInput label="Telefone:" name="telefone" value={editFormData?.telefone || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, telefone: e.target.value } : null))} />
        <FormInput label="Email:" name="email" type="email" value={editFormData?.email || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, email: e.target.value } : null))} />
        <FormInput label="Endereço:" name="endereco" value={editFormData?.endereco || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, endereco: e.target.value } : null))} />
        <FormInput label="Nova Senha:" name="senha" type="password" placeholder="Deixe em branco para não alterar" value={editFormData?.senha || ''} onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, senha: e.target.value } : null))} />
      </CadastroModal>
      <CadastroModal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setCreateFormData(emptyForm); }} onSubmit={handleCreateSave} title="Novo Responsável" saveText="Cadastrar">
        <FormInput label="Nome:" name="nome" value={createFormData.nome} onChange={(e) => setCreateFormData({ ...createFormData, nome: e.target.value })} required />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Tipo:</label>
          <select value={createFormData.tipo} onChange={(e) => setCreateFormData({ ...createFormData, tipo: e.target.value as TipoResponsavel })} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" required>
            <option value="Pessoa Física">Pessoa Física</option>
            <option value="ONG">ONG</option>
          </select>
        </div>
        {createFormData.tipo === 'Pessoa Física' ? (
          <>
            <FormInput label="CPF: *" name="cpf" value={createFormData.cpf} onChange={(e) => setCreateFormData({ ...createFormData, cpf: e.target.value })} required />
            <FormInput label="NIS:" name="nis" value={createFormData.nis} onChange={(e) => setCreateFormData({ ...createFormData, nis: e.target.value })} />
          </>
        ) : (
          <FormInput label="CNPJ: *" name="cnpj" value={createFormData.cnpj} onChange={(e) => setCreateFormData({ ...createFormData, cnpj: e.target.value })} required />
        )}
        <FormInput label="Telefone:" name="telefone" value={createFormData.telefone} onChange={(e) => setCreateFormData({ ...createFormData, telefone: e.target.value })} />
        <FormInput label="Email:" name="email" type="email" value={createFormData.email} onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })} />
        <FormInput label="Endereço:" name="endereco" value={createFormData.endereco} onChange={(e) => setCreateFormData({ ...createFormData, endereco: e.target.value })} />
        <FormInput label="Senha:" name="senha" type="password" value={createFormData.senha} onChange={(e) => setCreateFormData({ ...createFormData, senha: e.target.value })} required />
      </CadastroModal>
    </div>
  );
}
