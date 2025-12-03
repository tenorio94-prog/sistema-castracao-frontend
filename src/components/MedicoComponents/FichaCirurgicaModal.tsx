"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Printer, Scissors, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SurgicalRecordService, CreateSurgicalRecordData } from '@/services/surgical-record.service';
import { MedicalRecordService } from '@/services/medical-record.service';
import { AnimalService, SPECIES_LABELS, GENDER_LABELS } from '@/services/animal.service';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// Tipo auxiliar para a busca
interface AnimalSearchUI {
  id: number;
  name: string;
  speciesLabel: string;
  breed: string;
  ownerName: string;
  rawAnimal: any; // Guarda o objeto completo para preencher o form
}

export default function FichaCirurgicaModal({ isOpen, onClose, onSuccess }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Busca de Animais
  const [showAnimalSearch, setShowAnimalSearch] = useState(false);
  const [animalList, setAnimalList] = useState<AnimalSearchUI[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);

  // Estado do Formulário
  const [formData, setFormData] = useState<CreateSurgicalRecordData>({
    medicalRecordId: 0,
    recordNumber: '',
    recordDate: new Date().toISOString().split('T')[0],
    
    // Snapshot
    animalName: '', species: '', breed: '', coat: '', size: '', gender: '', 
    age: '', weight: '', ownerName: '', ownerPhone: '', ownerAddress: '',
    
    // Equipe
    surgeon: '', firstAssistant: '', secondAssistant: '', instrumentator: '', anesthetist: '',
    
    // Tempos e Procedimentos
    duration: '', surgeryStart: '', surgeryEnd: '',
    preoperativeDiagnosis: '', postoperativeDiagnosis: '',
    proposedOperation: '', performedOperation: '',
    
    // Descritivos
    materialsUsed: '', postoperativeControl: '', operationDescription: '', additionalObservations: '',
  });

  // Renderização no cliente (Portal)
  useEffect(() => { setIsMounted(true); }, []);

  // Carregar animais ao abrir
  useEffect(() => {
    if (isOpen) {
      loadAnimals();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const loadAnimals = async () => {
    try {
      setLoadingAnimals(true);
      const data = await AnimalService.getAll();
      
      const mapped = data.map((a: any) => ({
        id: a.id,
        name: a.name || 'Sem nome',
        speciesLabel: SPECIES_LABELS[a.species as keyof typeof SPECIES_LABELS] || a.species,
        breed: a.breed || 'SRD',
        ownerName: a.petOwner?.user?.completeName || 'Tutor não identificado',
        rawAnimal: a
      }));
      
      setAnimalList(mapped);
    } catch (error) {
      toast.error("Erro ao carregar lista de animais.");
    } finally {
      setLoadingAnimals(false);
    }
  };

  const handleSelectAnimal = async (item: AnimalSearchUI) => {
    const animal = item.rawAnimal;
    setShowAnimalSearch(false);

    // 1. Preencher dados de snapshot (visual)
    setFormData(prev => ({
      ...prev,
      animalName: animal.name,
      species: item.speciesLabel,
      breed: animal.breed || 'SRD',
      gender: GENDER_LABELS[animal.gender as keyof typeof GENDER_LABELS] || animal.gender,
      age: animal.estimatedAge || '',
      weight: animal.sizeWeight || '', // Assumindo que sizeWeight guarda o peso ou porte
      size: animal.sizeWeight || '',   
      coat: '', // Campo não vem no getAll padrão, deixar editável
      ownerName: item.ownerName,
      ownerPhone: animal.petOwner?.user?.phone || '',
      ownerAddress: animal.petOwner?.fullAddress || '',
    }));

    // 2. Resolver medicalRecordId (Crucial para o Backend)
    try {
      const loadingToast = toast.loading("Verificando prontuário...");
      let recordId = 0;

      try {
        // Tenta buscar existente
        const record = await MedicalRecordService.findByAnimal(animal.id);
        recordId = record.id;
      } catch (err: any) {
        // Se der 404, cria um novo
        if (err.message?.includes('not found') || err.response?.status === 404) {
          const newRecord = await MedicalRecordService.create({ animalId: animal.id });
          recordId = newRecord.id;
          toast.success("Prontuário inicializado automaticamente.");
        } else {
          throw err;
        }
      }

      setFormData(prev => ({ ...prev, medicalRecordId: recordId }));
      toast.dismiss(loadingToast);
      toast.success(`Animal selecionado: ${animal.name}`);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao vincular prontuário médico. Tente novamente.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.medicalRecordId) {
      toast.warning("Selecione um animal antes de salvar.");
      return;
    }
    if (!formData.performedOperation) {
      toast.warning("Informe a operação realizada.");
      return;
    }

    try {
      setSaving(true);

      // Converter datas vazias para undefined para o backend não reclamar
      const payload = {
        ...formData,
        surgeryStart: formData.surgeryStart ? new Date(formData.surgeryStart).toISOString() : undefined,
        surgeryEnd: formData.surgeryEnd ? new Date(formData.surgeryEnd).toISOString() : undefined,
        // Record Date já está em string YYYY-MM-DD do input, backend aceita se usar IsDateString corretamente ou new Date()
        recordDate: new Date(formData.recordDate || new Date()).toISOString(),
      };

      await SurgicalRecordService.create(payload);
      
      toast.success("Ficha cirúrgica salva com sucesso!");
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Erro ao salvar ficha.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-gray-100 w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Scissors className="text-blue-700" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Nova Ficha Cirúrgica</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-500 transition-colors">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Body Scrollável */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-200">
          <div className="bg-white shadow-lg border border-gray-300 p-8 md:p-10 mx-auto max-w-[900px] text-gray-900 relative">
            
            {/* Cabeçalho do Documento */}
            <div className="text-center border-b-2 border-gray-900 pb-4 mb-8">
               <h1 className="text-2xl font-bold uppercase tracking-wide">Relatório Cirúrgico</h1>
               <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase mt-2">
                  <span>Universidade Federal Rural de Pernambuco</span>
                  <span>Hospital Veterinário</span>
               </div>
            </div>

            {/* Seletor de Animal */}
            <div className="mb-8 relative z-20">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paciente</label>
              <button
                type="button"
                onClick={() => setShowAnimalSearch(!showAnimalSearch)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-400 transition-all text-left"
              >
                <span className="flex items-center gap-2 font-bold text-blue-900">
                  <Search size={16} />
                  {formData.animalName ? `${formData.animalName} (Tutor: ${formData.ownerName})` : 'Selecionar Paciente...'}
                </span>
                <span className="text-xs text-blue-400">{showAnimalSearch ? 'Fechar ▲' : 'Buscar ▼'}</span>
              </button>
              
              {showAnimalSearch && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-30">
                  {loadingAnimals ? (
                    <div className="p-4 text-center text-gray-500 text-sm"><Loader2 className="animate-spin mx-auto mb-2"/>Carregando...</div>
                  ) : animalList.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Nenhum animal encontrado.</div>
                  ) : (
                    animalList.map((animal) => (
                      <button
                        key={animal.id}
                        onClick={() => handleSelectAnimal(animal)}
                        className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-blue-50 transition-colors last:border-0"
                      >
                        <p className="font-bold text-sm text-gray-900">{animal.name}</p>
                        <p className="text-xs text-gray-500">{animal.speciesLabel} • {animal.breed} • {animal.ownerName}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Formulário - Identificação e Dados Básicos */}
            <div className="space-y-4 text-sm mb-8">
               <div className="grid grid-cols-2 gap-8">
                  <InputLine label="Registro nº" name="recordNumber" value={formData.recordNumber} onChange={handleChange} />
                  <InputLine label="Data" type="date" name="recordDate" value={formData.recordDate} onChange={handleChange} />
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <InputLine label="Espécie" name="species" value={formData.species} onChange={handleChange} />
                  <InputLine label="Raça" name="breed" value={formData.breed} onChange={handleChange} />
               </div>
               
               <div className="grid grid-cols-3 gap-4">
                  <InputLine label="Sexo" name="gender" value={formData.gender} onChange={handleChange} />
                  <InputLine label="Idade" name="age" value={formData.age} onChange={handleChange} />
                  <InputLine label="Peso" name="weight" value={formData.weight} onChange={handleChange} />
               </div>
               
               <div className="grid grid-cols-2 gap-8">
                  <InputLine label="Pelagem" name="coat" value={formData.coat} onChange={handleChange} />
                  <InputLine label="Porte" name="size" value={formData.size} onChange={handleChange} />
               </div>

               <div className="pt-4 border-t border-gray-100 mt-4">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <InputLine label="Tutor" name="ownerName" value={formData.ownerName} onChange={handleChange} readOnly />
                    </div>
                    <InputLine label="Telefone" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} />
                 </div>
                 <div className="mt-3">
                   <InputLine label="Endereço" name="ownerAddress" value={formData.ownerAddress} onChange={handleChange} />
                 </div>
               </div>
            </div>

            {/* Equipe Cirúrgica */}
            <SectionHeader title="Equipe Cirúrgica" />
            <div className="space-y-3 mb-8">
               <InputLine label="Cirurgião" name="surgeon" value={formData.surgeon} onChange={handleChange} />
               <div className="grid grid-cols-2 gap-8">
                 <InputLine label="1º Assistente" name="firstAssistant" value={formData.firstAssistant} onChange={handleChange} />
                 <InputLine label="2º Assistente" name="secondAssistant" value={formData.secondAssistant} onChange={handleChange} />
               </div>
               <div className="grid grid-cols-2 gap-8">
                 <InputLine label="Instrumentador" name="instrumentator" value={formData.instrumentator} onChange={handleChange} />
                 <InputLine label="Anestesista" name="anesthetist" value={formData.anesthetist} onChange={handleChange} />
               </div>
            </div>

            {/* Tempos e Procedimentos */}
            <SectionHeader title="Procedimento" />
            <div className="space-y-4 mb-8">
               <div className="grid grid-cols-3 gap-4">
                 <InputLine label="Início" type="datetime-local" name="surgeryStart" value={formData.surgeryStart} onChange={handleChange} />
                 <InputLine label="Fim" type="datetime-local" name="surgeryEnd" value={formData.surgeryEnd} onChange={handleChange} />
                 <InputLine label="Duração Total" name="duration" value={formData.duration} onChange={handleChange} placeholder="Ex: 1h 30m" />
               </div>

               <InputLine label="Diagnóstico Pré-Op" name="preoperativeDiagnosis" value={formData.preoperativeDiagnosis} onChange={handleChange} />
               <InputLine label="Diagnóstico Pós-Op" name="postoperativeDiagnosis" value={formData.postoperativeDiagnosis} onChange={handleChange} />
               
               <div className="grid grid-cols-2 gap-8">
                 <InputLine label="Operação Proposta" name="proposedOperation" value={formData.proposedOperation} onChange={handleChange} />
                 <InputLine label="Operação Realizada" name="performedOperation" value={formData.performedOperation} onChange={handleChange} />
               </div>
            </div>
            
            {/* Descritivos Longos */}
            <SectionHeader title="Detalhamento" />
            <div className="space-y-6">
               <TextArea label="Descrição do Ato Operatório" name="operationDescription" value={formData.operationDescription} onChange={handleChange} rows={8} />
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <TextArea label="Materiais Utilizados" name="materialsUsed" value={formData.materialsUsed} onChange={handleChange} rows={4} />
                 <TextArea label="Controle Pós-Cirúrgico" name="postoperativeControl" value={formData.postoperativeControl} onChange={handleChange} rows={4} />
               </div>
               
               <TextArea label="Observações Adicionais" name="additionalObservations" value={formData.additionalObservations} onChange={handleChange} rows={3} />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
            disabled={saving}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving || !formData.medicalRecordId}
            className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Ficha'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- Subcomponentes Visuais ---

const SectionHeader = ({ title }: { title: string }) => (
  <div className="border-b border-gray-200 pb-2 mb-4 mt-6">
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
  </div>
);

const InputLine = ({ label, ...props }: any) => (
  <div className="flex items-end gap-2 w-full">
    <span className="text-[10px] font-bold text-gray-600 uppercase whitespace-nowrap mb-1">{label}:</span>
    <input 
      {...props}
      className="flex-1 border-b border-gray-300 bg-transparent px-1 py-0.5 text-sm text-gray-900 focus:border-blue-600 focus:outline-none placeholder:text-gray-300 transition-colors"
    />
  </div>
);

const TextArea = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">{label}</label>
    <textarea 
      {...props}
      className="w-full border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm text-gray-800 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all resize-none"
    />
  </div>
);