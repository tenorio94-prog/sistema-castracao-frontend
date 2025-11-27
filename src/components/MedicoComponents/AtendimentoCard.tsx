"use client";

import React from 'react';
import { Calendar, Clock, Stethoscope, User, FileText, ClipboardList, ChevronRight } from 'lucide-react';

export type AtendimentoMedicoUI = {
  id: string;
  petName: string;
  species: string;      
  date: string;
  time: string;
  type: string;         
  veterinarian: string;
  student?: string;
  observations?: string;
  status: 'Agendado' | 'Realizado' | 'Cancelado' | 'Em Andamento';
};

type Props = {
  atendimento: AtendimentoMedicoUI;
  onVerProntuario: (id: string) => void;
  onPreencherFicha: (id: string) => void;
};

export default function AtendimentoCard({ atendimento, onVerProntuario, onPreencherFicha }: Props) {
  const { petName, species, date, time, type, veterinarian, status } = atendimento;

  // Cores de status padronizadas
  const statusColors = {
    'Agendado': 'bg-blue-50 text-blue-700 border-blue-100',
    'Em Andamento': 'bg-amber-50 text-amber-700 border-amber-100',
    'Realizado': 'bg-green-50 text-green-700 border-green-100',
    'Cancelado': 'bg-red-50 text-red-700 border-red-100',
  };

  const currentStatusColor = statusColors[status] || statusColors['Agendado'];

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col md:flex-row gap-6 relative overflow-hidden">
      
      {/* Lateral Decorativa (Tipo ADM) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${status === 'Realizado' ? 'bg-green-500' : 'bg-blue-500'}`}></div>

      {/* Info Principal */}
      <div className="flex gap-5 flex-1">
        <div className="shrink-0 h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
          <User size={24} />
        </div>
        
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-3">
              {petName}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${currentStatusColor}`}>
                {status}
              </span>
            </h3>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{species}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-gray-400" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Stethoscope size={14} className="text-gray-400" />
              <span className="capitalize">{type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 pt-4 md:pt-0 md:pl-6 md:border-l border-gray-100 justify-end">
        <button 
          onClick={() => onVerProntuario(atendimento.id)}
          className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
          title="Ver Prontuário"
        >
          <FileText size={20} />
        </button>
        
        <button 
          onClick={() => onPreencherFicha(atendimento.id)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-sm active:scale-95"
        >
          <ClipboardList size={18} />
          <span>Ficha</span>
        </button>
      </div>
    </div>
  );
}