// @/components/AtendenteComponents/FiltroAgendamento.jsx
// (Ou .tsx se você estiver usando TypeScript)

import { Filter, Search } from 'lucide-react';

/**
 * Componente de Filtro e Busca para a página de Agendamentos.
 * (Componente controlado, recebe props da página)
 */
type FiltroAgendamentoProps = {
  busca: string;
  onBuscaChange: (value: string) => void;
  statusFiltro: string;
  onStatusChange: (value: string) => void;
};

export default function FiltroAgendamento({ 
  busca, 
  onBuscaChange, 
  statusFiltro, 
  onStatusChange 
}: FiltroAgendamentoProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-gray-700" />
        {/* Título alterado */}
        <h2 className="text-xl font-semibold text-gray-800">Filtros e Busca</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Input de Busca (Padronizado) */}
        <div className="flex-1">
          <label htmlFor="busca" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar por responsável ou pet
          </label>
          <div className="relative">
            {/* Ícone à esquerda */}
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="busca"
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              placeholder="Preencha o espaço"
              // Padding e placeholder atualizados
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Select de Status (Opções Corrigidas) */}
        <div className="flex-1 md:max-w-[250px]">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por status
          </label>
          <select
            id="status"
            value={statusFiltro}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Opções alteradas */}
            <option value="">Selecione</option>
            <option value="Castração">Castração</option>
            <option value="Consulta">Consulta</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>
      </div>
    </div>
  );
}