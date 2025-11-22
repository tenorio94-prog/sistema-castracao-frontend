"use client";

import React from 'react';
import { X, User, Dog, CalendarCheck } from 'lucide-react';
import ViewModal from '@/components/modals/ViewModal';

export type DetalhesData = {
  id: number;
  protocolo: string;
  status: string;
  responsavel: { nome: string; cpf: string; telefone: string; email: string; };
  paciente: { nome: string; especie: string; raca: string; sexo: string; idade: string; peso: string; };
  servico: { procedimento: string; data: string; horario: string; observacoes: string; };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: DetalhesData | null;
  onCancel: (id: number) => void;
  onConfirm: (id: number) => void;
};

// Sub-componente de Bloco de Informação
const InfoBlock = ({ icon, title, children }: any) => (
  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 w-full">
    <div className="flex items-center gap-2 mb-3 text-gray-700">
      <div className="p-1.5 bg-white rounded-md text-gray-500 shadow-sm">{icon}</div>
      <h4 className="text-xs font-bold uppercase tracking-wider">{title}</h4>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm w-full">
      {children}
    </div>
  </div>
);

// Sub-componente de Item de Detalhe (CORRIGIDO)
const DetailItem = ({ label, value, fullWidth = false }: any) => (
  <div className={`${fullWidth ? "col-span-2" : "col-span-1"} min-w-0`}>
    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
      {label}
    </label>
    <p className="font-medium text-gray-800 text-sm break-words leading-snug">
      {value || '-'}
    </p>
  </div>
);

export default function DetalhesConsultaModal({ isOpen, onClose, data, onCancel, onConfirm }: Props) {
  if (!isOpen || !data) return null;

  // Definição de cores do status
  const statusBadgeColor = data.status === 'Pendente' 
    ? 'bg-amber-50 text-amber-700 border-amber-100' 
    : 'bg-green-50 text-green-700 border-green-100';

  return (
    <ViewModal isOpen={isOpen} onClose={onClose} title="Detalhes do Agendamento">
      <div className="space-y-6 w-full">
        
        {/* Header Interno */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Detalhes da Consulta</h3>
            <p className="text-sm text-gray-500 mt-1">Protocolo <span className="font-mono text-gray-700 font-medium">{data.protocolo}</span></p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border tracking-wide whitespace-nowrap ${statusBadgeColor}`}>
            {data.status}
          </span>
        </div>

        {/* Dados Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBlock icon={<User size={18} />} title="RESPONSÁVEL">
            <DetailItem label="Nome" value={data.responsavel.nome} />
            <DetailItem label="CPF" value={data.responsavel.cpf} />
            <DetailItem label="Telefone" value={data.responsavel.telefone} />
            <DetailItem label="Email" value={data.responsavel.email} fullWidth /> {/* Email ocupa linha toda para não quebrar */}
          </InfoBlock>
          
          <InfoBlock icon={<Dog size={18} />} title="PACIENTE">
            <DetailItem label="Nome" value={data.paciente.nome} />
            <DetailItem label="Espécie" value={data.paciente.especie} />
            <DetailItem label="Raça" value={data.paciente.raca} />
            <DetailItem label="Sexo" value={data.paciente.sexo} />
            <DetailItem label="Idade" value={data.paciente.idade} />
            <DetailItem label="Peso" value={data.paciente.peso} />
          </InfoBlock>
        </div>

        {/* Dados do Serviço */}
        <InfoBlock icon={<CalendarCheck size={18} />} title="DADOS DO SERVIÇO">
          <DetailItem label="Procedimento" value={data.servico.procedimento} />
          <DetailItem label="Data" value={data.servico.data} />
          <DetailItem label="Horário" value={data.servico.horario} />
          
          {/* Observações com destaque visual */}
          <div className="col-span-2 mt-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Observações</label>
            <div className="w-full bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-600 leading-relaxed break-words">
              {data.servico.observacoes || 'Nenhuma observação clínica registrada.'}
            </div>
          </div>
        </InfoBlock>

        {/* Rodapé de Ações */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <button 
            onClick={() => onCancel(data.id)} 
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Cancelar Agendamento
          </button>
          <button 
            onClick={() => onConfirm(data.id)} 
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            Confirmar Check-in
          </button>
        </div>
      </div>
    </ViewModal>
  );
}