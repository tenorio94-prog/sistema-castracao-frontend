"use client";

import React from "react";
import CardBaseDash from "@/components/Dashboard/CardBaseDash";
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CargaTrabalhoChart from "@/components/Dashboard/CargaTrabalhoGrafico";
// Importando ícones. Note o 'Stethoscope' para cirurgias.
import { Calendar, Dog, Users, Building2, Activity, Stethoscope } from "lucide-react";

export default function AdminPage(){
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <PageHeader 
        title="Dashboard Administrativo"
        description="Visão geral de desempenho e métricas da clínica."
      />

      {/* Grid de Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <CardBaseDash
          title="Consultas Hoje"
          value={150}
          subtitle="Agendadas para hoje"
          icon={Calendar}
          color="blue"
          trend="+12% vs ontem"
        />

        <CardBaseDash
          title="Cirurgias (Mês)"
          value={75}
          subtitle="Realizadas em Novembro"
          icon={Activity}
          color="purple"
        />

        <CardBaseDash
          title="Novos Animais"
          value={20}
          subtitle="Cadastrados este mês"
          icon={Dog}
          color="green"
          trend="+5 novos"
        />

        <CardBaseDash
          title="Parceiros (ONGs)"
          value={8}
          subtitle="Instituições ativas"
          icon={Building2}
          color="indigo"
        />

        {/* Substituição Realizada: Faturamento -> Total de Cirurgias */}
        <CardBaseDash
          title="Total de Cirurgias"
          value={842}
          subtitle="Acumulado do Ano"
          icon={Stethoscope}
          color="purple" // Roxo para indicar procedimento médico/cirúrgico
        />

        <CardBaseDash
          title="Base de Usuários"
          value={340}
          subtitle="Tutores registrados"
          icon={Users}
          color="blue"
        />
      </section>

      {/* Seção do Gráfico com estilo unificado */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Produtividade da Equipe</h3>
          <p className="text-sm text-gray-500">Comparativo de consultas e procedimentos por profissional.</p>
        </div>
        
        {/* Altura fixa para o gráfico renderizar corretamente */}
        <div className="w-full h-[350px]">
          <CargaTrabalhoChart />
        </div>
      </section>  
    </div>
  );
}