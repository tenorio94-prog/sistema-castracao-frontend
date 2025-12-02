"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

type PetData = {
  id: string;
  name: string;
  age: string; 
  weight: string; 
  photo?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  pet: PetData | null;
  onSave: (data: { id: string, weight: string, age: string }) => void;
};

// Componente customizado de Input Numérico (Stepper Funcional)
const NumberInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => {
  
  const handleIncrement = () => onChange(value + 1);
  const handleDecrement = () => onChange(Math.max(0, value - 1)); // Impede negativo
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    // Se for NaN (vazio) define 0, senão garante que não é negativo
    onChange(isNaN(val) ? 0 : Math.max(0, val));
  };

  return (
    <div className="flex-1">
      <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        <input 
          type="number"
          value={value.toString()} // Convertendo para string para evitar warnings de controlled input
          onChange={handleChange}
          min="0"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        
        {/* Botões de Stepper Customizados e Clicáveis */}
        <div className="absolute right-1 top-1 bottom-1 flex flex-col border-l border-gray-100 w-8">
           <button 
             type="button"
             onClick={handleIncrement}
             className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-tr-lg transition-colors"
           >
             <ChevronUp size={14} />
           </button>
           <button 
             type="button"
             onClick={handleDecrement}
             className="flex-1 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-br-lg transition-colors border-t border-gray-100"
           >
             <ChevronDown size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default function EditarPetModal({ isOpen, onClose, pet, onSave }: Props) {
  const [weight, setWeight] = useState<number>(0);
  const [age, setAge] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (pet) {
      setWeight(parseFloat(pet.weight) || 0);
      setAge(parseInt(pet.age) || 0);
    }
  }, [pet, isOpen]);

  // Gerenciamento de foco e ESC
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isMounted || !isOpen || !pet) return null;

  const handleSave = () => {
    // Validações
    if (weight <= 0) {
      toast.error('Peso inválido', {
        description: 'O peso deve ser maior que zero.'
      });
      return;
    }
    
    if (age < 0) {
      toast.error('Idade inválida', {
        description: 'A idade não pode ser negativa.'
      });
      return;
    }

    onSave({
      id: pet.id,
      weight: `${weight}kg`,
      age: `${age} anos`
    });
    
    toast.success('Dados atualizados!', {
      description: `As informações de ${pet.name} foram salvas.`
    });
    
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-9999 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Editar {pet.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        {/* Corpo */}
        <div className="p-8 flex flex-col gap-8">
          
          {/* Foto Uploader */}
          <div className="flex flex-col items-center gap-3">
            <button className="relative w-28 h-28 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-gray-400 transition-all group">
               <Camera size={32} className="group-hover:scale-110 transition-transform" />
            </button>
            <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">Alterar foto</span>
          </div>

          {/* Inputs Numéricos */}
          <div className="flex gap-4">
            <NumberInput label="Peso (kg)" value={weight} onChange={setWeight} />
            <NumberInput label="Idade (anos)" value={age} onChange={setAge} />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}