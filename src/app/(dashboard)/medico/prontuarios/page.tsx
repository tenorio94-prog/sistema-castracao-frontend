"use client";

import { ChevronLeft, Stethoscope, Scissors, Syringe, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProntuarioPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full p-6">
      {/* Botão de voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-green-800 mb-4 hover:text-green-900 transition-colors"
      >
        <ChevronLeft className="mr-1" size={20} /> Voltar
      </button>

      {/* Card do paciente */}
      <div className="border border-green-500 rounded-xl p-4 mb-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-gray-500">
              <span className="text-xl font-semibold">A</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-800">Ana</h2>
              <p className="text-sm text-gray-500">Felino - Raça - 2 anos - 3,4kg</p>
            </div>
          </div>
          <span className="border border-green-600 text-green-600 px-3 py-1 rounded-full text-sm">
            Validada
          </span>
        </div>

        <div className="bg-green-50 rounded-lg p-3 mt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Responsável</p>
              <p>Maria Oliveira</p>
            </div>
            <div>
              <p className="font-semibold">Endereço</p>
              <p>Rua das Flores, 123 - Recife</p>
            </div>
            <div>
              <p className="font-semibold">Telefone</p>
              <p>(81) 98765-4321</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu de navegação */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 flex items-center justify-center gap-2 border border-green-500 bg-green-100 text-green-800 font-medium rounded-lg py-2">
          <Stethoscope size={18} /> Clínicas
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 border border-green-500 text-green-800 rounded-lg py-2 hover:bg-green-50">
          <Scissors size={18} /> Cirúrgicas
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 border border-green-500 text-green-800 rounded-lg py-2 hover:bg-green-50">
          <Syringe size={18} /> Anestésicas
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 border border-green-500 text-green-800 rounded-lg py-2 hover:bg-green-50">
          <FileText size={18} /> Exames
        </button>
      </div>

      {/* Ficha Clínica */}
      <div className="border border-green-500 rounded-xl p-4 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-green-800 text-lg">
            Ficha Clínica <span className="text-gray-700">#ec-1</span>
          </h3>
          <span className="text-sm text-gray-500">27/09/2025</span>
        </div>

        <div className="mt-3">
          <p className="font-semibold text-gray-700">Queixa Principal</p>
          <p className="text-gray-600 text-sm mb-3">
            Consulta pré-cirúrgica para castração
          </p>

          <p className="font-semibold text-gray-700">Diagnóstico</p>
          <p className="text-gray-600 text-sm">
            Animal hígido, apto para procedimento cirúrgico
          </p>
        </div>

        <div className="mt-3 flex justify-end">
          <span className="border border-yellow-500 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium">
            Aguardando Validação
          </span>
        </div>
      </div>
    </div>
  );
}
