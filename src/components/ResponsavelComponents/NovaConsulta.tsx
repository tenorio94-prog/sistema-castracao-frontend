"use client";

import React, { useState, useEffect } from 'react';
import { CalendarCheck, ChevronDown, X } from 'lucide-react';
import { PetOwnerService } from '@/services/petowner.service';
import { SPECIES_LABELS } from '@/services/animal.service';

// --- Componentes Internos de Formulário (para manter o estilo local consistente) ---
const Label = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
  <label className="block text-sm font-bold text-gray-800 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Select = ({ value, onChange, options, placeholder = "Selecione", disabled = false }: any) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
  </div>
);

// --- Opções de Tipo e Horário ---
const TYPE_OPTIONS = [
  { value: 'Primeira Consulta', label: 'Primeira Consulta' },
  { value: 'Castração', label: 'Castração' },
  { value: 'Consulta de Retorno', label: 'Consulta de Retorno' },
];

const TIME_OPTIONS = [
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
];

// --- Props do Componente ---
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  animais?: any[]; // Opcional: pode receber animais já carregados
};

export default function NovaConsultaModal({ isOpen, onClose, onSave, animais: animaisExternal }: Props) {
  const [formData, setFormData] = useState({
    animal: '',
    tipo: '',
    data: '',
    horario: '',
    observacoes: ''
  });

  const [animais, setAnimais] = useState<any[]>([]);
  const [loadingAnimais, setLoadingAnimais] = useState(false);

  // Carregar animais quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      // Limpar formulário
      setFormData({ animal: '', tipo: '', data: '', horario: '', observacoes: '' });
      
      // Se recebeu animais externos, usar eles
      if (animaisExternal && animaisExternal.length > 0) {
        setAnimais(animaisExternal);
      } else {
        // Senão, buscar do backend
        fetchAnimais();
      }
    }
  }, [isOpen, animaisExternal]);

  const fetchAnimais = async () => {
    try {
      setLoadingAnimais(true);
      const data = await PetOwnerService.getMyPets();
      setAnimais(data);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      setAnimais([]);
    } finally {
      setLoadingAnimais(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  // Transformar animais para options do select
  const animalOptions = animais.map(animal => ({
    value: animal.id.toString(),
    label: `${animal.name || 'Sem nome'} (${animal.species ? SPECIES_LABELS[animal.species] : 'N/A'})`
  }));

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white border-2 border-green-100 rounded-2xl text-green-700">
              <CalendarCheck size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">Nova Consulta</h2>
              <p className="text-gray-500 text-sm mt-1">
                Todos os campos marcados com * são obrigatórios
              </p>
            </div>
            <button 
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-2 space-y-6">
          
          {/* Animal */}
          <div>
            <Label required>Animal</Label>
            {loadingAnimais ? (
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm text-gray-500">Carregando animais...</span>
              </div>
            ) : animalOptions.length > 0 ? (
              <Select 
                value={formData.animal}
                onChange={(e: any) => setFormData({...formData, animal: e.target.value})}
                options={animalOptions}
                placeholder="Selecione"
              />
            ) : (
              <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Você ainda não possui animais cadastrados.
                </p>
              </div>
            )}
          </div>

          {/* Tipo */}
          <div>
            <Label required>Tipo de Consulta</Label>
            <Select 
              value={formData.tipo}
              onChange={(e: any) => setFormData({...formData, tipo: e.target.value})}
              options={TYPE_OPTIONS}
              disabled={animalOptions.length === 0}
            />
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label required>Data</Label>
              <input 
                type="date"
                required
                disabled={animalOptions.length === 0}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                min={new Date().toISOString().split('T')[0]} // Impede datas passadas
              />
            </div>
            <div>
              <Label required>Horário</Label>
              <Select 
                value={formData.horario}
                onChange={(e: any) => setFormData({...formData, horario: e.target.value})}
                options={TIME_OPTIONS}
                disabled={animalOptions.length === 0}
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <textarea 
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all min-h-[100px] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Descreva alguma observação que considere relevante para a consulta ou procedimento."
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              disabled={animalOptions.length === 0}
            />
          </div>

          {/* Footer Botoes */}
          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg bg-green-100/50 text-green-800 font-bold text-sm hover:bg-green-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={animalOptions.length === 0}
              className="px-6 py-3 rounded-lg bg-green-700 text-white font-bold text-sm hover:bg-green-800 shadow-lg shadow-green-200 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}