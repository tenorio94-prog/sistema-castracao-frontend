"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Plus, ChevronLeft, ChevronRight, Clock, Trash2, CheckCircle2, Calendar as CalendarIcon 
} from 'lucide-react';

// --- TIPOS ---
type TimeSlot = {
  id: string;
  type: 'Consulta' | 'Castração';
  start: string;
  end: string;
};

type AvailabilityMap = Record<string, TimeSlot[]>;

export default function DisponibilidadeSection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availabilityMap, setAvailabilityMap] = useState<AvailabilityMap>({});
  
  // Inputs controlados para o formulário
  const [newSlotType, setNewSlotType] = useState<'Consulta' | 'Castração'>('Consulta');
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');

  // --- LÓGICA ---
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  };

  const handleAddSlot = () => {
    // Validações
    if (!newSlotStart || !newSlotEnd) {
      toast.warning('Defina o horário de início e fim.');
      return;
    }
    if (newSlotEnd <= newSlotStart) {
      toast.warning('O horário final deve ser depois do inicial.');
      return;
    }

    const newSlot: TimeSlot = {
      id: crypto.randomUUID(),
      type: newSlotType,
      start: newSlotStart,
      end: newSlotEnd
    };

    setAvailabilityMap(prev => {
      const currentSlots = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: [...currentSlots, newSlot].sort((a, b) => a.start.localeCompare(b.start))
      };
    });

    // Limpar inputs após adicionar
    setNewSlotStart('');
    setNewSlotEnd('');
    toast.success('Horário adicionado à lista.');
  };

  const handleRemoveSlot = (slotId: string) => {
    setAvailabilityMap(prev => ({
      ...prev,
      [selectedDate]: prev[selectedDate].filter(s => s.id !== slotId)
    }));
  };

  const handleSaveAvailability = () => {
    toast.success('Disponibilidade mensal salva com sucesso!');
    console.log("Payload para API:", availabilityMap);
  };

  return (
    <div className="space-y-6 border-t border-gray-200 pt-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon size={22} className="text-gray-500" />
          Definir Disponibilidade Mensal
        </h2>
        <p className="text-gray-500 text-sm">Selecione os dias e horários disponíveis para consultas e procedimentos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        
        {/* COLUNA ESQUERDA: CALENDÁRIO VISUAL */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 capitalize">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-md transition-colors"><ChevronLeft size={18}/></button>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-md transition-colors"><ChevronRight size={18}/></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <span key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((dateStr, idx) => {
              if (!dateStr) return <div key={`empty-${idx}`} />;
              
              const dayNumber = new Date(dateStr).getDate();
              const isSelected = dateStr === selectedDate;
              const hasSlots = availabilityMap[dateStr] && availabilityMap[dateStr].length > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    aspect-square rounded-xl text-sm font-medium flex items-center justify-center relative transition-all
                    ${isSelected 
                      ? 'bg-gray-900 text-white shadow-md scale-105' 
                      : hasSlots 
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                        : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  {dayNumber}
                  {hasSlots && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-50 border border-green-200 rounded-full"></span> Disponível</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-900 rounded-full"></span> Selecionado</div>
          </div>
        </div>

        {/* COLUNA DIREITA: GERENCIADOR DE SLOTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">
                {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h4>
              <p className="text-xs text-gray-500">Adicione faixas de horário para este dia.</p>
            </div>
            <button 
              onClick={handleSaveAvailability}
              className="flex items-center gap-2 text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-green-200"
            >
              <CheckCircle2 size={16} />
              Salvar Mês
            </button>
          </div>

          {/* FORMULÁRIO DE ADIÇÃO (Corrigido com step="60") */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/3">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tipo</label>
              <select 
                value={newSlotType} 
                onChange={(e) => setNewSlotType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white"
              >
                <option value="Consulta">Consulta</option>
                <option value="Castração">Castração</option>
              </select>
            </div>
            
            {/* Input INÍCIO com step="60" para liberar minutos */}
            <div className="w-full md:w-1/4">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Início</label>
              <input 
                type="time"
                step="60" 
                value={newSlotStart} 
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white" 
              />
            </div>
            
            {/* Input FIM com step="60" para liberar minutos */}
            <div className="w-full md:w-1/4">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Fim</label>
              <input 
                type="time" 
                step="60"
                value={newSlotEnd} 
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white" 
              />
            </div>
            
            <button 
              onClick={handleAddSlot}
              className="w-full md:w-auto px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>

          {/* LISTA DE HORÁRIOS */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-gray-400 uppercase">Horários Definidos</h5>
            
            {(!availabilityMap[selectedDate] || availabilityMap[selectedDate].length === 0) ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <Clock className="mx-auto text-gray-300 mb-2" size={24} />
                <p className="text-gray-400 text-sm font-medium">Nenhum horário configurado.</p>
                <p className="text-gray-300 text-xs">Use o formulário acima para adicionar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availabilityMap[selectedDate].map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-8 rounded-full ${slot.type === 'Consulta' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{slot.type}</p>
                        <p className="text-xs text-gray-500 font-medium font-mono bg-gray-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          {slot.start} - {slot.end}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover horário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}