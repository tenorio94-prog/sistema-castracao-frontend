"use client";

import React from 'react';
import { Calendar, Clock, Stethoscope, User, FileText, ClipboardList, GraduationCap } from 'lucide-react';

export type AtendimentoMedicoUI = {
  id: string;
  petName: string;
  species: string;      // Ex: "Felino - Raça"
  date: string;
  time: string;
  type: string;         // Ex: "cirurgia", "consulta"
  veterinarian: string;
  student?: string;
  observations?: string;
  status: 'Agendado' | 'Realizado' | 'Cancelado';
};

type Props = {
  atendimento: AtendimentoMedicoUI;
  onVerProntuario: (id: string) => void;
  onPreencherFicha: (id: string) => void;
};

export default function AtendimentoCard({ atendimento, onVerProntuario, onPreencherFicha }: Props) {
  const { petName, species, date, time, type, veterinarian, student, observations, status } = atendimento;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-200 flex flex-col gap-6">
      
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Lado Esquerdo: Identificação do Paciente */}
        <div className="flex gap-5">
          {/* Avatar do Pet */}
          <div className="shrink-0 h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
            <User size={32} />
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">{petName}</h3>
              <p className="text-sm font-medium text-gray-500">{species}</p>
            </div>
            
            {/* Metadados com Ícones */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={16} className="text-green-700" />
                <span className="font-medium">Data: <span className="font-normal text-gray-600">{date}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock size={16} className="text-green-700" />
                <span className="font-medium">Horário: <span className="font-normal text-gray-600">{time}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Stethoscope size={16} className="text-green-700" />
                <span className="font-medium">Tipo: <span className="font-normal text-gray-600 capitalize">{type}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Informações Clínicas e Status */}
        <div className="flex flex-col items-start md:items-end gap-2 flex-1">
          {/* Badge de Status */}
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-100 mb-2">
            {status}
          </span>

          <div className="text-sm space-y-1 text-right">
            <p className="text-gray-600">
              <span className="text-green-700 font-semibold mr-1">Veterinário:</span> 
              {veterinarian}
            </p>
            {student && (
              <p className="text-gray-600 flex items-center justify-end gap-1">
                 <span className="text-green-700 font-semibold">Estudante:</span> 
                 {student}
              </p>
            )}
          </div>

          {observations && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 max-w-md w-full text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Observações</p>
              <p className="text-xs text-gray-700 leading-relaxed">{observations}</p>
            </div>
          )}
        </div>
      </div>

      {/* Rodapé: Botões de Ação */}
      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
        <button 
          onClick={() => onVerProntuario(atendimento.id)}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 active:scale-95"
        >
          <FileText size={18} />
          Ver Prontuário
        </button>
        
        <button 
          onClick={() => onPreencherFicha(atendimento.id)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 rounded-xl text-sm font-bold transition-all active:scale-95"
        >
          <ClipboardList size={18} />
          Preencher Ficha
        </button>
      </div>

    </div>
  );
}