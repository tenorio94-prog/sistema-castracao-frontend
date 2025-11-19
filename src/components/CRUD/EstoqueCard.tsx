"use client";

import React from 'react';
import { Package, AlertTriangle, CheckCircle, AlertCircle, Edit2, Eye, ArrowRightLeft } from 'lucide-react';

// Tipagem da UI
export type EstoqueItemUI = {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  minimo: number;
};

type EstoqueCardProps = {
  item: EstoqueItemUI;
  onView: (item: EstoqueItemUI) => void;
  onEdit: (item: EstoqueItemUI) => void;
  onMovimentar?: (item: EstoqueItemUI) => void; // Ação específica de estoque
};

export default function EstoqueCard({ item, onView, onEdit, onMovimentar }: EstoqueCardProps) {
  const { nome, quantidade, unidade, minimo } = item;

  // Lógica de Status Visual
  let statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
  let IconStatus = CheckCircle;
  let statusText = 'Normal';

  if (quantidade <= minimo * 0.5) {
    statusColor = 'bg-red-50 text-red-700 border-red-100';
    IconStatus = AlertCircle;
    statusText = 'Crítico';
  } else if (quantidade <= minimo) {
    statusColor = 'bg-amber-50 text-amber-700 border-amber-100';
    IconStatus = AlertTriangle;
    statusText = 'Baixo';
  }

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
      
      {/* Faixa decorativa baseada no status */}
      <div className={`absolute top-0 left-0 w-full h-1 ${quantidade <= minimo ? (quantidade <= minimo * 0.5 ? 'bg-red-500' : 'bg-amber-500') : 'bg-emerald-500'}`}></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600">
            <Package size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1" title={nome}>{nome}</h3>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-0.5">
              Mínimo: {minimo} {unidade}
            </p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor}`}>
          <IconStatus size={10} />
          {statusText}
        </span>
      </div>

      {/* Quantidade em Destaque */}
      <div className="mb-5 grow flex flex-col justify-center items-center bg-gray-50/50 rounded-xl py-4 border border-gray-100">
        <span className="text-3xl font-bold text-gray-900">{quantidade}</span>
        <span className="text-xs font-medium text-gray-500 uppercase">{unidade}</span>
      </div>

      {/* Ações */}
      <div className="grid grid-cols-3 gap-2 mt-auto pt-2">
        <button 
          onClick={() => onView(item)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
          title="Ver Detalhes"
        >
          <Eye size={18} />
        </button>
        <button 
          onClick={() => onEdit(item)}
          className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-slate-900 transition-colors"
          title="Editar Dados"
        >
          <Edit2 size={18} />
        </button>
        {onMovimentar && (
          <button 
            onClick={() => onMovimentar(item)}
            className="flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 transition-colors"
            title="Registrar Movimentação"
          >
            <ArrowRightLeft size={18} />
          </button>
        )}
      </div>
    </div>
  );
}