"use client"; // Precisa ser client-side por causa do <form> e onSubmit
import { X } from 'lucide-react';
import React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void; // Lida com o submit do formulário
  title: string;
  children: React.ReactNode;           // Os campos <input> do formulário
  saveText?: string;                   // Texto do botão (ex: "Salvar", "Cadastrar")
};

export default function CadastroModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  saveText = "Salvar", // Valor padrão
}: Props) {
  
  if (!isOpen) {
    return null;
  }

  return (
    // Fundo (overlay)
    <div className="fixed inset-0 bg-white/75 backdrop-blur-sm flex justify-center items-center z-50">
      
      {/* Conteúdo do Modal (que é um formulário) */}
      <form 
        onSubmit={onSubmit}
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-200"
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button 
            type="button" // Importante: 'type="button"' para não submeter o form
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo (Campos do Formulário Genérico) */}
        <div className="space-y-4">
          {children}
        </div>
        
        {/* Rodapé */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button" // Importante: 'type="button"'
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit" // Este botão SUBMETE o formulário
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {saveText}
          </button>
        </div>
      </form>
    </div>
  );
}