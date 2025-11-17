"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FichaAnestesica() {
  const router = useRouter();

  return (
    <div className="w-full p-6">
      
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-green-700 hover:underline mb-6"
      >
        <ChevronLeft className="mr-1 w-4 h-4" />
        Voltar
      </button>

      {/* Título */}
      <h1 className="text-3xl font-bold text-green-700">Fichas Anestésicas</h1>
      <p className="text-gray-600 mt-1 mb-8">
        Registros de protocolos anestésicos e monitoramento
      </p>

      {/* Botão Nova Ficha */}
      <div className="flex justify-end mb-6">
        <button className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition">
          Nova Ficha
        </button>
      </div>

      {/* CARD DA FICHA */}
      <div className="border border-green-600 rounded-lg p-6">

        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-green-700">
              Ficha Anestésica #es-1
            </h2>
            <p className="text-gray-600 text-sm">27/09/2025</p>
          </div>

          {/* Badge */}
          <span className="border border-yellow-400 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
            Aguardando Validação
          </span>
        </div>

        {/* Conteúdo */}
        <div className="text-gray-700 space-y-4">
          <div>
            <h3 className="font-semibold">Protocolo Anestésico</h3>
            <p>Anestesia balanceada</p>
          </div>

          <div>
            <h3 className="font-semibold">Pré-Medicação</h3>
            <p>Acepromazina 0,05mg/kg + Metadona 0,3mg/kg IM</p>
          </div>

          <div>
            <h3 className="font-semibold">Indução</h3>
            <p>Propofol 4mg/kg IV até efeito</p>
          </div>

          <div>
            <h3 className="font-semibold">Manutenção</h3>
            <p>
              Isoflurano em O2 100%, manutenção em plano anestésico adequado
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Monitoramento</h3>
            <p>
              FC: 80-100 bpm, FR: 12-16 mpm, SpO2: 98-100%, Temperatura: 37.5-38°C,
              Pressão arterial: PAM 70-90 mmHg
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Recuperação</h3>
            <p>
              Recuperação tranquila, extubação após reflexo de deglutição, animal
              alerta em 15 minutos
            </p>
          </div>

          <p className="text-green-700 text-sm pt-2">
            <strong>Preenchido por:</strong> João Santos
          </p>
        </div>

        <hr className="my-4" />

        {/* Botões */}
        <div className="flex justify-end gap-3">
          <button className="border border-green-700 text-green-700 px-6 py-2 rounded-md hover:bg-green-50 transition">
            Editar
          </button>

          <button className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition">
            Validade Ficha
          </button>
        </div>
      </div>
    </div>
  );
}
