"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, Printer, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ClinicalRecordService, ClinicalRecordType, CreateClinicalRecordData } from '@/services/medical-record.service';
import { MedicalRecordService } from '@/services/medical-record.service';
import { AnimalService } from '@/services/animal.service';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  ownerName?: string;
  animalId: number | null;
};

// Componentes de Layout de Papel (Underline Inputs)
const PaperLine = ({ label, value, placeholder, width = "w-full", className="", onChange, name }: any) => (
  <div className={`flex items-end gap-1 ${className}`}>
    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">{label}:</span>
    <input 
      type="text" 
      name={name}
      className={`border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none placeholder:text-gray-300 ${width}`}
      defaultValue={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  </div>
);

// Área de texto pautada (Caderno)
const LinedTextArea = ({ label, rows = 5, name, onChange }: any) => (
  <div className="border border-gray-400 rounded-sm overflow-hidden flex flex-col h-full mb-4">
    <div className="bg-gray-100 border-b border-gray-400 px-2 py-1">
      <span className="text-[10px] font-bold text-gray-800 uppercase block leading-tight">{label}</span>
    </div>
    <div 
      className="flex-1 bg-white w-full"
      style={{
        backgroundImage: 'linear-gradient(transparent 23px, #e5e7eb 24px)',
        backgroundSize: '100% 24px',
        lineHeight: '24px'
      }}
    >
      <textarea 
        name={name}
        className="w-full h-full bg-transparent border-none focus:ring-0 text-sm leading-[24px] px-2 text-blue-900 resize-none outline-none overflow-hidden font-medium"
        rows={rows}
        onChange={onChange}
      />
    </div>
  </div>
);

// Input de Parâmetros (TR, FC...)
const ParamInput = ({ label, unit, name, onChange }: any) => (
  <div className="flex flex-col items-center mx-2">
     <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</span>
     <div className="flex items-baseline gap-1 border-b border-gray-400">
       <input type="text" name={name} className="w-12 text-center font-medium focus:outline-none bg-transparent text-sm" onChange={onChange} />
       <span className="text-[10px] text-gray-400 mb-0.5">{unit}</span>
     </div>
  </div>
);

export default function FichaClinicaModal({ isOpen, onClose, patientName, ownerName, animalId }: Props) {
  const [loading, setLoading] = useState(false);
  const [medicalRecordId, setMedicalRecordId] = useState<number | null>(null);
  const [animalData, setAnimalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    observations: '',
  });

  useEffect(() => {
    if (isOpen && animalId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Try to fetch animal data - handle 403 permission error
          try {
            const animal = await AnimalService.getById(animalId);
            setAnimalData(animal);
          } catch (animalError: any) {
            if (animalError.message.includes('Acesso negado') || animalError.message.includes('403')) {
              console.warn('Permission denied for animal details, using basic data');
              // Set minimal data from props
              setAnimalData({
                id: animalId,
                name: patientName,
                species: 'canine',
                gender: 'male',
                estimatedAge: 'Não informado',
                sizeWeight: 'Não informado',
                breed: 'Não informado'
              });
            } else {
              throw animalError;
            }
          }

          // Fetch or create medical record
          try {
            const medRecord = await MedicalRecordService.getByAnimalId(animalId);
            setMedicalRecordId(medRecord.id);
          } catch (error: any) {
            // Medical record doesn't exist, create one
            if (error.message.includes('not found') || error.message.includes('404')) {
              try {
                const newRecord = await MedicalRecordService.create({ animalId });
                setMedicalRecordId(newRecord.id);
              } catch (createError: any) {
                console.error('Error creating medical record:', createError);
                toast.error('Não foi possível criar o prontuário médico');
              }
            } else {
              console.error('Error fetching medical record:', error);
            }
          }
        } catch (error: any) {
          console.error('Error fetching data:', error);
          toast.error('Erro ao carregar dados do paciente');
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, animalId, patientName]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!medicalRecordId || !animalId) {
      toast.error('Dados do paciente não carregados');
      return;
    }

    try {
      setLoading(true);

      // Get user data from localStorage
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const userData = JSON.parse(userDataStr);
      const userId = parseInt(userData.sub); // JWT sub is the userId

      if (!userId) {
        toast.error('Usuário não identificado');
        return;
      }

      // Get veterinarian by userId
      let veterinarianId: number;
      try {
        const { VeterinarianService } = await import('@/services/veterinarian.service');
        const veterinarian = await VeterinarianService.getById(userId);
        veterinarianId = veterinarian.id;
      } catch (vetError: any) {
        console.error('Error getting veterinarian:', vetError);
        toast.error('Não foi possível identificar o veterinário. Verifique suas permissões.');
        return;
      }

      const clinicalData: CreateClinicalRecordData = {
        medicalRecordId,
        veterinarianId,
        type: ClinicalRecordType.triage, // Default to triage for clinical records
        observations: formData.observations || 'Ficha clínica preenchida',
        treatmentDate: new Date().toISOString(),
      };

      await ClinicalRecordService.create(clinicalData);
      toast.success("Ficha clínica salva com sucesso!");
      onClose();
    } catch (error: any) {
      console.error('Error saving clinical record:', error);
      toast.error(error.message || 'Erro ao salvar ficha clínica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gray-100 w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Modal */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <FileText className="text-green-700" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Nova Ficha Clínica</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Printer size={20}/></button>
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-gray-500"><X size={20}/></button>
          </div>
        </div>

        {/* Corpo Scrollável (Papel Digital) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500">Carregando dados do paciente...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-lg border border-gray-300 p-10 mx-auto max-w-[900px] min-h-[1400px] text-gray-900 relative">
            
            {/* --- PARTE 1: IDENTIFICAÇÃO (Baseado na Imagem 1) --- */}
            
            {/* Cabeçalho da Folha */}
            <div className="flex justify-between items-end border-b-2 border-gray-900 pb-2 mb-6">
              <h1 className="text-xl font-bold">Ficha Clínica: <span className="text-red-600">27.233</span></h1>
              <div className="text-right text-[10px] font-bold text-gray-600 uppercase leading-tight">
                <p>Departamento de Medicina Veterinária</p>
                <p>Hospital Veterinário - UFRPE</p>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-8 border-b-2 border-dashed border-gray-300 pb-8">
              <div className="flex justify-end"><PaperLine label="Data" width="w-32" placeholder="__/__/____"/></div>
              
              <div className="flex gap-4"><PaperLine label="Nome do animal" value={patientName} className="flex-1" /><PaperLine label="Espécie" className="w-32" /><PaperLine label="Raça" className="w-40" /></div>
              <div className="flex gap-4"><PaperLine label="Idade" className="w-24" /><PaperLine label="Sexo" className="w-24" /><PaperLine label="Pelagem" className="flex-1" /><PaperLine label="Peso" className="w-24" /><PaperLine label="Porte" className="w-24" /></div>
              <div className="flex gap-4"><PaperLine label="Tutor" value={ownerName} className="flex-1" /><PaperLine label="Fone" className="w-40" /></div>
              <div className="flex gap-4"><PaperLine label="Endereço" className="flex-1" /><PaperLine label="Nº" className="w-20" /></div>
              <div className="flex gap-4"><PaperLine label="Bairro" className="flex-1" /><PaperLine label="Cidade" className="flex-1" /></div>
              <PaperLine label="Ponto de Referência" />
              
              <div className="flex justify-around py-3 border-y border-gray-100 my-4 text-[11px] font-bold uppercase text-gray-600 bg-gray-50">
                <label className="flex gap-1 cursor-pointer"><input type="checkbox"/> Orientação Clínica</label>
                <label className="flex gap-1 cursor-pointer"><input type="checkbox"/> Retorno</label>
                <label className="flex gap-1 cursor-pointer"><input type="checkbox"/> Consulta</label>
                <label className="flex gap-1 cursor-pointer"><input type="checkbox"/> Alteração Tratamento</label>
              </div>

              {/* Anamnese */}
              <div className="mt-4">
                <label className="block text-[10px] font-bold text-gray-800 uppercase mb-1">ANAMNESE (História atual, tratamento prévio, antecedentes)</label>
                <div className="w-full h-40 border border-gray-300 bg-[linear-gradient(transparent_23px,#e5e7eb_24px)] bg-[length:100%_24px]">
                   <textarea className="w-full h-full bg-transparent border-none outline-none resize-none text-sm leading-[24px] px-2 text-blue-900"></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4">
                 <PaperLine label="Vacinações (Quais)" />
                 <PaperLine label="Quando" />
              </div>
              <PaperLine label="Vermifugações" className="mt-2" />
            </div>

            {/* --- PARTE 2: EXAME CLÍNICO (Baseado na Imagem 2) --- */}
            <div>
               <div className="text-center mb-6 relative">
                 <span className="bg-white px-4 relative z-10 text-lg font-bold uppercase text-gray-900">Exame Clínico</span>
                 <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-900 -z-0"></div>
               </div>
               
               {/* Parâmetros */}
               <div className="flex flex-wrap justify-center gap-6 mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                 <ParamInput label="TR" unit="°C" />
                 <ParamInput label="Bat. Card." unit="/min" />
                 <ParamInput label="Mov. Resp." unit="/min" />
                 <ParamInput label="Pulso" unit="/min" />
               </div>

               {/* Grid de Sistemas (Fiel à Img 2 - Esquerda/Direita) */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  {/* Coluna Esquerda */}
                  <div className="flex flex-col gap-4">
                    <LinedTextArea label="ECTOSCOPIA (Estado geral, mucosas, pele, linfonodos)" rows={6} />
                    <LinedTextArea label="CABEÇA E PESCOÇO (Ouvidos, olhos, nariz, boca)" rows={6} />
                    <LinedTextArea label="CAVIDADE TORÁCICA (Palpação, percussão, auscultação)" rows={6} />
                  </div>

                  {/* Coluna Direita */}
                  <div className="flex flex-col gap-4">
                    <LinedTextArea label="CAVIDADE ABDOMINAL (Forma, conteúdo, estômago, fígado)" rows={6} />
                    <LinedTextArea label="SISTEMA NERVOSO (Comportamento, reflexos, paralisias)" rows={6} />
                    <LinedTextArea label="SISTEMA LOCOMOTOR (Ossos e articulações)" rows={6} />
                  </div>
               </div>

               {/* Diagnóstico e Prognóstico */}
               <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LinedTextArea label="DIAGNÓSTICO PROVÁVEL / EXAMES COMPLEMENTARES" rows={4} />
                  <LinedTextArea label="DIAGNÓSTICO DEFINITIVO / PROGNÓSTICO" rows={4} />
               </div>

               {/* --- CAMPO EXTRA SOLICITADO --- */}
               <div className="mt-8 pt-6 border-t-4 border-double border-gray-300">
                  <LinedTextArea label="OBSERVAÇÕES ADICIONAIS / DESCRIÇÃO LIVRE (Extra)" rows={5} />
               </div>

            </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200" disabled={loading}>
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-8 py-2 rounded-lg text-sm font-bold text-white bg-green-700 hover:bg-green-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            {loading ? 'Salvando...' : 'Salvar Ficha'}
          </button>
        </div>
      </div>
    </div>
  );
}