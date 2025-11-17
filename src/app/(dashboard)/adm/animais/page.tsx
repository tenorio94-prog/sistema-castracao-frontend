"use client";

import React, { useEffect, useState } from 'react';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput';
import { AnimalService, Animal, CreateAnimalData, UpdateAnimalData } from '@/services/animal.service';
import { PetOwnerService, PetOwner } from '@/services/petowner.service';

// 1. Mapeamento de Status
const STATUS_MAP = {
  'COMPLETED': 'Finalizado',
  'PENDING_SCREENING': 'Triagem pendente',
  'PENDING_RETURN': 'Retorno pendente',
  'UNFIT': 'Inapto',
} as const;

const STATUS_REVERSE_MAP = {
  'Finalizado': 'COMPLETED',
  'Triagem pendente': 'PENDING_SCREENING',
  'Retorno pendente': 'PENDING_RETURN',
  'Inapto': 'UNFIT',
} as const;

const SEX_MAP = {
  'MALE': 'Macho',
  'FEMALE': 'Fêmea',
} as const;

const SEX_REVERSE_MAP = {
  'Macho': 'MALE',
  'Fêmea': 'FEMALE',
} as const;

type StatusAnimal = 'Finalizado' | 'Triagem pendente' | 'Retorno pendente' | 'Inapto';
type SexoAnimal = 'Macho' | 'Fêmea';

type AnimalUI = {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
  sexo?: SexoAnimal;
  status?: StatusAnimal;
  responsavelId: string;
  responsavelNome?: string;
};

type AnimalForm = {
  nome: string;
  especie: string;
  raca: string;
  idade: string;
  peso: string;
  sexo: SexoAnimal;
  responsavelId: string;
};

