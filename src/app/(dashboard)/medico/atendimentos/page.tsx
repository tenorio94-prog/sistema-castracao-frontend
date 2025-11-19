"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  StethoscopeIcon,
  User,
} from "lucide-react";

export default function AtendimentosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("todos");

  // Dados mocados para o card. Em um app real, isso viria de uma API.
  const appointmentData = {
    animalName: "Ana",
    species: "Felino - Raça",
    date: "20/10/2025",
    time: "09:00h",
    type: "cirurgia",
    vet: "Dr. House",
    student: "Emanuel Rodrigues",
    observations: "Castração eletiva - Preparação pré-operatória completa",
  };

  /**
   * Componente interno para o Card de Agendamento,
   * para evitar repetição de código.
   */
  const AppointmentCard = ({ data }: { data: typeof appointmentData }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        
        {/* Lado Esquerdo: Informações do Animal */}
        <div className="flex gap-4 items-start">
          <div className="shrink-0 bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{data.animalName}</h3>
            <p className="text-sm text-gray-500 mb-3">{data.species}</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <strong>Data:</strong> {data.date}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <strong>Horário:</strong> {data.time}
              </li>
              <li className="flex items-center gap-2">
                <StethoscopeIcon className="w-4 h-4 text-gray-500" />
                <strong>Tipo:</strong> {data.type}
              </li>
            </ul>
          </div>
        </div>

        {/* Lado Direito: Detalhes do Atendimento */}
        <div className="flex flex-col items-start md:items-end justify-between gap-4">
          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 border border-blue-300 rounded-full">
            Agendado
          </span>
          <div className="text-left md:text-right text-sm text-gray-700">
            <p>
              <strong>Veterinário:</strong> {data.vet}
            </p>
            <p>
              <strong>Estudante:</strong> {data.student}
            </p>
            <div className="mt-2">
              <strong className="block">Observações:</strong>
              <p className="text-gray-600">{data.observations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Botões de Ação */}
      <div className="border-t border-gray-200 mt-5 pt-4 flex flex-wrap gap-3">
        <button className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800">
          Ver Prontuário
        </button>
        <button className="bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50">
          Preencher Ficha
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Título */}
      <h1 className="text-3xl font-bold text-green-700">Atendimentos</h1>
      <p className="text-gray-600 mt-1 mb-8">
        Gerencie sua agenda de consultas, cirurgias e retornos
      </p>

      {/* Toolbar: Busca e Novo Agendamento */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome do animal"
          className="border border-gray-300 rounded-md py-2.5 px-4 w-full md:w-1/3"
        />
        <button
          onClick={() => router.push("/medico/atendimentos/novo")} // Ajuste a rota se necessário
          className="bg-green-700 text-white px-5 py-2.5 rounded-md font-medium w-full md:w-auto"
        >
          Novo Agendamento
        </button>
      </div>

      {/* Tabs de Filtro */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("todos")}
          className={`py-2 px-5 rounded-md text-sm font-medium ${
            activeTab === "todos"
              ? "bg-green-700 text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveTab("cirurgias")}
          className={`py-2 px-5 rounded-md text-sm font-medium ${
            activeTab === "cirurgias"
              ? "bg-green-700 text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Cirurgias
        </button>
        <button
          onClick={() => setActiveTab("consultas")}
          className={`py-2 px-5 rounded-md text-sm font-medium ${
            activeTab === "consultas"
              ? "bg-green-700 text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Consultas
        </button>
        <button
          onClick={() => setActiveTab("retornos")}
          className={`py-2 px-5 rounded-md text-sm font-medium ${
            activeTab === "retornos"
              ? "bg-green-700 text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Retornos
        </button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="space-y-6">
        {/* Aqui você faria um .map() nos seus dados filtrados.
          Estou renderizando o card duas vezes estaticamente para bater com a imagem.
        */}
        <AppointmentCard data={appointmentData} />
        <AppointmentCard data={appointmentData} />
      </div>
    </>
  );
}