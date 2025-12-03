"use client";

import React from 'react';
import AgendamentosSection from '@/components/AdmComponents/AgendamentoSection';

export default function PaginaAgendamentosAdm() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Seção: Lista e Gestão de Agendamentos */}
      <AgendamentosSection />
    </div>
  );
}