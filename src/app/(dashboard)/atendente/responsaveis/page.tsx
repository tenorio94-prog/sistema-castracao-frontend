"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
// Usando caminhos relativos para corrigir erros de build
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import ResponsavelCard from '@/components/AtendenteComponents/ResponsavelCard';

// --- DADOS MOCADOS ---
// TODO: Integração Backend: Substituir pelos dados vindos da API
const mockResponsaveis = [
  { id: 1, nome: 'Ana Silva', cpf: '123.456.789-00', telefone: '(81) 98765-4321', email: 'ana.silva@gmail.com', endereco: 'Rua das Flores, 123 - Recife/PE', pets: ['Rex', 'Mel'] },
  { id: 2, nome: 'Bruno Costa', cpf: '987.654.321-00', telefone: '(81) 91234-5678', email: 'bruno.costa@gmail.com', endereco: 'Avenida Boa Viagem, 456 - Recife/PE', pets: ['Thor'] },
  { id: 3, nome: 'Carla Dias', cpf: '111.222.333-44', telefone: '(81) 95555-4444', email: 'carla.dias@gmail.com', endereco: 'Rua do Sol, 789 - Olinda/PE', pets: ['Mia'] },
];
// ---------------------

export default function PaginaResponsaveis() {
  // Estado para o filtro de busca
  const [busca, setBusca] = useState('');

  // Estado para a lista de responsáveis
  const [responsaveis, setResponsaveis] = useState(mockResponsaveis);
  const [loading, setLoading] = useState(false);

  // TODO: Integração Backend: Implementar lógica de fetch
  useEffect(() => {
    const fetchResponsaveis = async () => {
      setLoading(true);
      console.log(`Buscando responsáveis com: busca='${busca}'`);
      
      // Simulação de chamada de API
      // const response = await fetch(`/api/responsaveis?busca=${busca}`);
      // const data = await response.json();
      // setResponsaveis(data);

      // Filtrando dados mocados para simulação
      const filtrados = mockResponsaveis.filter(r => 
        r.nome.toLowerCase().includes(busca.toLowerCase()) ||
        r.cpf.includes(busca) ||
        r.pets.some(pet => pet.toLowerCase().includes(busca.toLowerCase()))
      );

      setTimeout(() => { // Simula delay da rede
        setResponsaveis(filtrados);
        setLoading(false);
      }, 500);
    };

    fetchResponsaveis();
  }, [busca]); // Dependência: refaz o fetch ao mudar o termo de busca

  return (
    // O layout pai (AdmLayout) já fornece o padding (p-8)
    <div className="flex flex-col gap-8">

      {/* 1. Cabeçalho da Página */}
      <PageHeader 
        title="Responsáveis"
        description="Gerencie os tutores dos animais"
        buttonLabel="Novo"
        buttonHref="/atendente/responsaveis/novo" // TODO: Definir rota correta
      />

      {/* 2. Seção de Busca */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
        <label htmlFor="busca" className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">
          <Search size={20} />
          Buscar
        </label>
        <div className="relative">
          <input
            type="text"
            id="busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome do pet ou responsável"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 3. Seção da Lista de Responsáveis */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Responsáveis</h2>
        <p className="text-sm text-gray-600">
          {loading ? 'Buscando...' : `${responsaveis.length} responsável(is) encontrado(s)`}
        </p>

        {/* Conteúdo da Lista */}
        {loading ? (
          <div className="text-center py-10">
            <p>Carregando...</p>
          </div>
        ) : responsaveis.length > 0 ? (
          <div className="flex flex-col gap-4">
            {responsaveis.map(resp => (
              <ResponsavelCard key={resp.id} responsavel={resp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhum responsável encontrado.</p>
          </div>
        )}
      </div>

    </div>
  );
}