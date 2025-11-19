// @/components/AtendenteComponents/ModalDetalhesAgendamento.tsx
"use client";

import React from 'react';
import { X, User, Dog, CalendarCheck, AlertCircle } from 'lucide-react';
import { Agendamento } from '@/components/AtendenteComponents/AgendamentoCard'; 

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-3 text-gray-900">
    <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">{icon}</div>
    <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
  </div>
);

const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</span>
    {/* CORREÇÃO AQUI: Alterado 'break-words' para 'break-all' para evitar erros de lint e quebra de layout */}
    <span className="text-sm font-medium text-gray-800 break-all">{value || '—'}</span>
  </div>
);

const formatarData = (dataString: string) => {
  if (dataString && dataString.includes('-') && dataString.length === 10) { 
    const partes = dataString.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataString; 
};

type ModalDetalhesProps = {
  isOpen: boolean;
  agendamento: Agendamento | null;
  onClose: () => void;
  onCheckIn: () => void;
  onCancelAgendamento: () => void;
};

export default function ModalDetalhesAgendamento({
  isOpen,
  agendamento,
  onClose,
  onCheckIn,
  onCancelAgendamento
}: ModalDetalhesProps) {
  
  if (!isOpen || !agendamento) return null;

  const { responsavel, pet, tipo, data, hora, observacoes, status } = agendamento;
  const isPendente = status === 'Pendente';
  
  const statusStyles: { [key: string]: string } = {
    Pendente: 'bg-amber-50 text-amber-700 border-amber-100',
    Concluído: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Confirmado: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  const badgeStyle = statusStyles[status] || 'bg-gray-50 text-gray-700 border-gray-100';

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detalhes do Agendamento</h2>
            <p className="text-sm text-gray-500 mt-1">Protocolo #{agendamento.id}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeStyle}`}>
              {status}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <SectionHeader icon={<User size={16} />} title="Responsável" />
              <div className="space-y-3">
                <DetailItem label="Nome" value={responsavel.nome} />
                <div className="grid grid-cols-2 gap-2">
                  <DetailItem label="CPF" value={responsavel.cpf} />
                  <DetailItem label="Telefone" value={responsavel.telefone} />
                </div>
                <DetailItem label="Email" value={responsavel.email} />
              </div>
            </div>

            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
              <SectionHeader icon={<Dog size={16} />} title="Paciente" />
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Nome" value={pet.name} />
                <DetailItem label="Espécie" value={pet.species} />
                <DetailItem label="Raça" value={pet.breed} />
                <DetailItem label="Sexo" value={pet.gender} />
                <DetailItem label="Idade" value={pet.age} />
                <DetailItem label="Peso" value={pet.weight} />
              </div>
            </div>

            <div className="lg:col-span-2 bg-blue-50/30 p-5 rounded-xl border border-blue-100/50">
              <SectionHeader icon={<CalendarCheck size={16} />} title="Dados do Serviço" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DetailItem label="Procedimento" value={tipo} />
                <DetailItem label="Data" value={formatarData(data)} />
                <DetailItem label="Horário" value={hora} />
              </div>
              {observacoes && (
                <div className="mt-4 pt-4 border-t border-blue-100/50 flex gap-3">
                  <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <DetailItem label="Observações Clínicas" value={observacoes} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelAgendamento}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Cancelar Agendamento
          </button>
          <button
            type="button"
            onClick={onCheckIn}
            disabled={!isPendente}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200"
          >
            Confirmar Check-in
          </button>
        </div>
      </div>
    </div>
  );
}