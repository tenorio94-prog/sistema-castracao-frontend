"use client";

import React, { useState } from "react";
import { CalendarCheck, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import FormInput from '@/components/forms/FormInput';

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    animal: '',
    tipo: '',
    data: '',
    hora: '',
    observacoes: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Agendamento realizado com sucesso!');
    setTimeout(() => router.back(), 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Header com Voltar */}
      <div>
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <PageHeader 
          title="Novo Agendamento"
          description="Preencha os dados para agendar um procedimento ou consulta."
        />
      </div>

      {/* Formulário Card */}
      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
        
        <FormInput 
          label="Nome do Animal"
          name="animal"
          value={formData.animal}
          onChange={(e) => setFormData({...formData, animal: e.target.value})}
          placeholder="Buscar paciente..."
          required
        />

        <div className="space-y-1.5">
           <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Tipo de Procedimento</label>
           <select 
             className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 transition-all"
             value={formData.tipo}
             onChange={(e) => setFormData({...formData, tipo: e.target.value})}
             required
           >
             <option value="">Selecione...</option>
             <option value="Consulta">Consulta Clínica</option>
             <option value="Cirurgia">Cirurgia</option>
             <option value="Retorno">Retorno</option>
           </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <FormInput 
            label="Data"
            type="date"
            name="data"
            value={formData.data}
            onChange={(e) => setFormData({...formData, data: e.target.value})}
            required
          />
          <FormInput 
            label="Horário"
            type="time"
            name="hora"
            value={formData.hora}
            onChange={(e) => setFormData({...formData, hora: e.target.value})}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Observações Clínicas</label>
          <textarea 
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gray-900 min-h-[120px] resize-none placeholder-gray-400"
            placeholder="Descreva o motivo do agendamento ou observações preliminares..."
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
          >
            <CalendarCheck size={18} />
            Confirmar Agendamento
          </button>
        </div>

      </form>
    </div>
  );
}