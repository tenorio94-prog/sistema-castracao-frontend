"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FichasClinicasPage() {
  const router = useRouter();

  const fichas = [
    {
      id: "#ec-1",
      data: "27/09/2025",
      status: "Aguardando Validação",
      statusColor: "bg-yellow-100 text-yellow-700 border-yellow-400",
      preenchidoPor: "João Santos",
      validadoPor: null,
    },
    {
      id: "#ec-1",
      data: "27/09/2025",
      status: "Validada",
      statusColor: "bg-green-100 text-green-700 border-green-400",
      preenchidoPor: "João Santos",
      validadoPor: "Dr. Ana Silva",
    },
  ];

  return (
    <>
      {/* VOLTAR */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-green-700 hover:underline mb-6 font-medium"
      >
        <ChevronLeft className="mr-1 w-4 h-4" />
        Voltar
      </button>

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold text-green-700">Fichas Clínicas</h1>
      <p className="text-gray-600 mt-1 mb-8">
        Registros de consultas e avaliações clínicas
      </p>

      {/* BOTÃO NOVA FICHA */}
      <div className="flex justify-end mb-6">
        <button className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition">
          Nova Ficha
        </button>
      </div>

      {/* LISTA */}
      <div className="space-y-8">
        {fichas.map((ficha, index) => (
          <div
            key={index}
            className="border border-green-300 rounded-xl p-6"
          >
            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-green-700">
                  Ficha Clínica {ficha.id}
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
                <h3 className="font-semibold">Queixa Principal</h3>
                <p>Consulta pré-cirúrgica para castração</p>
              </div>

              <div>
                <h3 className="font-semibold">Exame Físico</h3>
                <p>
                  Animal alerta, responsivo. Mucosas normocoradas. FC: 140 bpm,
                  FR: 28 mpm, T: 38.5°C
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Diagnóstico</h3>
                <p>Animal hígido, apto para procedimento cirúrgico</p>
              </div>

              <div>
                <h3 className="font-semibold">Tratamento</h3>
                <p>Jejum alimentar 12h e hídrico 4h antes da cirurgia</p>
              </div>

              {/* Rodapé */}
              <div className="pt-4 text-sm text-green-700 space-y-1">
                <p>
                  <strong>Preenchido por:</strong> {ficha.preenchidoPor}
                </p>

                {ficha.validadoPor && (
                  <p>
                    <strong>Validado por:</strong> {ficha.validadoPor}
                  </p>
                )}
              </div>
            </div>

            <hr className="my-4" />

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <button className="border border-gray-400 px-6 py-2 rounded-md hover:bg-gray-100 transition">
                Editar
              </button>

              <button className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition">
                Validar Ficha
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
