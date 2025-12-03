"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Printer, Scissors, Search } from 'lucide-react';
import { toast } from 'sonner';
import { SurgicalRecordService, CreateSurgicalRecordData } from '@/services/surgical-record.service';
import { MedicalRecordService } from '@/services/medical-record.service';
import { AnimalService } from '@/services/animal.service';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  surgicalRecordId?: number;
};

interface AnimalSearchResult {
  id: number;
  name: string;
  medicalRecordId: number;
  species: string;
  breed: string;
  gender: string;
  age: string;
  weight: string;
  coat: string;
  size: string;
  ownerName: string;
  ownerPhone: string;
  ownerAddress: string;
}

export default function FichaCirurgicaModal({ isOpen, onClose, onSuccess, surgicalRecordId }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchingAnimal, setSearchingAnimal] = useState(false);
  const [animals, setAnimals] = useState<AnimalSearchResult[]>([]);
  const [showAnimalSearch, setShowAnimalSearch] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateSurgicalRecordData>({
    medicalRecordId: 0,
    recordNumber: '',
    recordDate: new Date().toISOString().split('T')[0],
    animalName: '',
    species: '',
    breed: '',
    coat: '',
    size: '',
    gender: '',
    age: '',
    weight: '',
    ownerName: '',
    ownerPhone: '',
    ownerAddress: '',
    surgeon: '',
    firstAssistant: '',
    secondAssistant: '',
    instrumentator: '',
    anesthetist: '',
    duration: '',
    surgeryStart: '',
    surgeryEnd: '',
    preoperativeDiagnosis: '',
    postoperativeDiagnosis: '',
    proposedOperation: '',
    performedOperation: '',
    materialsUsed: '',
    postoperativeControl: '',
    operationDescription: '',
    additionalObservations: '',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      loadAnimals();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const loadAnimals = async () => {
    try {
      setSearchingAnimal(true);
      const animalsData = await AnimalService.getAll();
      
      const animalsListWithNulls = await Promise.all(
        animalsData.map(async (animal) => {
          try {
            const medicalRecord = await MedicalRecordService.findByAnimal(animal.id);
            
            // Mapear espécie
            const speciesMap: Record<string, string> = {
              'canine': 'Canino',
              'feline': 'Felino'
            };
            
            // Mapear gênero
            const genderMap: Record<string, string> = {
              'male': 'Macho',
              'female': 'Fêmea'
            };
            
            return {
              id: animal.id,
              name: animal.name || 'Sem nome',
              medicalRecordId: medicalRecord.id,
              species: speciesMap[animal.species] || animal.species,
              breed: animal.breed || 'SRD',
              gender: genderMap[animal.gender] || animal.gender,
              age: animal.estimatedAge,
              weight: animal.sizeWeight,
              coat: '',
              size: '',
              ownerName: animal.petOwner?.user?.completeName || '',
              ownerPhone: animal.petOwner?.user?.phone || '',
              ownerAddress: animal.petOwner?.fullAddress || '',
            };
          } catch (error) {
            console.error('Erro ao buscar prontuário do animal:', animal.id, error);
            return null;
          }
        })
      );
      
      const animalsList = animalsListWithNulls.filter((a): a is AnimalSearchResult => a !== null);
      setAnimals(animalsList);
      console.log('✅ Animais carregados:', animalsList.length);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      toast.error('Erro ao carregar lista de animais');
    } finally {
      setSearchingAnimal(false);
    }
  };

  const handleSelectAnimal = (animal: AnimalSearchResult) => {
    console.log('🐾 Animal selecionado:', animal);
    setFormData(prev => ({
      ...prev,
      medicalRecordId: animal.medicalRecordId,
      animalName: animal.name,
      species: animal.species,
      breed: animal.breed,
      gender: animal.gender,
      age: animal.age,
      weight: animal.weight,
      coat: animal.coat,
      size: animal.size,
      ownerName: animal.ownerName,
      ownerPhone: animal.ownerPhone,
      ownerAddress: animal.ownerAddress,
    }));
    setShowAnimalSearch(false);
    toast.success(`Animal ${animal.name} selecionado!`);
  };

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = async () => {
    try {
      if (!formData.medicalRecordId || formData.medicalRecordId === 0) {
        toast.error('Selecione um animal antes de salvar');
        return;
      }

      setSaving(true);
      
      console.log('💾 Salvando ficha cirúrgica...', {
        medicalRecordId: formData.medicalRecordId,
        animalName: formData.animalName,
        surgeon: formData.surgeon
      });
      
      const dataToSend: CreateSurgicalRecordData = {
        ...formData,
        recordDate: formData.recordDate || new Date().toISOString(),
        surgeryStart: formData.surgeryStart || undefined,
        surgeryEnd: formData.surgeryEnd || undefined,
      };

      const result = await SurgicalRecordService.create(dataToSend);
      
      console.log('✅ Ficha cirúrgica salva:', result.id);
      toast.success('Ficha cirúrgica salva com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao salvar ficha:', error);
      toast.error(error.message || 'Erro ao salvar ficha cirúrgica');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-9999 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="bg-gray-100 w-full max-w-5xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <Scissors className="text-blue-700" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Ficha Cirúrgica</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500"><Printer size={20}/></button>
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-gray-500"><X size={20}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-200">
          <div className="bg-white shadow-lg border border-gray-300 p-10 mx-auto max-w-[900px] min-h-[1300px] text-gray-900 relative">
            
            <div className="text-center border-b-2 border-gray-900 pb-2 mb-6">
               <h1 className="text-xl font-bold uppercase">Ficha de Cirurgia</h1>
               <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase mt-1">
                  <span>Universidade Federal Rural de Pernambuco</span>
                  <span>Hospital Veterinário</span>
               </div>
            </div>

            {/* Seleção de Animal */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <button
                type="button"
                onClick={() => setShowAnimalSearch(!showAnimalSearch)}
                className="w-full flex items-center justify-between gap-2 text-blue-700 font-bold hover:text-blue-900"
              >
                <span className="flex items-center gap-2">
                  <Search size={16} />
                  {formData.animalName ? `Animal: ${formData.animalName}` : 'Selecionar Animal'}
                </span>
                <span className="text-xs">{showAnimalSearch ? '▲' : '▼'}</span>
              </button>
              
              {showAnimalSearch && (
                <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                  {searchingAnimal ? (
                    <p className="text-sm text-gray-500 text-center py-4">Carregando animais...</p>
                  ) : animals.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhum animal cadastrado</p>
                  ) : (
                    animals.map((animal) => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => handleSelectAnimal(animal)}
                        className="w-full text-left p-3 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <p className="font-bold text-sm text-gray-900">{animal.name}</p>
                        <p className="text-xs text-gray-600">
                          {animal.species} • {animal.breed} • Tutor: {animal.ownerName}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm mb-8">
               <div className="grid grid-cols-2 gap-10 mb-4">
                  <div className="flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Registro nº:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none placeholder:text-gray-300 w-full"
                      value={formData.recordNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, recordNumber: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Data:</span>
                    <input 
                      type="date" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.recordDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recordDate: e.target.value }))}
                    />
                  </div>
               </div>

               <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Nome do animal:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.animalName}
                      onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                      readOnly
                    />
                  </div>
                  <div className="col-span-6 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Espécie:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.species}
                      onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
                    />
                  </div>
               </div>
               <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Raça:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.breed}
                      onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-4 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Pelagem:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.coat}
                      onChange={(e) => setFormData(prev => ({ ...prev, coat: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-4 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Porte:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>
               </div>
               <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Sexo:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-4 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Idade:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-4 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Peso:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.weight}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
               </div>
               <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Tutor:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.ownerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                      readOnly
                    />
                  </div>
                  <div className="col-span-4 flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Fone:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    />
                  </div>
               </div>
               <div className="flex items-end gap-1">
                 <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Endereço:</span>
                 <input 
                   type="text" 
                   className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                   value={formData.ownerAddress}
                   onChange={(e) => setFormData(prev => ({ ...prev, ownerAddress: e.target.value }))}
                   readOnly
                 />
               </div>
            </div>

            <div className="mt-8">
               <div className="border-b border-gray-400 mb-4">
                 <h3 className="text-sm font-bold uppercase">Relatório de Operação</h3>
               </div>

               <div className="space-y-3 text-sm">
                  <div className="flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Cirurgião:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.surgeon}
                      onChange={(e) => setFormData(prev => ({ ...prev, surgeon: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">1º Assistente:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.firstAssistant}
                         onChange={(e) => setFormData(prev => ({ ...prev, firstAssistant: e.target.value }))}
                       />
                     </div>
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">2º Assistente:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.secondAssistant}
                         onChange={(e) => setFormData(prev => ({ ...prev, secondAssistant: e.target.value }))}
                       />
                     </div>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Instrumentador:</span>
                    <input 
                      type="text" 
                      className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                      value={formData.instrumentator}
                      onChange={(e) => setFormData(prev => ({ ...prev, instrumentator: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-12 gap-4">
                     <div className="col-span-8 flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Anestesista:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.anesthetist}
                         onChange={(e) => setFormData(prev => ({ ...prev, anesthetist: e.target.value }))}
                       />
                     </div>
                     <div className="col-span-4 flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Duração:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.duration}
                         onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                         placeholder="Ex: 1h30min"
                       />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Início:</span>
                       <input 
                         type="datetime-local" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.surgeryStart}
                         onChange={(e) => setFormData(prev => ({ ...prev, surgeryStart: e.target.value }))}
                       />
                     </div>
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Fim:</span>
                       <input 
                         type="datetime-local" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.surgeryEnd}
                         onChange={(e) => setFormData(prev => ({ ...prev, surgeryEnd: e.target.value }))}
                       />
                     </div>
                  </div>

                  <div className="mt-6 space-y-4">
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Diagnóstico Pré-operatório:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.preoperativeDiagnosis}
                         onChange={(e) => setFormData(prev => ({ ...prev, preoperativeDiagnosis: e.target.value }))}
                       />
                     </div>
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Diagnóstico Pós-operatório:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.postoperativeDiagnosis}
                         onChange={(e) => setFormData(prev => ({ ...prev, postoperativeDiagnosis: e.target.value }))}
                       />
                     </div>
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Operação Proposta:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.proposedOperation}
                         onChange={(e) => setFormData(prev => ({ ...prev, proposedOperation: e.target.value }))}
                       />
                     </div>
                     <div className="flex items-end gap-1">
                       <span className="text-[10px] font-bold text-gray-700 uppercase whitespace-nowrap mb-0.5">Operação Realizada:</span>
                       <input 
                         type="text" 
                         className="border-b border-gray-400 bg-transparent px-1 py-0 text-sm text-gray-900 focus:border-green-800 focus:outline-none w-full"
                         value={formData.performedOperation}
                         onChange={(e) => setFormData(prev => ({ ...prev, performedOperation: e.target.value }))}
                       />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                     <div className="mt-4">
                       <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0 border-b border-gray-400 pb-1">Materiais Utilizados</label>
                       <textarea 
                         className="w-full border border-gray-300 bg-white px-2 py-1 text-sm text-blue-900 resize-none outline-none focus:border-green-800 mt-2 rounded"
                         rows={4}
                         value={formData.materialsUsed}
                         onChange={(e) => setFormData(prev => ({ ...prev, materialsUsed: e.target.value }))}
                       />
                     </div>
                     <div className="mt-4">
                       <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0 border-b border-gray-400 pb-1">Controle Pós-Cirúrgico / Alta</label>
                       <textarea 
                         className="w-full border border-gray-300 bg-white px-2 py-1 text-sm text-blue-900 resize-none outline-none focus:border-green-800 mt-2 rounded"
                         rows={4}
                         value={formData.postoperativeControl}
                         onChange={(e) => setFormData(prev => ({ ...prev, postoperativeControl: e.target.value }))}
                       />
                     </div>
                  </div>
               </div>
            </div>

            <div className="mt-4">
               <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0 border-b border-gray-400 pb-1">Descrição do Ato Operatório</label>
               <textarea 
                 className="w-full border border-gray-300 bg-white px-2 py-1 text-sm text-blue-900 resize-none outline-none focus:border-green-800 mt-2 rounded"
                 rows={12}
                 value={formData.operationDescription}
                 onChange={(e) => setFormData(prev => ({ ...prev, operationDescription: e.target.value }))}
               />
            </div>

            <div className="mt-8 pt-6 border-t-4 border-double border-gray-300">
               <label className="block text-[10px] font-bold text-gray-800 uppercase mb-0 border-b border-gray-400 pb-1">Observações Adicionais / Intercorrências</label>
               <textarea 
                 className="w-full border border-gray-300 bg-white px-2 py-1 text-sm text-blue-900 resize-none outline-none focus:border-green-800 mt-2 rounded"
                 rows={4}
                 value={formData.additionalObservations}
                 onChange={(e) => setFormData(prev => ({ ...prev, additionalObservations: e.target.value }))}
               />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200"
            disabled={saving}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-8 py-2 rounded-lg text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={saving || !formData.medicalRecordId}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar Ficha
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
