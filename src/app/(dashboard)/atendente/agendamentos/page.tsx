"use client"; // Necessário para usar hooks como useState

import { useState, useEffect } from 'react';
import { Filter, Search } from 'lucide-react';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import AgendamentoCard from '@/components/AtendenteComponents/AgendamentoCard';

// --- DADOS MOCADOS ---
// TODO: Integração Backend: Substituir pelos dados vindos da API
const mockAgendamentos = [
  { id: 1, petName: 'Rex', status: 'Pendente' as const, responsavel: 'Ana Paula', data: '14/01/2025', hora: '09:00' },
  { id: 2, petName: 'Thor', status: 'Pendente' as const, responsavel: 'Bruno Costa', data: '14/01/2025', hora: '09:30' },
  { id: 3, petName: 'Mia', status: 'Pendente' as const, responsavel: 'Carla Dias', data: '14/01/2025', hora: '10:00' },
  { id: 4, petName: 'Luke', status: 'Pendente' as const, responsavel: 'Daniel Moreira', data: '14/01/2025', hora: '10:30' },
  { id: 5, petName: 'Nina', status: 'Pendente' as const, responsavel: 'Elisa Fernandes', data: '14/01/2025', hora: '11:00' },
  { id: 6, petName: 'Bolinha', status: 'Pendente' as const, responsavel: 'Fábio Guedes', data: '14/01/2025', hora: '11:30' },
];
// ---------------------

export default function PaginaAgendamentos() {
  // Estado para os filtros
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');

  // Estado para a lista de agendamentos
  // TODO: Integração Backend: O estado inicial será [] e será preenchido pelo fetch
  const [agendamentos, setAgendamentos] = useState(mockAgendamentos);
  const [loading, setLoading] = useState(false); // Estado de loading

  // TODO: Integração Backend: Implementar lógica de fetch
  useEffect(() => {
    // Esta função será chamada para buscar dados quando os filtros mudarem
    const fetchAgendamentos = async () => {
      setLoading(true);
      console.log(`Buscando dados com: busca='${busca}', status='${statusFiltro}'`);
      
      // Simulação de chamada de API
      // Em um caso real:
      // const params = new URLSearchParams({ busca, status: statusFiltro });
      // const response = await fetch(`/api/agendamentos?${params}`);
      // const data = await response.json();
      // setAgendamentos(data);
      
      // Por enquanto, apenas filtramos os dados mocados
      const filtrados = mockAgendamentos.filter(ag => {
        const matchBusca = (ag.petName.toLowerCase().includes(busca.toLowerCase()) || 
                            ag.responsavel.toLowerCase().includes(busca.toLowerCase()));
        const matchStatus = (statusFiltro === '' || ag.status === statusFiltro);
        return matchBusca && matchStatus;
      });
      
      setTimeout(() => { // Simula delay da rede
        setAgendamentos(filtrados);
        setLoading(false);
      }, 500);
    };

    fetchAgendamentos();
  }, [busca, statusFiltro]); // Dependências: refaz o fetch ao mudar os filtros

  return (
    // O layout pai (AdmLayout) já fornece o padding (p-8)
    <div className="flex flex-col gap-8">
      
      {/* 1. Cabeçalho da Página */}
      <PageHeader 
        title="Agendamentos"
        description="Gerencie os agendamentos do hospital"
        buttonLabel="Novo Agendamento"
        buttonHref="/atendente/agendamentos/novo" // TODO: Definir a rota correta
      />

      {/* 2. Seção de Filtros */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Input de Busca */}
          <div className="flex-1">
            <label htmlFor="busca" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por responsável ou pet
            </label>
            <div className="relative">
              <input
                type="text"
                id="busca"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Preencha o espaço"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Select de Status */}
          <div className="flex-1 md:max-w-[250px]">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por status
            </label>
            <select
              id="status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Seção da Lista de Agendamentos */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Lista de Agendamentos</h2>
        <p className="text-sm text-gray-600">
          {loading ? 'Buscando...' : `${agendamentos.length} agendamento(s) encontrado(s)`}
        </p>

        {/* Conteúdo da Lista */}
        {loading ? (
          // TODO: Integração Backend: Criar um componente de Skeleton/Loading mais bonito
          <div className="text-center py-10">
            <p>Carregando...</p>
          </div>
        ) : agendamentos.length > 0 ? (
          <div className="flex flex-col gap-4">
            {agendamentos.map(ag => (
              <AgendamentoCard key={ag.id} agendamento={ag} />
            ))}
          </div>
        ) : (
          // TODO: Integração Backend: Criar um componente de "Lista Vazia"
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Nenhum agendamento encontrado.</p>
          </div>
        )}
      </div>

    </div>
  );
}