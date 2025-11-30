"use client"; 

import React, { useEffect, useState } from 'react';
import { 
  Archive, 
  AlertTriangle, 
  Siren, 
  ArrowRightLeft 
} from "lucide-react";
import { toast } from 'sonner';

import CrudHeader from '@/components/CRUD/CrudHeader';
import CrudDisplay, { ColumnDefinition } from '@/components/CRUD/CrudDisplayAdm';
import CardBaseDash from '@/components/Dashboard/CardBaseDash';
import EstoqueCard, { EstoqueItemUI } from '@/components/CRUD/EstoqueCard';
import CadastroModal from '@/components/modals/CadastroModal';
import ViewModal from '@/components/modals/ViewModal';
import FormInput from '@/components/forms/FormInput'; 

// --- TIPOS ---
type EstoqueItem = EstoqueItemUI; // Reutilizando do Card

type ItemForm = Omit<EstoqueItem, 'id' | 'quantidade'>;

type MovimentacaoForm = {
  tipo: 'Entrada' | 'Saída';
  itemId: string;
  quantidade: number;
  data: string;
};

const emptyMovimentacaoForm: MovimentacaoForm = { tipo: 'Entrada', itemId: '', quantidade: 0, data: '' };

// --- MOCK SERVICE ---
const MOCK_DB: EstoqueItem[] = [
  { id: '1', nome: 'Luvas Cirúrgicas P', quantidade: 500, unidade: 'unidades', minimo: 200 },
  { id: '2', nome: 'Luvas Cirúrgicas M', quantidade: 45, unidade: 'unidades', minimo: 50 },
  { id: '3', nome: 'Seringa 5ml', quantidade: 15, unidade: 'unidades', minimo: 30 },
  { id: '4', nome: 'Gaze Estéril', quantidade: 500, unidade: 'pacotes', minimo: 200 },
  { id: '5', nome: 'Álcool 70% 1L', quantidade: 500, unidade: 'litros', minimo: 200 },
];

const MockStockService = {
  getAll: async (): Promise<EstoqueItem[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_DB]), 600));
  },
  // Simula update apenas em memória local no componente pai via state
};

// Badge de Status para Tabela
const StatusBadge: React.FC<{ item: EstoqueItem }> = ({ item }) => {
  if (item.quantidade <= item.minimo * 0.5) {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-100 tracking-wider">Crítico</span>;
  }
  if (item.quantidade <= item.minimo) {
    return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-100 tracking-wider">Baixo</span>;
  }
  return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wider">Normal</span>;
};

