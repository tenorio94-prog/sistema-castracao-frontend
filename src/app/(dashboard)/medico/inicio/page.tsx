"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

/**
 * Interface para as props do StatCard
 */
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
}

/**
 * Interface para os dados de agendamento
 */
interface Appointment {
  id: number;
  time: string;
  patientName: string;
  details: string;
  procedure: string;
  status: string;
}

/**
 * Interface para as props do AppointmentItem
 */
interface AppointmentItemProps {
  appt: Appointment;
}

/**
 * Componente para o Card de Estatística no topo do dashboard.
 */
const StatCard = ({ title, value, subtitle }: StatCardProps) => (
  <div className="bg-green-600 text-white p-4 rounded-lg shadow">
    <p className="text-sm font-light">{title}</p>
    <p className="text-3xl font-bold my-1">{value}</p>
    <p className="text-xs">{subtitle}</p>
  </div>
);

/**
 * Componente para cada item na lista de agendamentos.
 */
const AppointmentItem = ({ appt }: AppointmentItemProps) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center shadow-sm space-y-4 md:space-y-0 md:space-x-4">
    {/* Horário */}
    <div className="bg-gray-100 text-gray-900 font-bold p-3 rounded-md text-center w-full md:w-24">
      {appt.time}
    </div>

    {/* Informações do Atendimento */}
    <div className="grow">
      <p className="font-bold text-lg text-gray-900">{appt.patientName}</p>
      <p className="text-sm text-gray-600">{appt.details}</p>
      <p className="text-sm text-gray-500">{appt.procedure}</p>
    </div>

    {/* Ações */}
    <div className="flex items-center space-x-3 w-full md:w-auto justify-end shrink-0">
      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
        {appt.status}
      </span>
      <button className="text-green-700 hover:underline font-medium text-sm whitespace-nowrap">
        Ver prontuário
      </button>
      <button className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800 whitespace-nowrap">
        Preencher Ficha
      </button>
    </div>
  </div>
);

/**
 * Página principal do Dashboard.
 */
export default function DashboardPage() {
  const router = useRouter();

  // Dados mocados para simular a API
  const appointments = [
    {
      id: 1,
      time: "09:00",
      patientName: "Luna",
      details: "Cirurgia - Felino",
      procedure: "Castração eletiva - Preparação pré-operatória completa",
      status: "Agendado",
    },
    {
      id: 2,
      time: "09:00",
      patientName: "Luna",
      details: "Cirurgia - Felino",
      procedure: "Castração eletiva - Preparação pré-operatória completa",
      status: "Agendado",
    },
    {
      id: 3,
      time: "09:00",
      patientName: "Luna",
      details: "Cirurgia - Felino",
      procedure: "Castração eletiva - Preparação pré-operatória completa",
      status: "Agendado",
    },
  ];

  const stats = [
    { id: 1, title: "Atendimentos hoje", value: "3", subtitle: "Agendados para hoje" },
    { id: 2, title: "Atendimentos hoje", value: "3", subtitle: "Agendados para hoje" },
    { id: 3, title: "Atendimentos hoje", value: "3", subtitle: "Agendados para hoje" },
    { id: 4, title: "Atendimentos hoje", value: "3", subtitle: "Agendados para hoje" },
  ];

  return (
    <>
      {/* Cabeçalho de Boas-vindas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-700">Bem-vindo, Dr. Salamanca</h1>
        <p className="text-gray-600 mt-1">Sábado, 04 de outubro de 2025</p>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <StatCard 
            key={stat.id}
            title={stat.title} 
            value={stat.value} 
            subtitle={stat.subtitle} 
          />
        ))}
      </div>

      {/* Seção Principal de Atendimentos */}
      <div>
        {/* Título da Seção e Botão de Ação */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Atendimentos hoje</h2>
            <p className="text-gray-600 mt-1">
              Sua agenda de consultas, cirurgias e retornos programados
            </p>
          </div>
          <button
            onClick={() => router.push("/novo-agendamento")} // Ajuste a rota conforme necessário
            className="bg-green-700 text-white px-4 py-2.5 rounded-md font-medium flex items-center justify-center hover:bg-green-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </button>
        </div>

        {/* Lista de Atendimentos */}
        <div className="space-y-4">
          {appointments.map((appt) => (
            <AppointmentItem key={appt.id} appt={appt} />
          ))}
        </div>
      </div>
    </>
  );
}