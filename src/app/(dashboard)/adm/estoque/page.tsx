"use client"; 

import React, { useEffect, useState } from 'react';
import CadastroModal from '@/components/modals/CadastroModal';
import FormInput from '@/components/forms/FormInput'; 
import ViewModal from '@/components/modals/ViewModal';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import { 
  ArchiveIcon, 
  AlertTriangleIcon, 
  SirenIcon, 
  PlusIcon
} from "lucide-react"; 

// 1. Definição de Tipos
type EstoqueItem = {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  minimo: number;
};

type ItemForm = Omit<EstoqueItem, 'id' | 'quantidade'>;

type MovimentacaoForm = {
  tipo: 'Entrada' | 'Saída';
  itemId: string;
  quantidade: number;
  data: string;
};

const emptyMovimentacaoForm: MovimentacaoForm = {
  tipo: 'Entrada',
  itemId: '',
  quantidade: 0,
  data: ''
};

// 2. Lógica de API (Fetch)
async function fetchEstoque(): Promise<EstoqueItem[]> {
  return [
    { id: '1', nome: 'Luvas Cirúrgicas P', quantidade: 500, unidade: 'unidades', minimo: 200 },
    { id: '2', nome: 'Luvas Cirúrgicas M', quantidade: 45, unidade: 'unidades', minimo: 50 },
    { id: '3', nome: 'Seringa 5ml', quantidade: 15, unidade: 'unidades', minimo: 30 },
    { id: '4', nome: 'Gaze Estéril', quantidade: 500, unidade: 'pacotes', minimo: 200 },
    { id: '5', nome: 'Álcool 70% 1L', quantidade: 500, unidade: 'litros', minimo: 200 },
  ];
}

