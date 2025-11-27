"use client";

import React, { useState } from 'react';
import { X, Save, Printer, Syringe } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
};

// Componentes de Papel
const PaperLine = ({ label, placeholder, width = "w-full" }: any) => (
  <div className="flex items-end gap-1 mb-1">
    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">{label}:</span>
    <input 
      type="text" 
      className={`border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-purple-800 focus:outline-none placeholder:text-gray-300 ${width}`}
      placeholder={placeholder}
    />
  </div>
);

// Tabela de Fármacos (MPA / Indução)
const DrugTable = ({ title, rows = 3 }: any) => (
  <div className="border border-gray-400 rounded overflow-hidden mb-4 bg-white">
    <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 text-center">
      <span className="text-[10px] font-bold text-gray-800 uppercase">{title}</span>
    </div>
    <div className="grid grid-cols-12 bg-gray-50 text-[9px] font-bold text-gray-600 border-b border-gray-300 text-center">
       <div className="col-span-5 p-1 border-r border-gray-300">Fármaco</div>
       <div className="col-span-2 p-1 border-r border-gray-300">Dose</div>
       <div className="col-span-2 p-1 border-r border-gray-300">Via</div>
       <div className="col-span-3 p-1">Hora</div>
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="grid grid-cols-12 border-b border-gray-200 last:border-0 text-xs h-7">
         <input className="col-span-5 p-1 border-r border-gray-200 outline-none bg-transparent" />
         <input className="col-span-2 p-1 border-r border-gray-200 outline-none text-center bg-transparent" />
         <input className="col-span-2 p-1 border-r border-gray-200 outline-none text-center bg-transparent" />
         <input type="time" className="col-span-3 p-1 outline-none text-center bg-transparent" />
      </div>
    ))}
  </div>
);

// Tabela de Monitoramento Complexa
const MonitoringTable = () => (
  <div className="border border-gray-400 rounded overflow-hidden bg-white">
    <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 flex justify-between items-center">
       <span className="text-[10px] font-bold text-gray-800 uppercase">Manutenção Anestésica / Monitoramento</span>
       <div className="flex gap-4 text-[10px] font-medium">
          <label className="flex gap-1 cursor-pointer"><input type="checkbox"/> Inalatória</label>
          <label className="flex gap-1 cursor-pointer"><input type="checkbox"/> TIVA</label>
       </div>
    </div>
    
    <div className="grid grid-cols-12 text-[9px] bg-gray-50 border-b border-gray-300 text-center font-bold text-gray-600">
       <div className="col-span-3 p-1 border-r border-gray-300">Agente</div>
       <div className="col-span-2 p-1 border-r border-gray-300">Hora</div>
       <div className="col-span-1 p-1 border-r border-gray-300">FC</div>
       <div className="col-span-1 p-1 border-r border-gray-300">fR</div>
       <div className="col-span-1 p-1 border-r border-gray-300">SpO2</div>
       <div className="col-span-1 p-1 border-r border-gray-300">EtCO2</div>
       <div className="col-span-1 p-1 border-r border-gray-300">PAS</div>
       <div className="col-span-1 p-1 border-r border-gray-300">PAD</div>
       <div className="col-span-1 p-1">Temp</div>
    </div>

    {[...Array(10)].map((_, i) => ( 
      <div key={i} className="grid grid-cols-12 border-b border-gray-200 text-xs h-8">
         <input className="col-span-3 border-r border-gray-200 p-1 outline-none bg-transparent" />
         <input type="time" className="col-span-2 border-r border-gray-200 p-1 outline-none text-center bg-transparent" />
         <input className="col-span-1 border-r border-gray-200 p-1 outline-none text-center bg-transparent" />
         <input className="col-span-1 border-r border-gray-200 p-1 outline-none text-center bg-transparent" />
         <input className="col-span-1 border-r border-gray-200 p-1 outline-none text-center bg-transparent" />
         <input className="col-span-1 border-r border-gray-200 p-1 outline-none text-center bg-transparent" />
         <input className="col-span-1 border-r border-gray-200 p-1 outline-none text-center bg-transparent" />
         <input className="col-span-1 border-r border-gray-200 p-1 outline-none text-center bg-transparent" />
         <input className="col-span-1 p-1 outline-none text-center bg-transparent" />
      </div>
    ))}
  </div>
);

