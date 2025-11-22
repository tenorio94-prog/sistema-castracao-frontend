import { Search, Filter, X } from 'lucide-react';

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
  
  // Função para limpar filtros rapidamente
  const clearFilters = () => {
    onBuscaChange('');
    onStatusChange('');
  };

  const hasActiveFilters = busca || statusFiltro;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      
      {/* Área de Busca */}
      <div className="relative w-full md:w-96">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar por animal ou responsável..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm transition-all"
        />
      </div>

      {/* Área de Filtros e Ações */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select
            value={statusFiltro}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">Todos os Status</option>
            <option value="Castração">Castração</option>
            <option value="Consulta">Consulta</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        {/* Botão limpar filtros (aparece condicionalmente) */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-2.5 rounded-xl transition-colors"
          >
            <X size={14} />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}