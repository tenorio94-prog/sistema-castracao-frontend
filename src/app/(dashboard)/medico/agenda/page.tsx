"use client";

import React, { useState } from "react";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NovoAgendamentoPage() {
  const router = useRouter();

  // Estados simulando o formulário
  const [animal, setAnimal] = useState("");
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [obs, setObs] = useState("");

  return (
    <div className="p-6">
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-green-700 hover:underline mb-6"
      >
        <ChevronLeft className="mr-1 w-4 h-4" />
        Voltar
      </button>

      {/* Container do Formulário */}
      <div className="border border-green-300 rounded-lg p-6 bg-white max-w-4xl mx-auto shadow-sm">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-green-700">
            Novo Agendamento
          </h1>
          <p className="text-sm text-gray-600">
            Agende uma consulta, cirurgia ou retorno para um paciente
          </p>
        </div>

        {/* Campo Animal */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Animal*
          </label>
          <select
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            <option value="">Selecione o animal</option>
            <option value="Luna">Luna</option>
            <option value="Thor">Thor</option>
            <option value="Simba">Simba</option>
          </select>
        </div>

        {/* Campo Tipo de Atendimento */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Atendimento*
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            <option value="">Selecione o tipo</option>
            <option value="Consulta">Consulta</option>
            <option value="Cirurgia">Cirurgia</option>
            <option value="Retorno">Retorno</option>
          </select>
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data*
            </label>
            <div className="flex items-center border rounded-md px-2">
              <Calendar className="text-gray-400 w-4 h-4 mr-2" />
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full py-2 bg-transparent text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horário*
            </label>
            <div className="flex items-center border rounded-md px-2">
              <Clock className="text-gray-400 w-4 h-4 mr-2" />
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full py-2 bg-transparent text-gray-700 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações:
          </label>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Adicione informações sobre o agendamento"
            rows={4}
            className="w-full border rounded-md p-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => alert("Agendamento criado com sucesso!")}
            className="bg-green-700 text-white px-5 py-2 rounded-md hover:bg-green-800 transition-colors"
          >
            Criar Agendamento
          </button>
        </div>
      </div>
    </div>
  );
}