export default function FichaAnestesicaModal({ isOpen, onClose, patientName }: Props) {
  if (!isOpen) return null;

  const handleSave = () => {
    toast.success("Ficha anestésica salva com sucesso!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gray-100 w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <Syringe className="text-purple-700" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Ficha Anestésica</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Printer size={20}/></button>
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-gray-500"><X size={20}/></button>
          </div>
        </div>

        {/* Corpo (Papel) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-200">
          <div className="bg-white shadow-lg border border-gray-300 p-10 mx-auto max-w-[950px] min-h-[1300px] text-gray-900 relative">
            
            {/* Cabeçalho Institucional */}
            <div className="text-center border-b-2 border-gray-900 pb-2 mb-6">
               <h1 className="text-xl font-bold uppercase">Ficha Anestésica</h1>
               <p className="text-[10px] font-bold text-gray-600 uppercase">Hospital Veterinário Universitário - UFRPE</p>
            </div>

            {/* Identificação */}
            <div className="border border-gray-400 p-4 mb-6 rounded-sm bg-gray-50/50">
               <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6"><PaperLine label="Nome" value={patientName} /></div>
                  <div className="col-span-3"><PaperLine label="Espécie" /></div>
                  <div className="col-span-3"><PaperLine label="Raça" /></div>
               </div>
               <div className="grid grid-cols-12 gap-4 mt-2">
                  <div className="col-span-3"><PaperLine label="Peso" /></div>
                  <div className="col-span-3"><PaperLine label="Idade" /></div>
                  <div className="col-span-6"><PaperLine label="Procedimento" /></div>
               </div>
               <div className="grid grid-cols-12 gap-4 mt-2 items-end">
                  <div className="col-span-4"><PaperLine label="Anestesista" /></div>
                  <div className="col-span-4"><PaperLine label="Cirurgião" /></div>
                  
                  {/* CLASSIFICAÇÃO ASA & RISCO */}
                  <div className="col-span-4 pl-4 border-l border-gray-300 space-y-2">
                     
                     {/* ASA */}
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase text-gray-600">ASA:</span>
                        {['I', 'II', 'III', 'IV', 'V'].map(asa => (
                           <label key={asa} className="flex items-center gap-0.5 text-xs font-bold cursor-pointer"><input type="radio" name="asa" className="accent-purple-700"/> {asa}</label>
                        ))}
                     </div>

                     {/* NOVO: Risco Anestésico (Alterado para "Risco Anestésico") */}
                     <div className="flex items-center gap-3 pt-1 border-t border-gray-200">
                        <span className="text-[10px] font-bold uppercase text-gray-600">Risco Anestésico:</span>
                        {['Leve', 'Moderado', 'Alto'].map(risco => (
                           <label key={risco} className="flex items-center gap-0.5 text-[10px] font-medium cursor-pointer">
                              <input type="radio" name="risco" className="accent-red-600"/> {risco}
                           </label>
                        ))}
                     </div>

                  </div>
               </div>
            </div>

            {/* Avaliação Pré-Anestésica */}
            <div className="mb-6">
               <h3 className="text-center font-bold uppercase text-sm mb-3 border-b border-gray-300 pb-1 text-gray-700">Avaliação Pré-Anestésica</h3>
               
               <div className="flex gap-0 border border-gray-400 rounded overflow-hidden mb-4">
                  {['FC', 'fR', 'Mucosas', 'TPC', 'Temp'].map((label, i) => (
                    <div key={label} className={`flex-1 flex flex-col items-center p-2 ${i !== 4 ? 'border-r border-gray-400' : ''}`}>
                      <span className="text-[10px] font-bold text-gray-500 mb-1">{label}</span>
                      <input className="w-full text-center font-bold text-sm outline-none bg-transparent" />
                    </div>
                  ))}
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <PaperLine label="Comorbidades" />
                  <PaperLine label="Alergias" />
               </div>
            </div>

            {/* Medicações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <DrugTable title="Medicação Pré-Anestésica (MPA)" rows={4} />
               <DrugTable title="Indução Anestésica" rows={4} />
            </div>

            {/* Manutenção */}
            <div className="mb-6">
               <div className="flex gap-4 mb-3 text-xs bg-gray-50 p-2 rounded border border-gray-300">
                  <div className="flex items-center gap-2">
                     <span className="font-bold uppercase text-gray-600">Intubação:</span>
                     <label className="flex gap-1 cursor-pointer"><input type="radio" name="intub" className="accent-purple-700"/> Sim</label>
                     <label className="flex gap-1 cursor-pointer"><input type="radio" name="intub" className="accent-purple-700"/> Não</label>
                  </div>
                  <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
                     <span className="font-bold uppercase text-gray-600">Sonda nº:</span>
                     <input className="border-b border-gray-400 w-10 text-center outline-none bg-transparent"/>
                  </div>
                  <div className="flex items-center gap-1 border-l border-gray-300 pl-3 flex-1">
                     <span className="font-bold uppercase text-gray-600">Circuito:</span>
                     <input className="border-b border-gray-400 w-full outline-none bg-transparent"/>
                  </div>
               </div>
               
               {/* Tabela Monitoramento */}
               <MonitoringTable />
            </div>

            {/* Recuperação (Verso - Img 4) */}
            <div className="pt-6 border-t-4 border-double border-gray-400 mt-8">
               <h3 className="text-center font-bold uppercase text-sm mb-4 bg-gray-200 py-1 rounded text-gray-800">Recuperação Pós-Anestésica</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border border-gray-400 rounded p-4 bg-white">
                     <div className="mb-4 flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold uppercase text-gray-600">Hora Extubação:</span>
                        <input type="time" className="border border-gray-300 rounded px-2 py-1 text-sm" />
                     </div>
                     
                     <div className="space-y-2 text-xs">
                        <p className="font-bold uppercase text-gray-600 mb-2">Qualidade da Recuperação</p>
                        <label className="flex gap-2 cursor-pointer items-center hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="w-4 h-4 accent-purple-700"/> Rápida / Suave</label>
                        <label className="flex gap-2 cursor-pointer items-center hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="w-4 h-4 accent-purple-700"/> Lenta</label>
                        <label className="flex gap-2 cursor-pointer items-center hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="w-4 h-4 accent-purple-700"/> Agitada / Excitação</label>
                        <label className="flex gap-2 cursor-pointer items-center hover:bg-gray-50 p-1 rounded"><input type="checkbox" className="w-4 h-4 accent-purple-700"/> Vocalização / Dor</label>
                     </div>
                  </div>

                  <div className="border border-gray-400 rounded p-0 overflow-hidden bg-white flex flex-col">
                     <div className="bg-gray-100 p-1 text-center font-bold text-xs uppercase border-b border-gray-400">Medicação Pós-Cirúrgica</div>
                     <textarea className="w-full flex-1 p-2 text-xs resize-none outline-none" placeholder="Analgésicos, Anti-inflamatórios..."></textarea>
                  </div>
               </div>

               {/* Campo Extra */}
               <div className="mt-6">
                  <label className="block text-[10px] font-bold text-purple-800 uppercase mb-1">Observações Gerais / Intercorrências</label>
                  <div className="w-full h-24 border border-purple-200 bg-purple-50 rounded p-2">
                     <textarea className="w-full h-full bg-transparent resize-none outline-none text-sm text-purple-900"></textarea>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200">Cancelar</button>
          <button onClick={handleSave} className="px-8 py-2 rounded-lg text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-lg flex items-center gap-2">
            <Save size={18} /> Salvar Ficha
          </button>
        </div>

      </div>
    </div>
  );
}