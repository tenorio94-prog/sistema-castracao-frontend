"use client";

import { Search, User, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function BuscarProntuarioPage() {
  const router = useRouter();

  // Lista de exemplo (adicione seus dados reais)
  const animals = [
    {
      nome: "Alana",
      responsavel: "Maria Oliveira",
      idade: "2 anos",
      peso: "3.5kg",
      especie: "Feline • Raça",
    },
    {
      nome: "Armagedon",
      responsavel: "Maria Oliveira",
      idade: "2 anos",
      peso: "3.5kg",
      especie: "Feline • Raça",
    },
    {
      nome: "Aligator",
      responsavel: "Maria Oliveira",
      idade: "2 anos",
      peso: "3.5kg",
      especie: "Feline • Raça",
    },
  ];

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
      <h1 className="text-3xl font-bold text-green-700">Buscar Prontuário</h1>
      <p className="text-gray-600 mt-1 mb-8">
        Encontre e acesse o histórico completo dos animais
      </p>

      {/* Caixa de busca */}
      <div className="border border-green-300 rounded-lg p-5 mb-10">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Buscar Animal
        </label>

        <div className="flex gap-3">
          <div className="flex items-center border border-gray-300 rounded-md px-3 w-full bg-gray-100">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Digite o nome do animal ou do tutor para buscar"
              className="bg-transparent w-full py-2.5 outline-none"
            />
          </div>

          <button className="flex items-center bg-green-700 text-white px-6 rounded-md hover:bg-green-800 transition">
            <Search className="w-4 h-4 mr-2" /> Buscar
          </button>
        </div>
      </div>

      {/* Lista de animais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {animals.map((animal, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-5 flex flex-col"
          >
            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="text-gray-500 w-7 h-7" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-700">{animal.nome}</h2>
                <p className="text-sm text-gray-500">{animal.especie}</p>
              </div>
            </div>

            {/* Informações */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                <strong>Responsável:</strong> {animal.responsavel}
              </p>
              <p>
                <strong>Idade:</strong> {animal.idade}
              </p>
              <p>
                <strong>Peso:</strong> {animal.peso}
              </p>
            </div>

            {/* Botão Ver Prontuário */}
            <button
              className="bg-green-700 text-white px-4 py-2 rounded-md mt-4 self-start hover:bg-green-800 transition"
              onClick={() => alert(`Abrir prontuário de ${animal.nome}`)}
            >
              Ver Prontuário
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
