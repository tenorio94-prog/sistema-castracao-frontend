import { Plus } from 'lucide-react';
import React from 'react';

type Props = {
  title: string;           // Ex: "Gerenciar Médicos"
  buttonText: string;      // Ex: "Cadastrar Médico"
  onButtonClick: () => void; // A *ação* que acontece ao clicar
};

export default function CrudHeader({ title, buttonText, onButtonClick }: Props) {
  return (
    <div className="flex w-full justify-between items-center">
      
      {/* 1. Título (Genérico) */}
      <h1 className="text-2xl font-bold text-green-700">{title}</h1>
      
      {/* 2. Botão (Genérico) */}
      <button
        onClick={onButtonClick} // 3. Chama a função que veio do componente pai
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus size={18} />
        {buttonText}
      </button>
    </div>
  );
}