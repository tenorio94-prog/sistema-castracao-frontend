"use client"; 

import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CrudHeader from '@/components/CRUD/CrudHeader';
import React, { useEffect, useState } from 'react';
import ViewModal from '@/components/modals/ViewModal';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import CardBaseDash from '@/components/Dashboard/CardBaseDash'; 
import { Dog, CrossIcon } from "lucide-react"; 

// --- Tipos de Responsável (reutilizados) ---
type ResponsavelSimples = {
    id: string;
    nome: string;
    tipo: 'PF' | 'ONG';
};

// --- Tipos para Animal ---
type Animal = {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  idade: string;
  sexo: string;
  status: 'Finalizado' | 'Triagem pendente' | 'Retorno pendente' | 'Inapto';
  responsavelId: string; 
  responsavelNome: string; 
};

type AnimalForm = Omit<Animal, 'id' | 'responsavelNome' | 'status'>;
const emptyForm: AnimalForm = { 
  nome: '', 
  especie: '', 
  raca: '', 
  idade: '', 
  sexo: '', 
  responsavelId: ''
};

// --- Funções de Fetch (Simuladas) ---

async function fetchResponsaveisSimples(): Promise<ResponsavelSimples[]> {
    return [
        { id: 'resp1', nome: 'João Silva (PF)', tipo: 'PF' },
        { id: 'resp2', nome: 'ONG Amigos dos Animais', tipo: 'ONG' },
        { id: 'resp3', nome: 'Instituto Patinhas', tipo: 'ONG' },
        { id: 'resp4', nome: 'Maria Souza (PF)', tipo: 'PF' },
    ];
}

async function fetchAnimais(): Promise<Animal[]> {
  return [
    { id: '1', nome: 'Rex', especie: 'Cão', raca: 'Labrador', idade: '5 anos', sexo: 'Macho', status: 'Finalizado', responsavelId: 'resp1', responsavelNome: 'João Silva' },
    { id: '2', nome: 'Frajola', especie: 'Gato', raca: 'Siamês', idade: '2 anos', sexo: 'Fêmea', status: 'Triagem pendente', responsavelId: 'resp2', responsavelNome: 'ONG Amigos dos Animais' },
    { id: '3', nome: 'Bolinha', especie: 'Cão', raca: 'Poodle', idade: '8 meses', sexo: 'Fêmea', status: 'Retorno pendente', responsavelId: 'resp1', responsavelNome: 'João Silva' },
    { id: '4', nome: 'Luna', especie: 'Gato', raca: 'Persa', idade: '4 anos', sexo: 'Fêmea', status: 'Inapto', responsavelId: 'resp3', responsavelNome: 'Instituto Patinhas' },
    { id: '5', nome: 'Thor', especie: 'Cão', raca: 'Golden Retriever', idade: '3 anos', sexo: 'Macho', status: 'Finalizado', responsavelId: 'resp4', responsavelNome: 'Maria Souza' },
  ];
}


