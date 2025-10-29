import { X } from 'lucide-react';
import React from 'react';

type Props = {
  isOpen: boolean;           // Controla se o modal está aberto
  onClose: () => void;         // Função para fechar o modal
  title: string;             // O título (ex: "Detalhes do Médico")
  children: React.ReactNode; // O conteúdo a ser exibido
};

export default function ViewModal({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) {
    return null; // Não renderiza nada se não estiver aberto
  }

  return (
    // Fundo (overlay) com o seu efeito de vidro fosco
    <div className="fixed inset-0 bg-white/75 backdrop-blur-sm flex justify-center items-center z-50">
      
      {/* Conteúdo do Modal */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        {/* Corpo (Conteúdo Genérico) */}
        <div className="space-y-3">
          {children}
        </div>
        
        {/* Rodapé */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}