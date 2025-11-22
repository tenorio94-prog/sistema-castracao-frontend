import React from 'react';
import { Plus } from 'lucide-react';

type Props = {
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
};

export default function CrudHeader({ title, description, buttonText, onButtonClick }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-gray-200 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
}