// 3. Componente da Página
export default function PaginaEstoque() {
  // 4. Estados
  const [itensEstoque, setItensEstoque] = useState<EstoqueItem[]>([]);
  const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [movimentacaoForm, setMovimentacaoForm] = useState<MovimentacaoForm>(emptyMovimentacaoForm);
  const [selectedItem, setSelectedItem] = useState<EstoqueItem | null>(null);
  const [editFormData, setEditFormData] = useState<ItemForm | null>(null);

  useEffect(() => {
    fetchEstoque().then(data => setItensEstoque(data));
  }, []);

  // 5. Lógica de Status
  const getStatus = (item: EstoqueItem): { texto: string, cor: string } => {
    if (item.quantidade <= item.minimo * 0.5) { 
      return { texto: 'Estoque Crítico', cor: 'bg-red-200 text-red-800' };
    }
    if (item.quantidade <= item.minimo) { 
      return { texto: 'Estoque Baixo', cor: 'bg-yellow-200 text-yellow-800' };
    }
    return { texto: 'Em Estoque', cor: 'bg-green-200 text-green-800' };
  };

  const totalItens = itensEstoque.length;
  const totalBaixo = itensEstoque.filter(item => getStatus(item).texto === 'Estoque Baixo').length;
  const totalCritico = itensEstoque.filter(item => getStatus(item).texto === 'Estoque Crítico').length;

  // 6. Handlers
  const handleOpenMovimentacao = () => {
    setMovimentacaoForm(emptyMovimentacaoForm);
    setIsMovimentacaoModalOpen(true);
  };

  const handleView = (item: EstoqueItem) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: EstoqueItem) => {
    setEditFormData({ nome: item.nome, unidade: item.unidade, minimo: item.minimo });
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setItensEstoque(prevItens => 
      prevItens.map(item => {
        if (item.id === movimentacaoForm.itemId) {
          const novaQuantidade = movimentacaoForm.tipo === 'Entrada'
            ? item.quantidade + Number(movimentacaoForm.quantidade)
            : item.quantidade - Number(movimentacaoForm.quantidade);
          return { ...item, quantidade: novaQuantidade < 0 ? 0 : novaQuantidade };
        }
        return item;
      })
    );
    setIsMovimentacaoModalOpen(false);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !selectedItem) return;
    setItensEstoque(prevItens =>
      prevItens.map(item => {
        if (item.id === selectedItem.id) {
          return { ...item, ...editFormData, minimo: Number(editFormData.minimo) };
        }
        return item;
      })
    );
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  // 7. Definição das Colunas para o CrudDisplay
  const columns: ColumnDefinition<EstoqueItem>[] = [
    { 
      header: 'Item', 
      cell: (item) => <span className="font-medium text-gray-900">{item.nome}</span> 
    },
    { header: 'Quantidade', cell: (item) => <span>{item.quantidade}</span> },
    { header: 'Unidade', cell: (item) => <span>{item.unidade}</span> },
    { header: 'Mínimo', cell: (item) => <span>{item.minimo}</span> },
    { 
      header: 'Status', 
      cell: (item) => {
        const status = getStatus(item);
        return (
          <span className={`px-3 py-1 rounded-full font-semibold text-xs ${status.cor}`}>
            {status.texto}
          </span>
        );
      }
    },
  ];

  // 8. JSX (Renderização)
  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-700">Gestão de Estoque</h1>
          <p className="text-gray-600">Controle de insumos e materiais</p>
        </div>
        <button
          onClick={handleOpenMovimentacao}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          <PlusIcon className="w-4 h-4" />
          Adicionar Entrada/Saída
        </button>
      </div>

      {/* Cards de Status */}
      <div className="flex flex-wrap gap-3 mt-1">
        <CardBaseDash
          title="Itens em estoque"
          value={totalItens}
          subtitle="Total de produtos únicos"
          icon={<ArchiveIcon />}
        />
        <CardBaseDash
          title="Estoque Baixo"
          value={totalBaixo}
          subtitle="Itens abaixo do mínimo"
          icon={<AlertTriangleIcon />}
        />
        <CardBaseDash
          title="Estoque Crítico"
          value={totalCritico}
          subtitle="Itens com risco de falta"
          icon={<SirenIcon />}
        />
      </div>

      {/* ############################################# */}
      {/* ### TABELA SUBSTITUÍDA PELO CRUDDISPLAY ### */}
      {/* ############################################# */}
      <CrudDisplay<EstoqueItem>
        data={itensEstoque}
        columns={columns}
        searchPlaceholder="Buscar por item..."
        onView={handleView}
        onEdit={handleEdit}
        // onDelete é omitido, então o botão não vai aparecer!
      />

      {/* Modal: Ver Detalhes */}
      <ViewModal
        isOpen={isViewModalOpen && !!selectedItem}
        onClose={() => setIsViewModalOpen(false)}
        title="Detalhes do Item"
      >
        <div>
          <label className="text-sm font-semibold text-gray-600">Item:</label>
          <p className="text-gray-800">{selectedItem?.nome}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Quantidade em Estoque:</label>
          <p className="text-gray-800">{selectedItem?.quantidade}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Unidade:</label>
          <p className="text-gray-800">{selectedItem?.unidade}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Nível Mínimo:</label>
          <p className="text-gray-800">{selectedItem?.minimo}</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-600">Status:</label>
          <p className="text-gray-800">{selectedItem ? getStatus(selectedItem).texto : 'N/A'}</p>
        </div>
      </ViewModal>

      {/* Modal: Editar Item */}
      <CadastroModal
        isOpen={isEditModalOpen && !!editFormData}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSave}
        title="Editar Item"
        saveText="Salvar Alterações"
      >
        <FormInput
          label="Nome do Item"
          name="nome"
          value={editFormData?.nome || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, nome: e.target.value } : null)}
        />
        <FormInput
          label="Unidade (ex: unidades, pacotes, litros)"
          name="unidade"
          value={editFormData?.unidade || ''}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, unidade: e.target.value } : null)}
        />
        <FormInput
          label="Nível Mínimo (para alertas)"
          name="nivelMinimo"
          type="number"
          value={editFormData?.minimo || 0}
          onChange={(e) => setEditFormData(prev => prev ? { ...prev, minimo: Number(e.target.value) } : null)}
        />
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            A **quantidade** só pode ser alterada registrando uma nova Entrada ou Saída.
          </p>
        </div>
      </CadastroModal>

      {/* Modal: Registrar Entrada/Saída */}
      <CadastroModal
        isOpen={isMovimentacaoModalOpen}
        onClose={() => setIsMovimentacaoModalOpen(false)}
        onSubmit={handleSaveMovimentacao}
        title={movimentacaoForm.tipo === 'Entrada' ? "Registrar Entrada de Insumo" : "Registrar Saída de Insumo"}
        saveText={movimentacaoForm.tipo === 'Entrada' ? "Registrar Entrada" : "Registrar Saída"}
      >
        <div className="space-y-2 mb-4">
          <label className="block text-sm font-semibold text-gray-600">Tipo de Registro</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoMovimentacao"
                value="Entrada"
                checked={movimentacaoForm.tipo === 'Entrada'}
                onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, tipo: e.target.value as 'Entrada' | 'Saída' }))}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              Entrada
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipoMovimentacao"
                value="Saída"
                checked={movimentacaoForm.tipo === 'Saída'}
                onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, tipo: e.target.value as 'Entrada' | 'Saída' }))}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              Saída
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="mov-item" className="block text-sm font-semibold text-gray-600">Item</label>
          <select
            id="mov-item"
            name="item"
            value={movimentacaoForm.itemId}
            onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, itemId: e.target.value }))}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-gray-500"
          >
            <option value="">Selecione um item</option>
            {itensEstoque.map(item => (
              <option key={item.id} value={item.id}>{item.nome}</option>
            ))}
          </select>
        </div>
        <FormInput
          label="Quantidade"
          name="quantidade"
          type="number"
          placeholder="Ex: 300 unidades"
          value={movimentacaoForm.quantidade}
          onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
        />
        <FormInput
          label={movimentacaoForm.tipo === 'Entrada' ? "Data Recebimento" : "Data Retirada"}
          name="data"
          type="date"
          value={movimentacaoForm.data}
          onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, data: e.target.value }))}
        />
      </CadastroModal>

    </div>
  );
}