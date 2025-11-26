"use client";

import React from 'react';
import { Calendar, Clock, Dog, Stethoscope, ChevronRight, MapPin } from 'lucide-react';

export type ConsultaResponsavelUI = {
  id: string;
  title: string;        // Ex: "Consulta de Rotina", "Cirurgia"
  petName: string;
  date: string;         // Ex: "DD/MM/YYYY"
  time: string;
  veterinarian: string;
  clinic?: string;      // Opcional: Unidade/Clínica
  status: 'Agendado' | 'Concluído' | 'Cancelado' | 'Em Andamento';
};

type Props = {
  consulta: ConsultaResponsavelUI;
  onDetalhes: (consulta: ConsultaResponsavelUI) => void;
};

export default function ConsultaCard({ consulta, onDetalhes }: Props) {
  const { title, petName, date, time, veterinarian, status, clinic } = consulta;

  const statusStyles = {
    'Agendado': 'bg-blue-50 text-blue-700 border-blue-100',
    'Concluído': 'bg-gray-100 text-gray-600 border-gray-200',
    'Em Andamento': 'bg-green-50 text-green-700 border-green-100',
    'Cancelado': 'bg-red-50 text-red-700 border-red-100',
  };

  const currentStatusStyle = statusStyles[status] || statusStyles['Agendado'];
  const [dayMonth, year] = date.split('/').slice(0, 2);

  return (
    <div className="group flex flex-col md:flex-row bg-white border border-gray-200 rounded-2xl p-0 transition-all duration-300 hover:shadow-lg hover:border-green-200 overflow-hidden">
      
      {/* Bloco Esquerdo: Data */}
      <div className="flex flex-row md:flex-col items-center justify-between md:justify-center min-w-[90px] md:w-28 bg-gray-50 p-4 group-hover:bg-green-50/30 transition-colors">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 hidden md:block">Data</span>
          <span className="text-xl font-bold text-gray-900 leading-none">{dayMonth}</span>
          <span className="text-xs font-semibold text-gray-500 mt-1">{date.split('/')[2]}</span>
        </div>
        <div className="md:hidden">
           <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${currentStatusStyle}`}>
             {status}
           </span>
        </div>
      </div>

      {/* Bloco Central: Informações */}
      <div className="flex-1 p-5 flex flex-col justify-center gap-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-800 transition-colors">
            {title}
          </h3>
          <span className={`hidden md:inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border tracking-wide ${currentStatusStyle}`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Dog size={16} className="text-gray-400" />
            <span>Pet: <strong className="text-gray-800">{petName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span>Horário: <strong className="text-gray-800">{time}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope size={16} className="text-gray-400" />
            <span className="truncate">{veterinarian}</span>
          </div>
          {clinic && (
             <div className="flex items-center gap-2">
               <MapPin size={16} className="text-gray-400" />
               <span className="truncate">{clinic}</span>
             </div>
          )}
        </div>
      </div>

      {/* Bloco Direito: Ação */}
      <div className="flex items-center justify-end md:justify-center p-4 md:p-5 md:w-auto border-t md:border-t-0 border-gray-100 md:border-none bg-white">
        <button 
          onClick={() => onDetalhes(consulta)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:border-green-200 hover:text-green-700 hover:bg-green-50 transition-all active:scale-95 shadow-sm"
        >
          Detalhes
          <ChevronRight size={16} className="text-gray-400 group-hover:text-green-600" />
        </button>
      </div>
    </div>
  );
}