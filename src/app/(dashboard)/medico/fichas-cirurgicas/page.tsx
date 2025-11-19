"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function FichasCirurgicasPage() {
  const router = useRouter();

  // Dados de exemplo — substitua depois pelo Firestore
  const ficha = {
    id: "#rg-1",
    data: "27/09/2025",
    status: "Aguardando Validação",
    statusColor: "bg-yellow-100 text-yellow-700 border-yellow-400",
    preenchidoPor: "João Santos",
  };

  return (
    <>
      {/* BOTÃO VOLTAR */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-green-700 hover:underline mb-6 font-medium"
      >
        <ChevronLeft className="mr-1 w-4 h-4" />
        Voltar
      </button>

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold text-green-700">Fichas Cirúrgicas</h1>
      <p className="text-gray-600 mt-1 mb-8">
        Registros de procedimentos cirúrgicos realizados
      </p>

      {/* BOTÃO NOVA FICHA */}
      <div className="flex justify-end mb-6">
        <button className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition">
          Nova Ficha
        </button>
      </div>

      {/* CARD DA FICHA */}
      <div className="border border-green-300 rounded-xl p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-green-700">
              Ficha Cirúrgica {ficha.id}
            </h2>
            <p className="text-gray-600 text-sm">{ficha.data}</p>
          </div>

          <span
            className={`border px-3 py-1 rounded-full text-sm ${ficha.statusColor}`}
          >
            {ficha.status}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="text-gray-700 space-y-4">
          <div>
            <h3 className="font-semibold">Tipo de Cirurgia</h3>
            <p>Ovariohisterectomia (OSH) – Castração</p>
          </div>

          <div>
            <h3 className="font-semibold">Avaliação Pré–Operatória</h3>
            <p>Animal hígido, jejum adequado, exames pré-operatórios normais</p>
          </div>

          <div>
            <h3 className="font-semibold">Procedimento Realizado</h3>
            <p>Nenhuma intercorrência</p>
          </div>

          <div>
            <h3 className="font-semibold">Complicações</h3>
            <p>Nenhuma intercorrência</p>
          </div>

          <div>
            <h3 className="font-semibold">Cuidados Pós–Operatórios</h3>
            <p>
              Analgesia multimodal (Dipirona + Tramadol), Meloxicam 0,1mg/kg SID
              por 5 dias, uso de colar elizabetano, retorno em 10 dias para
              retirada de pontos
            </p>
          </div>

          {/* Rodapé */}
          <div className="pt-4 text-sm text-green-700 space-y-1">
            <p>
              <strong>Preenchido por:</strong> {ficha.preenchidoPor}
            </p>
          </div>
        </div>

        <hr className="my-4" />

        {/* BOTÕES */}
        <div className="flex justify-end gap-3">
          <button className="border border-gray-400 px-6 py-2 rounded-md hover:bg-gray-100 transition">
            Editar
          </button>

          <button className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition">
            Valorar Ficha
          </button>
        </div>
      </div>
    </>
  );
}
