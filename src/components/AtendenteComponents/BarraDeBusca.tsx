import React from 'react';
import { Search } from 'lucide-react';

// 1. Definição dos Tipos para as Props
type PageSearchBarProps = {
  title: string;
  placeholder: string;
  busca: string;
  onBuscaChange: (value: string) => void;
};

export default function PageSearchBar({ 
  title, 
  placeholder, 
  busca, 
  onBuscaChange 
}: PageSearchBarProps) {
  
  // 2. Tipagem do Evento 'e'
  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBuscaChange(e.target.value);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50/50">
      <label htmlFor="busca" className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">
        {title === "Buscar" && <Search size={20} />}
        {title}
      </label>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          id="busca"
          value={busca}
          onChange={handleBuscaChange} // Usa o handler tipado
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
      </div>
    </div>
  );
}