// --- Componente da Página ---
export default function PaginaAnimais() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [responsaveisDisponiveis, setResponsaveisDisponiveis] = useState<ResponsavelSimples[]>([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [createFormData, setCreateFormData] = useState<AnimalForm>(emptyForm);
  const [editFormData, setEditFormData] = useState<Animal | null>(null);

  
  useEffect(() => {
    fetchAnimais().then(data => setAnimais(data));
    fetchResponsaveisSimples().then(data => setResponsaveisDisponiveis(data));
  }, []);

  // Definição das Colunas
  const columns: ColumnDefinition<Animal>[] = [
    { header: 'Nome', cell: (item) => <span className="font-medium">{item.nome}</span> },
    { header: 'Espécie', cell: (item) => <span>{item.especie}</span> },
    { header: 'Raça', cell: (item) => <span>{item.raca}</span> },
    { header: 'Responsável', cell: (item) => <span>{item.responsavelNome}</span> },
    { 
        header: 'Status', 
        cell: (item) => (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                item.status === 'Finalizado' ? 'bg-green-100 text-green-800' :
                item.status === 'Triagem pendente' ? 'bg-yellow-100 text-yellow-800' :
                item.status === 'Retorno pendente' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800' 
            }`}>
                {item.status}
            </span>
        ) 
    },
  ];

  // Handlers (sem alterações)
  const handleView = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsViewModalOpen(true);
  };

  const handleEdit = (animal: Animal) => {
    setEditFormData(animal);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (animal: Animal) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${animal.nome}?`)) {
      return;
    }
    setAnimais(animais.filter(a => a.id !== animal.id));
    alert('Animal deletado(a) com sucesso!');
  };

  const handleOpenCreate = () => {
    setCreateFormData(emptyForm); 
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const responsavelSelecionado = responsaveisDisponiveis.find(r => r.id === createFormData.responsavelId);
    const novoAnimal: Animal = { 
      ...createFormData, 
      id: Math.random().toString(),
      status: 'Finalizado', 
      responsavelNome: responsavelSelecionado ? responsavelSelecionado.nome : 'Desconhecido' 
    }; 
    setAnimais([...animais, novoAnimal]); 
    setIsCreateModalOpen(false); 
    alert('Animal cadastrado(a)!');
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return; 
    const responsavelSelecionado = responsaveisDisponiveis.find(r => r.id === editFormData.responsavelId);
    const animalAtualizado: Animal = {
      ...editFormData,
      responsavelNome: responsavelSelecionado ? responsavelSelecionado.nome : 'Desconhecido'
    };
    setAnimais(animais.map(a => a.id === animalAtualizado.id ? animalAtualizado : a));
    setIsEditModalOpen(false);
  };


  // Renderização
  return (
  
    <div className="flex flex-col space-y-4">
      
      <CrudHeader
        title="Animais"
        buttonText="Novo Animal"
        onButtonClick={handleOpenCreate} 
      />

      <div className= "flex flex-wrap gap-3 mt-1">
        <CardBaseDash
          title="Animais Cadastrados"
          value={animais.length} // <-- Valor dinâmico
          subtitle="Total desde o início"
          icon={<Dog/>}
        />
        <CardBaseDash
          title="Animais Castrados"
          value={2} // <-- Valor estático (simulação)
          subtitle="Total desde o início"
          icon={<CrossIcon/>}
        />
      </div>
      
      <CrudDisplay<Animal>
        data={animais}
        columns={columns}
        searchPlaceholder="Buscar por nome ou responsável..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização (sem alterações) */}
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
          <p className="text-gray-800">{selectedAnimal?.raca}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Idade:</label>
          <p className="text-gray-800">{selectedAnimal?.idade}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Sexo:</label>
          <p className="text-gray-800">{selectedAnimal?.sexo}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Responsável:</label>
          <p className="text-gray-800">{selectedAnimal?.responsavelNome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Status:</label>
          <p className="text-gray-800">{selectedAnimal?.status}</p>
        </div>
      </ViewModal>

      {/* Modal de Edição (sem alterações) */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Animal"
        saveText="Salvar Alterações"
      >
        <FormInput
          label="Nome:"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, nome: e.target.value } : null)}
        />
        <div className="mb-4">
          <label htmlFor="edit-especie" className="block text-sm font-semibold text-gray-600">Espécie</label>
          <select
            id="edit-especie"
            name="especie"
            value={editFormData?.especie || ''}
            onChange={(e) => setEditFormData(prev => prev ? { ...prev, especie: e.target.value } : null)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="">Selecione a espécie</option>
            <option value="Cão">Cão</option>
            <option value="Gato">Gato</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <FormInput
          label="Raça:"
          name="raca"
          value={editFormData?.raca || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, raca: e.target.value } : null)}
        />
        <FormInput
          label="Idade:"
          name="idade"
          placeholder="Ex: 3 anos"
          value={editFormData?.idade || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, idade: e.target.value } : null)}
        />
        <div className="mb-4">
          <label htmlFor="edit-sexo" className="block text-sm font-semibold text-gray-600">Sexo</label>
          <select
            id="edit-sexo"
            name="sexo"
            value={editFormData?.sexo || ''}
            onChange={(e) => setEditFormData(prev => prev ? { ...prev, sexo: e.target.value } : null)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="">Selecione o sexo</option>
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="edit-responsavel" className="block text-sm font-semibold text-gray-600">Responsável</label>
          <select
            id="edit-responsavel"
            name="responsavelId"
            value={editFormData?.responsavelId || ''}
            onChange={(e) => setEditFormData(prev => prev ? { ...prev, responsavelId: e.target.value } : null)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="">Selecione um responsável</option>
            {responsaveisDisponiveis.map(resp => (
              <option key={resp.id} value={resp.id}>
                {resp.nome} {resp.tipo === 'PF' ? '(Pessoa Física)' : '(ONG)'}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="edit-status" className="block text-sm font-semibold text-gray-600">Status</label>
          <select
            id="edit-status"
            name="status"
            value={editFormData?.status || 'Finalizado'}
            onChange={(e) => setEditFormData(prev => prev ? { ...prev, status: e.target.value as Animal['status'] } : null)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="Finalizado">Finalizado</option>
            <option value="Triagem pendente">Triagem pendente</option>
            <option value="Retorno pendente">Retorno pendente</option>
            <option value="Inapto">Inapto</option>
          </select>
        </div>
      </CadastroModal>

      {/* Modal de Cadastro (sem alterações) */}
      <CadastroModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSave}
        title="Cadastrar Novo Animal"
        saveText="Cadastrar"
      >
        <FormInput
          label="Nome"
          name="nome"
          placeholder="Insira o nome do animal"
          value={createFormData.nome}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, nome: e.target.value }))}
        />
        <div className="mb-4">
          <label htmlFor="create-especie" className="block text-sm font-semibold text-gray-600">Espécie</label>
          <select
            id="create-especie"
            name="especie"
            value={createFormData.especie}
            onChange={(e) => setCreateFormData(prev => ({ ...prev, especie: e.target.value }))}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="">Selecione a espécie</option>
            <option value="Cão">Cão</option>
            <option value="Gato">Gato</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <FormInput
          label="Raça"
          name="raca"
          placeholder="Insira a raça do animal"
          value={createFormData.raca}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, raca: e.target.value }))}
        />
        <FormInput
          label="Idade"
          name="idade"
          placeholder="Ex: 3 anos"
          value={createFormData.idade}
          onChange={(e) => setCreateFormData(prev => ({ ...prev, idade: e.target.value }))}
        />
        <div className="mb-4">
          <label htmlFor="create-sexo" className="block text-sm font-semibold text-gray-600">Sexo</label>
          <select
            id="create-sexo"
            name="sexo"
            value={createFormData.sexo}
            onChange={(e) => setCreateFormData(prev => ({ ...prev, sexo: e.target.value }))}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="">Selecione o sexo</option>
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="create-responsavel" className="block text-sm font-semibold text-gray-600">Responsável</label>
          <select
            id="create-responsavel"
            name="responsavelId"
            value={createFormData.responsavelId}
            onChange={(e) => setCreateFormData(prev => ({ ...prev, responsavelId: e.target.value }))}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="">Selecione um responsável</option>
            {/* Aqui estão as linhas que faltavam */}
            {responsaveisDisponiveis.map(resp => (
              <option key={resp.id} value={resp.id}>
                {resp.nome} {resp.tipo === 'PF' ? '(Pessoa Física)' : '(ONG)'}
              </option>
            ))}
          </select>
        </div>
      </CadastroModal>
    </div>
  );
}