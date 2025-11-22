"use client";

import React from "react";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NovoAgendamentoPage() {
  const router = useRouter();

  return (
    <>
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-green-700 hover:underline mb-6 font-medium"
      >
        <ChevronLeft className="mr-1 w-4 h-4" />
        Voltar
      </button>

      {/* Título */}
      <h1 className="text-3xl font-bold text-green-700">Novo Agendamento</h1>
      <p className="text-gray-600 mt-1 mb-8">
        Agende uma consulta, cirurgia ou retorno para um paciente.
      </p>

      {/* FORMULÁRIO (como no dashboard, sem centralizar) */}
      <form className="space-y-6 max-w-4xl">
        
        {/* Animal */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Animal *
          </label>
          <select className="border border-gray-300 rounded-md p-3 w-full">
            <option>Selecione o animal</option>
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tipo de Atendimento *
          </label>
          <select className="border border-gray-300 rounded-md p-3 w-full">
            <option>Selecione o tipo</option>
          </select>
        </div>

        {/* Data + Hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Data *
            </label>
            <div className="flex items-center px-3 border border-gray-300 rounded-md">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <input type="date" className="py-2.5 bg-transparent w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Horário *
            </label>
            <div className="flex items-center px-3 border border-gray-300 rounded-md">
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <input type="time" className="py-2.5 bg-transparent w-full" />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            rows={4}
            className="border border-gray-300 rounded-md p-3 w-full"
            placeholder="Informações adicionais"
          ></textarea>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 px-6 py-2.5 rounded-md"
          >
            Cancelar
          </button>

          <button className="bg-green-700 text-white px-6 py-2.5 rounded-md">
            Criar Agendamento
          </button>
        </div>
      </form>
    </>
  );
}
