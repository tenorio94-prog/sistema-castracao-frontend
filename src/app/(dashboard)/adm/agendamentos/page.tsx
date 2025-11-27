"use client";

import React from 'react';
import AgendamentosSection from '@/components/AdmComponents/AgendamentoSection';
import DisponibilidadeSection from '@/components/AdmComponents/DisponibilidadeSection';

export default function PaginaAgendamentosAdm() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Seção 1: Lista e Gestão de Agendamentos */}
      <AgendamentosSection />

      {/* Seção 2: Calendário de Disponibilidade */}
      <DisponibilidadeSection />
    </div>
  );
}