export default function PaginaEstoque() {
  // --- ESTADOS ---
  const [itensEstoque, setItensEstoque] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modais
  const [isMovimentacaoModalOpen, setIsMovimentacaoModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [movimentacaoForm, setMovimentacaoForm] = useState<MovimentacaoForm>(emptyMovimentacaoForm);
  const [selectedItem, setSelectedItem] = useState<EstoqueItem | null>(null);
  const [editFormData, setEditFormData] = useState<ItemForm | null>(null);

  // --- LOADERS ---
  useEffect(() => {
    setLoading(true);
    MockStockService.getAll().then(data => {
      setItensEstoque(data);
      setLoading(false);
    });
  }, []);

  // --- CÁLCULOS DE KPI ---
  const totalItens = itensEstoque.length;
  const totalBaixo = itensEstoque.filter(i => i.quantidade <= i.minimo && i.quantidade > i.minimo * 0.5).length;
  const totalCritico = itensEstoque.filter(i => i.quantidade <= i.minimo * 0.5).length;

  // --- HANDLERS ---
  const handleOpenMovimentacao = (itemPreSelected?: EstoqueItem) => {
    setMovimentacaoForm({
      ...emptyMovimentacaoForm,
      itemId: itemPreSelected ? itemPreSelected.id : '',
      data: new Date().toISOString().split('T')[0] // Data de hoje
    });
    setIsMovimentacaoModalOpen(true);
  };

  const handleView = (item: EstoqueItem) => { setSelectedItem(item); setIsViewModalOpen(true); };

  const handleEdit = (item: EstoqueItem) => {
    setEditFormData({ nome: item.nome, unidade: item.unidade, minimo: item.minimo });
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de lógica de negócio
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
    toast.success('Movimentação registrada com sucesso!');
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
    setIsEditModalOpen(false); setSelectedItem(null);
    toast.success('Item atualizado com sucesso!');
  };

  // --- COLUNAS DA TABELA ---
  const columns: ColumnDefinition<EstoqueItem>[] = [
    { header: 'Item', cell: (item) => <span className="font-bold text-gray-900">{item.nome}</span> },
    { header: 'Quantidade', cell: (item) => <span className="font-mono text-gray-700">{item.quantidade}</span> },
    { header: 'Unidade', cell: (item) => <span className="text-gray-600 text-xs uppercase">{item.unidade}</span> },
    { header: 'Mínimo', cell: (item) => <span className="text-gray-500">{item.minimo}</span> },
    { header: 'Status', cell: (item) => <StatusBadge item={item} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <CrudHeader 
        title="Gestão de Estoque"
        description="Controle de insumos, medicamentos e materiais da clínica."
        buttonText="Registrar Movimentação"
        onButtonClick={() => handleOpenMovimentacao()}
      />

      {/* Cards de Status (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardBaseDash
          title="Total de Itens"
          value={totalItens}
          subtitle="Produtos cadastrados"
          icon={Archive}
          color="blue"
        />
        <CardBaseDash
          title="Estoque Baixo"
          value={totalBaixo}
          subtitle="Abaixo do mínimo"
          icon={AlertTriangle}
          color="indigo" // Amarelo/Laranja visualmente tratado no componente pelo tema ou cor custom
        />
        <CardBaseDash
          title="Estoque Crítico"
          value={totalCritico}
          subtitle="Risco de falta"
          icon={Siren}
          color="purple" // Representando urgência
        />
      </div>

      {/* Tabela / Grid */}
      <CrudDisplay<EstoqueItem>
        data={itensEstoque}
        columns={columns}
        searchPlaceholder="Buscar por nome do item..."
        emptyMessage="Nenhum item no estoque."
        isLoading={loading}
        onView={handleView}
        onEdit={handleEdit}
        // Delete omitido propositalmente para estoque (geralmente inativa-se)
        
        // Grid View
        renderGrid={(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <EstoqueCard
                key={item.id}
                item={item}
                onView={handleView}
                onEdit={handleEdit}
                onMovimentar={() => handleOpenMovimentacao(item)}
              />
            ))}
          </div>
        )}
      />

      {/* --- MODAL VIEW --- */}
      <ViewModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Detalhes: ${selectedItem?.nome}`}>
        <div className="space-y-4">
           <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
             <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
               <Archive size={32} />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">{selectedItem?.nome}</h3>
               <div className="mt-1"><StatusBadge item={selectedItem!} /></div>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-3 rounded-lg">
               <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Quantidade Atual</label>
               <p className="text-2xl font-bold text-gray-900">{selectedItem?.quantidade}</p>
             </div>
             <div className="bg-gray-50 p-3 rounded-lg">
               <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Nível Mínimo</label>
               <p className="text-2xl font-bold text-gray-500">{selectedItem?.minimo}</p>
             </div>
           </div>
           <div>
             <label className="text-xs font-bold text-gray-400 uppercase">Unidade de Medida</label>
             <p className="font-medium text-gray-900">{selectedItem?.unidade}</p>
           </div>
        </div>
      </ViewModal>

      {/* --- MODAL EDIT --- */}
      <CadastroModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSave} title="Editar Item" saveText="Salvar">
        <FormInput label="Nome do Item" name="nome" value={editFormData?.nome || ''} onChange={(e) => setEditFormData(prev => prev ? {...prev, nome: e.target.value} : null)} />
        <div className="grid grid-cols-2 gap-4">
           <FormInput label="Unidade" name="unidade" value={editFormData?.unidade || ''} onChange={(e) => setEditFormData(prev => prev ? {...prev, unidade: e.target.value} : null)} />
           <FormInput label="Estoque Mínimo" name="minimo" type="number" value={editFormData?.minimo || 0} onChange={(e) => setEditFormData(prev => prev ? {...prev, minimo: Number(e.target.value)} : null)} />
        </div>
        <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start">
          <ArrowRightLeft className="text-blue-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-blue-700">
            Para alterar a <strong>quantidade</strong>, utilize a função "Registrar Movimentação" no painel principal.
          </p>
        </div>
      </CadastroModal>

      {/* --- MODAL MOVIMENTAÇÃO --- */}
      <CadastroModal isOpen={isMovimentacaoModalOpen} onClose={() => setIsMovimentacaoModalOpen(false)} onSubmit={handleSaveMovimentacao} title="Registrar Movimentação" saveText="Confirmar">
        <div className="space-y-4">
           {/* Toggle Entrada/Saída */}
           <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <label className={`cursor-pointer flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${movimentacaoForm.tipo === 'Entrada' ? 'bg-white text-green-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
                <input type="radio" name="tipo" value="Entrada" checked={movimentacaoForm.tipo === 'Entrada'} onChange={() => setMovimentacaoForm(prev => ({...prev, tipo: 'Entrada'}))} className="hidden" />
                Entrada (+Item)
              </label>
              <label className={`cursor-pointer flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${movimentacaoForm.tipo === 'Saída' ? 'bg-white text-red-700 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
                <input type="radio" name="tipo" value="Saída" checked={movimentacaoForm.tipo === 'Saída'} onChange={() => setMovimentacaoForm(prev => ({...prev, tipo: 'Saída'}))} className="hidden" />
                Saída (-Item)
              </label>
           </div>

           <div className="space-y-1">
             <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Item Selecionado</label>
             <select 
               className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900"
               value={movimentacaoForm.itemId}
               onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, itemId: e.target.value }))}
               required
             >
               <option value="">Selecione um item...</option>
               {itensEstoque.map(item => (
                 <option key={item.id} value={item.id}>{item.nome} (Atual: {item.quantidade})</option>
               ))}
             </select>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <FormInput label="Quantidade" name="quantidade" type="number" value={movimentacaoForm.quantidade} onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, quantidade: Number(e.target.value) }))} required min={1} />
              <FormInput label="Data" name="data" type="date" value={movimentacaoForm.data} onChange={(e) => setMovimentacaoForm(prev => ({ ...prev, data: e.target.value }))} required />
           </div>
        </div>
      </CadastroModal>

    </div>
  );
}