// 2. Componente de Badge de Status
const StatusBadge: React.FC<{ status?: StatusAnimal }> = ({ status }) => {
  const getClasses = () => {
    switch (status) {
      case 'Finalizado':
        return 'bg-green-200 text-green-800';
      case 'Triagem pendente':
        return 'bg-yellow-200 text-yellow-800 border border-yellow-300';
      case 'Retorno pendente':
        return 'bg-blue-200 text-blue-800 border border-blue-300';
      case 'Inapto':
        return 'bg-red-200 text-red-800 border border-red-300';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full font-semibold text-xs ${getClasses()}`}>
      {status || 'N/A'}
    </span>
  );
};

const emptyForm: AnimalForm = {
  nome: '',
  especie: '',
  raca: '',
  idade: '',
  peso: '',
  sexo: 'Macho',
  responsavelId: '',
};

// 3. Componente da Página
export default function PaginaGestaoAnimais() {
  // 4. Estados
  const [animais, setAnimais] = useState<AnimalUI[]>([]);
  const [responsaveis, setResponsaveis] = useState<PetOwner[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalUI | null>(null);
  const [editFormData, setEditFormData] = useState<AnimalForm | null>(null);
  const [createFormData, setCreateFormData] = useState<AnimalForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5. Carregar dados da API
  const loadAnimais = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AnimalService.getAll();

      // Converter dados da API para formato da UI
      const data = Array.isArray(response) ? response : response.data;
      const animaisFormatados: AnimalUI[] = data.map((animal: Animal) => ({
        id: animal.id,
        nome: animal.name,
        especie: animal.species,
        raca: animal.breed,
        idade: animal.age,
        peso: animal.weight,
        sexo: animal.sex ? SEX_MAP[animal.sex] : undefined,
        status: animal.status ? STATUS_MAP[animal.status] : undefined,
        responsavelId: animal.petOwnerId,
        responsavelNome: animal.petOwner?.name,
      }));

      setAnimais(animaisFormatados);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar animais');
      console.error('Erro ao carregar animais:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResponsaveis = async () => {
    try {
      const response = await PetOwnerService.getAll();
      const data = Array.isArray(response) ? response : response.data;
      setResponsaveis(data);
    } catch (err: any) {
      console.error('Erro ao carregar responsáveis:', err);
    }
  };

  useEffect(() => {
    loadAnimais();
    loadResponsaveis();
  }, []);

  // 6. Definição das Colunas
  const columns: ColumnDefinition<AnimalUI>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium text-gray-900">{item.nome}</span> },
    { header: 'Espécie', cell: (item) => <span className="text-gray-700">{item.especie}</span> },
    { header: 'Raça', cell: (item) => <span>{item.raca || 'N/A'}</span> },
    { header: 'Sexo', cell: (item) => <span>{item.sexo || 'N/A'}</span> },
    { header: 'Responsável', cell: (item) => <span>{item.responsavelNome || 'N/A'}</span> },
    { header: 'Status', cell: (item) => <StatusBadge status={item.status} /> },
  ];

  // 7. Handlers
  const handleView = (animal: AnimalUI) => {
    setSelectedAnimal(animal);
    setIsViewModalOpen(true);
  };

  const handleEdit = (animal: AnimalUI) => {
    setEditFormData({
      nome: animal.nome,
      especie: animal.especie,
      raca: animal.raca || '',
      idade: animal.idade?.toString() || '',
      peso: animal.peso?.toString() || '',
      sexo: animal.sexo || 'Macho',
      responsavelId: animal.responsavelId,
    });
    setSelectedAnimal(animal);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (animal: AnimalUI) => {
    if (!window.confirm(`Tem certeza que deseja deletar o animal ${animal.nome}?`)) {
      return;
    }

    try {
      setLoading(true);
      await AnimalService.delete(animal.id);
      await loadAnimais();
      alert('Animal deletado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao deletar animal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedAnimal) return;

    try {
      setLoading(true);

      const updateData: UpdateAnimalData = {
        name: editFormData.nome,
        species: editFormData.especie,
        breed: editFormData.raca || undefined,
        age: editFormData.idade ? parseInt(editFormData.idade) : undefined,
        weight: editFormData.peso ? parseFloat(editFormData.peso) : undefined,
        sex: SEX_REVERSE_MAP[editFormData.sexo] as any,
        petOwnerId: editFormData.responsavelId,
      };

      await AnimalService.update(selectedAnimal.id, updateData);
      await loadAnimais();
      setIsEditModalOpen(false);
      setSelectedAnimal(null);
      alert('Animal atualizado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao atualizar animal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!createFormData.nome || !createFormData.especie || !createFormData.responsavelId) {
        alert('Nome, espécie e responsável são obrigatórios');
        return;
      }

      const createData: CreateAnimalData = {
        name: createFormData.nome,
        species: createFormData.especie,
        breed: createFormData.raca || undefined,
        age: createFormData.idade ? parseInt(createFormData.idade) : undefined,
        weight: createFormData.peso ? parseFloat(createFormData.peso) : undefined,
        sex: SEX_REVERSE_MAP[createFormData.sexo] as any,
        petOwnerId: createFormData.responsavelId,
      };

      await AnimalService.create(createData);
      await loadAnimais();
      setIsCreateModalOpen(false);
      setCreateFormData(emptyForm);
      alert('Animal criado com sucesso!');
    } catch (err: any) {
      alert(`Erro ao criar animal: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 8. JSX (Renderização)
  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Gestão de Animais</h1>
          <p className="text-gray-600">
            {loading ? 'Carregando...' : `${animais.length} animal(is) cadastrado(s)`}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          disabled={loading}
        >
          + Novo Animal
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabela */}
      <CrudDisplay<AnimalUI>
        data={animais}
        columns={columns}
        searchPlaceholder="Buscar por nome, espécie ou responsável..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedAnimal}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Animal"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Nome:</label>
          <p className="text-gray-800">{selectedAnimal?.nome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Espécie:</label>
          <p className="text-gray-800">{selectedAnimal?.especie}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Raça:</label>
          <p className="text-gray-800">{selectedAnimal?.raca || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Idade:</label>
          <p className="text-gray-800">{selectedAnimal?.idade ? `${selectedAnimal.idade} anos` : 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Peso:</label>
          <p className="text-gray-800">{selectedAnimal?.peso ? `${selectedAnimal.peso} kg` : 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Sexo:</label>
          <p className="text-gray-800">{selectedAnimal?.sexo || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Status:</label>
          <p className="text-gray-800">{selectedAnimal?.status || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Responsável:</label>
          <p className="text-gray-800">{selectedAnimal?.responsavelNome || 'N/A'}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Animal"
        saveText="Salvar Alterações"
      >
        <FormInput
          label="Nome: *"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, nome: e.target.value } : null))}
          required
        />
        <FormInput
          label="Espécie: *"
          name="especie"
          value={editFormData?.especie || ''}
          onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, especie: e.target.value } : null))}
          required
        />
        <FormInput
          label="Raça:"
          name="raca"
          value={editFormData?.raca || ''}
          onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, raca: e.target.value } : null))}
        />
        <FormInput
          label="Idade (anos):"
          name="idade"
          type="number"
          value={editFormData?.idade || ''}
          onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, idade: e.target.value } : null))}
        />
        <FormInput
          label="Peso (kg):"
          name="peso"
          type="number"
          step="0.1"
          value={editFormData?.peso || ''}
          onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, peso: e.target.value } : null))}
        />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Sexo:</label>
          <select
            value={editFormData?.sexo || ''}
            onChange={(e) =>
              setEditFormData((prev) => (prev ? { ...prev, sexo: e.target.value as SexoAnimal } : null))
            }
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          >
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Responsável: *</label>
          <select
            value={editFormData?.responsavelId || ''}
            onChange={(e) => setEditFormData((prev) => (prev ? { ...prev, responsavelId: e.target.value } : null))}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          >
            <option value="">Selecione um responsável</option>
            {responsaveis.map((resp) => (
              <option key={resp.id} value={resp.id}>
                {resp.name} ({resp.type === 'INDIVIDUAL' ? 'PF' : 'ONG'})
              </option>
            ))}
          </select>
        </div>
      </CadastroModal>

      {/* Modal de Criação */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateFormData(emptyForm);
        }}
        onSubmit={handleCreateSave}
        title="Novo Animal"
        saveText="Cadastrar"
      >
        <FormInput
          label="Nome: *"
          name="nome"
          value={createFormData.nome}
          onChange={(e) => setCreateFormData({ ...createFormData, nome: e.target.value })}
          required
        />
        <FormInput
          label="Espécie: *"
          name="especie"
          placeholder="Ex: Cachorro, Gato"
          value={createFormData.especie}
          onChange={(e) => setCreateFormData({ ...createFormData, especie: e.target.value })}
          required
        />
        <FormInput
          label="Raça:"
          name="raca"
          placeholder="Ex: Vira-lata, Siamês"
          value={createFormData.raca}
          onChange={(e) => setCreateFormData({ ...createFormData, raca: e.target.value })}
        />
        <FormInput
          label="Idade (anos):"
          name="idade"
          type="number"
          value={createFormData.idade}
          onChange={(e) => setCreateFormData({ ...createFormData, idade: e.target.value })}
        />
        <FormInput
          label="Peso (kg):"
          name="peso"
          type="number"
          step="0.1"
          value={createFormData.peso}
          onChange={(e) => setCreateFormData({ ...createFormData, peso: e.target.value })}
        />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Sexo:</label>
          <select
            value={createFormData.sexo}
            onChange={(e) => setCreateFormData({ ...createFormData, sexo: e.target.value as SexoAnimal })}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
          >
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Responsável: *</label>
          <select
            value={createFormData.responsavelId}
            onChange={(e) => setCreateFormData({ ...createFormData, responsavelId: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            required
          >
            <option value="">Selecione um responsável</option>
            {responsaveis.map((resp) => (
              <option key={resp.id} value={resp.id}>
                {resp.name} ({resp.type === 'INDIVIDUAL' ? 'PF' : 'ONG'})
              </option>
            ))}
          </select>
        </div>
      </CadastroModal>
    </div>
  );
}
