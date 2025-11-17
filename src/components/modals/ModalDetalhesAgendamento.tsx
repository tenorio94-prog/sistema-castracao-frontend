// @/components/AtendenteComponents/ModalDetalhesAgendamento.tsx
"use client";

import React from 'react';
import { X, User, Dog, ClipboardList } from 'lucide-react';
// Importa os tipos do Card
import { Agendamento } from '../AtendenteComponents/AgendamentoCard'; 

// (Sub-componentes SectionHeader, DetailItem, formatarData... sem alteração)
type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
};
const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title }) => (
  <div className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-4">
    <span className="text-green-600">{icon}</span>
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

type DetailItemProps = {
  label: string;
  value: string | undefined;
};
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
    <p className="text-gray-800">{value || 'N/A'}</p>
  </div>
);

const formatarData = (dataString: string) => {
  if (dataString && dataString.includes('-') && dataString.length === 10) { 
    const partes = dataString.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataString; 
};
// ---------------------------------------------

// --- Props do Modal (ATUALIZADO) ---
type ModalDetalhesProps = {
  isOpen: boolean;
  agendamento: Agendamento | null;
  onClose: () => void;
  onCheckIn: () => void;
  // onEdit: () => void; // <-- REMOVIDO
  onCancelAgendamento: () => void;
};

export default function ModalDetalhesAgendamento({
  isOpen,
  agendamento,
  onClose,
  onCheckIn,
  // onEdit, // <-- REMOVIDO
  onCancelAgendamento
}: ModalDetalhesProps) {
  
  if (!isOpen || !agendamento) {
    return null;
  }

  const { responsavel, pet, tipo, data, hora, observacoes, status } = agendamento;
  const isPendente = status === 'Pendente';
  
  const statusStyles: { [key: string]: string } = {
    Pendente: 'bg-blue-100 text-blue-800',
    Concluído: 'bg-gray-100 text-gray-800',
    Confirmado: 'bg-green-100 text-green-800',
  };
  const badgeStyle = statusStyles[status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="fixed inset-0 bg-white/75 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
      
      <div 
        className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl border border-gray-200"
      >
        {/* (Cabeçalho - sem alteração) */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Detalhes do Agendamento</h2>
            <p className="text-gray-500 mt-1">Visualise e gerencie informações importantes do agendamento</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
              {status}
            </span>
            <button 
              type="button" 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* (Corpo - Seções 1, 2, 3 - sem alteração) */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <SectionHeader icon={<User size={20} />} title="Informações do Responsável" />
              <div className="space-y-3">
                <DetailItem label="Nome Completo" value={responsavel.nome} />
                <DetailItem label="CPF" value={responsavel.cpf} />
                <DetailItem label="Telefone" value={responsavel.telefone} />
                <DetailItem label="Email" value={responsavel.email} />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <SectionHeader icon={<Dog size={20} />} title="Informações do Animal" />
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Nome" value={pet.name} />
                <DetailItem label="Espécie" value={pet.species} />
                <DetailItem label="Raça" value={pet.breed} />
                <DetailItem label="Idade" value={pet.age} />
                <DetailItem label="Peso" value={pet.weight} />
                <DetailItem label="Sexo" value={pet.gender} />
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <SectionHeader icon={<ClipboardList size={20} />} title="Informações do Agendamento" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DetailItem label="Serviço Agendado" value={tipo} />
              <DetailItem label="Data" value={formatarData(data)} />
              <DetailItem label="Horário" value={hora} />
            </div>
            <div className="mt-4">
              <DetailItem label="Observações" value={observacoes} />
            </div>
          </div>

          {/* --- Seção 4: Ações (ATUALIZADO) --- */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações do Agendamento</h3>
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Botão de Editar REMOVIDO daqui */}
              
              <button
                type="button"
                onClick={onCancelAgendamento}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onCheckIn}
                disabled={!isPendente}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors
                           disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Confirmar Check-in
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}