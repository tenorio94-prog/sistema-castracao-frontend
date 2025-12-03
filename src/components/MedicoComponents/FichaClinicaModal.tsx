"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Printer, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ClinicalRecordService, { ClinicalRecordType, SurgeryType, CreateClinicalRecordData } from '@/services/clinical-record.service';
import { MedicalRecordService } from '@/services/medical-record.service';
import { AnimalService } from '@/services/animal.service';
import { VeterinarianService } from '@/services/veterinarian.service';

interface AnimalSearchResult {
  id: number;
  name: string;
  species: string;
  breed?: string;
  gender: string;
  estimatedAge: string;
  sizeWeight: string;
  petOwner?: {
    user?: {
      completeName?: string;
      phone?: string;
    };
    fullAddress?: string;
  };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function FichaClinicaModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [animalsList, setAnimalsList] = useState<AnimalSearchResult[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [medicalRecordId, setMedicalRecordId] = useState<number | null>(null);
  const [veterinarianId, setVeterinarianId] = useState<number | null>(null);
  
  // Form data - TODOS OS 40+ CAMPOS DO BACKEND
  const [formData, setFormData] = useState<CreateClinicalRecordData>({
    medicalRecordId: 0,
    veterinarianId: 0,
    type: ClinicalRecordType.TRIAGE,
    treatmentDate: new Date().toISOString().split('T')[0],
    
    // Triage
    fitForSurgery: undefined,
    
    // Surgery
    surgeryType: undefined,
    
    // === ANIMAL DATA ===
    animalName: '',
    breed: '',
    age: '',
    coat: '',
    weight: '',
    size: '',
    
    // === OWNER DATA ===
    ownerName: '',
    ownerPhone: '',
    ownerAddress: '',
    ownerNumber: '',
    ownerNeighborhood: '',
    ownerCity: '',
    ownerReference: '',
    
    // === SERVICE TYPE ===
    clinicalGuidance: false,
    returnVisit: false,
    consultation: false,
    treatmentChange: false,
    
    // === HISTORY (ANAMNESIS) ===
    anamnesis: '',
    vaccinations: '',
    vaccinationDate: '',
    deworming: '',
    
    // === CLINICAL EXAMINATION - VITAL SIGNS ===
    rectalTemp: '',
    heartRate: '',
    respiratoryRate: '',
    pulse: '',
    
    // === CLINICAL EXAMINATION - SPECIFIC SYSTEMS ===
    ectoscopy: '',
    abdominalCavity: '',
    headAndNeck: '',
    nervousSystem: '',
    thoracicCavity: '',
    locomotorSystem: '',
    
    // === DIAGNOSIS AND PROGNOSIS ===
    provisionalDiagnosis: '',
    complementaryExams: '',
    definitiveDiagnosis: '',
    prognosis: '',
    
    observations: '',
    instructions: '',
    additionalNotes: '',
  });

  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle client-side mounting for portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Save and restore focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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

  // Load animals list
  useEffect(() => {
    if (isOpen) {
      loadAnimals();
      loadVeterinarian();
    }
  }, [isOpen]);

  const loadAnimals = async () => {
    try {
      setLoadingAnimals(true);
      const animals = await AnimalService.getAll();
      
      // Use Promise.allSettled para não bloquear se houver erros
      const animalsResults = await Promise.allSettled(
        animals.map(async (animal) => {
          try {
            // Não precisa verificar o medical record para listar
            return {
              id: animal.id,
              name: animal.name || 'Sem nome',
              species: animal.species,
              breed: animal.breed,
              gender: animal.gender,
              estimatedAge: animal.estimatedAge,
              sizeWeight: animal.sizeWeight,
              petOwner: animal.petOwner,
            } as AnimalSearchResult;
          } catch (error) {
            console.error(`Erro ao processar animal ${animal.id}:`, error);
            return null;
          }
        })
      );

      const validAnimals = animalsResults
        .filter((result): result is PromiseFulfilledResult<AnimalSearchResult> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      setAnimalsList(validAnimals);
    } catch (error: any) {
      console.error('Error loading animals:', error);
      // Se o erro for 403, aguardar correção do backend
      if (error.message?.includes('403') || error.message?.includes('Acesso negado')) {
        toast.error('Aguardando correção de permissões no backend...');
      } else {
        toast.error('Erro ao carregar lista de animais');
      }
    } finally {
      setLoadingAnimals(false);
    }
  };

  const loadVeterinarian = async () => {
    try {
      const veterinarian = await VeterinarianService.getMe();
      setVeterinarianId(veterinarian.id);
    } catch (error: any) {
      console.error('Error loading veterinarian:', error);
      // Se o erro for 403, aguardar correção do backend
      if (error.message?.includes('403') || error.message?.includes('Acesso negado')) {
        toast.error('Aguardando correção de permissões no backend...');
      } else {
        toast.error('Não foi possível identificar o veterinário');
      }
    }
  };

  const handleAnimalSelect = async (animalId: number) => {
    try {
      setSelectedAnimalId(animalId);
      const animal = animalsList.find(a => a.id === animalId);
      
      if (!animal) return;

      // Auto-populate form with animal data
      setFormData(prev => ({
        ...prev,
        animalName: animal.name,
        breed: animal.breed || '',
        age: animal.estimatedAge,
        weight: animal.sizeWeight,
        size: animal.sizeWeight,
        ownerName: animal.petOwner?.user?.completeName || '',
        ownerPhone: animal.petOwner?.user?.phone || '',
        ownerAddress: animal.petOwner?.fullAddress || '',
      }));

      // Get or create medical record
      try {
        const medRecord = await MedicalRecordService.getByAnimalId(animalId);
        setMedicalRecordId(medRecord.id);
      } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('404')) {
          const newRecord = await MedicalRecordService.create({ animalId });
          setMedicalRecordId(newRecord.id);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error selecting animal:', error);
      toast.error('Erro ao carregar dados do animal');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = async () => {
    if (!medicalRecordId) {
      toast.error('Selecione um animal antes de salvar');
      return;
    }

    if (!veterinarianId) {
      toast.error('Veterinário não identificado');
      return;
    }

    try {
      setLoading(true);

      // Helper para remover campos vazios/undefined/null
      const cleanData = (obj: any) => {
        return Object.entries(obj).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as any);
      };

      // Preparar dados apenas com campos preenchidos
      const rawData: CreateClinicalRecordData = {
        medicalRecordId,
        veterinarianId,
        type: formData.type,
        treatmentDate: formData.treatmentDate || new Date().toISOString(),
        appointmentId: formData.appointmentId,
        fitForSurgery: formData.fitForSurgery,
        surgeryType: formData.surgeryType,
        animalName: formData.animalName,
        breed: formData.breed,
        age: formData.age,
        coat: formData.coat,
        weight: formData.weight,
        size: formData.size,
        ownerName: formData.ownerName,
        ownerPhone: formData.ownerPhone,
        ownerAddress: formData.ownerAddress,
        ownerNumber: formData.ownerNumber,
        ownerNeighborhood: formData.ownerNeighborhood,
        ownerCity: formData.ownerCity,
        ownerReference: formData.ownerReference,
        clinicalGuidance: formData.clinicalGuidance,
        returnVisit: formData.returnVisit,
        consultation: formData.consultation,
        treatmentChange: formData.treatmentChange,
        anamnesis: formData.anamnesis,
        vaccinations: formData.vaccinations,
        vaccinationDate: formData.vaccinationDate,
        deworming: formData.deworming,
        rectalTemp: formData.rectalTemp,
        heartRate: formData.heartRate,
        respiratoryRate: formData.respiratoryRate,
        pulse: formData.pulse,
        ectoscopy: formData.ectoscopy,
        abdominalCavity: formData.abdominalCavity,
        headAndNeck: formData.headAndNeck,
        nervousSystem: formData.nervousSystem,
        thoracicCavity: formData.thoracicCavity,
        locomotorSystem: formData.locomotorSystem,
        provisionalDiagnosis: formData.provisionalDiagnosis,
        complementaryExams: formData.complementaryExams,
        definitiveDiagnosis: formData.definitiveDiagnosis,
        prognosis: formData.prognosis,
        observations: formData.observations,
        instructions: formData.instructions,
        additionalNotes: formData.additionalNotes,
      };

      // Limpar dados vazios antes de enviar
      const clinicalData = cleanData(rawData);

      console.log('💾 Dados ANTES de limpar:', rawData);
      console.log('💾 Dados DEPOIS de limpar:', clinicalData);
      console.log('💾 Enviando para o backend...');
      
      const savedRecord = await ClinicalRecordService.create(clinicalData);
      console.log('✅ Ficha salva no backend:', savedRecord);
      
      toast.success("Ficha clínica salva com sucesso!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving clinical record:', error);
      toast.error(error.message || 'Erro ao salvar ficha clínica');
    } finally {
      setLoading(false);
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
      <div className="bg-gray-100 w-full max-w-6xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header Modal */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <FileText className="text-green-700" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Nova Ficha Clínica</h2>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded text-gray-500" onClick={() => window.print()}>
              <Printer size={20}/>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-gray-500">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Corpo Scrollável */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-200">
          <div className="bg-white shadow-lg border border-gray-300 p-10 mx-auto max-w-[900px] text-gray-900">
            
            {/* SELEÇÃO DE ANIMAL */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Selecionar Animal *
              </label>
              {loadingAnimals ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando animais...
                </div>
              ) : (
                <select
                  value={selectedAnimalId || ''}
                  onChange={(e) => handleAnimalSelect(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um animal</option>
                  {animalsList.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} - {animal.petOwner?.user?.completeName || 'Responsável'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* CABEÇALHO */}
            <div className="flex justify-between items-end border-b-2 border-gray-900 pb-2 mb-6">
              <h1 className="text-xl font-bold">Ficha Clínica</h1>
              <div className="text-right text-[10px] font-bold text-gray-600 uppercase leading-tight">
                <p>Departamento de Medicina Veterinária</p>
                <p>Hospital Veterinário - UFRPE</p>
              </div>
            </div>

            {/* TIPO DE REGISTRO */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Registro *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value={ClinicalRecordType.TRIAGE}>Triagem</option>
                  <option value={ClinicalRecordType.SURGERY}>Cirurgia</option>
                  <option value={ClinicalRecordType.FOLLOW_UP}>Retorno</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Data do Atendimento</label>
                <input
                  type="date"
                  name="treatmentDate"
                  value={formData.treatmentDate?.split('T')[0] || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* CAMPOS CONDICIONAIS */}
            {formData.type === ClinicalRecordType.TRIAGE && (
              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="fitForSurgery"
                    checked={formData.fitForSurgery || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-bold text-gray-700">Animal apto para cirurgia?</span>
                </label>
              </div>
            )}

            {formData.type === ClinicalRecordType.SURGERY && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Cirurgia *</label>
                <select
                  name="surgeryType"
                  value={formData.surgeryType || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione</option>
                  <option value={SurgeryType.ORCHIECTOMY}>Orquiectomia (Macho)</option>
                  <option value={SurgeryType.OVARIOHYSTERECTOMY}>Ovariohisterectomia (Fêmea)</option>
                </select>
              </div>
            )}

            {/* === IDENTIFICAÇÃO DO ANIMAL === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">IDENTIFICAÇÃO DO ANIMAL</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Animal</label>
                  <input
                    type="text"
                    name="animalName"
                    value={formData.animalName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Raça</label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Idade</label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Pelagem</label>
                  <input
                    type="text"
                    name="coat"
                    value={formData.coat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Peso</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Porte</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === DADOS DO TUTOR === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">DADOS DO TUTOR</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Nome do Tutor</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Telefone</label>
                  <input
                    type="text"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Número</label>
                  <input
                    type="text"
                    name="ownerNumber"
                    value={formData.ownerNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Endereço</label>
                  <input
                    type="text"
                    name="ownerAddress"
                    value={formData.ownerAddress}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Bairro</label>
                  <input
                    type="text"
                    name="ownerNeighborhood"
                    value={formData.ownerNeighborhood}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    name="ownerCity"
                    value={formData.ownerCity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    name="ownerReference"
                    value={formData.ownerReference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === TIPO DE ATENDIMENTO === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">TIPO DE ATENDIMENTO</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="clinicalGuidance"
                    checked={formData.clinicalGuidance}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm">Orientação Clínica</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="returnVisit"
                    checked={formData.returnVisit}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm">Retorno</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="consultation"
                    checked={formData.consultation}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm">Consulta</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="treatmentChange"
                    checked={formData.treatmentChange}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm">Alteração Tratamento</span>
                </label>
              </div>
            </div>

            {/* === ANAMNESE === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ANAMNESE</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">História Atual, Tratamento Prévio, Antecedentes</label>
                  <textarea
                    name="anamnesis"
                    value={formData.anamnesis}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Vacinações (Quais)</label>
                    <input
                      type="text"
                      name="vaccinations"
                      value={formData.vaccinations}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Data das Vacinas</label>
                    <input
                      type="text"
                      name="vaccinationDate"
                      value={formData.vaccinationDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Vermifugações</label>
                  <input
                    type="text"
                    name="deworming"
                    value={formData.deworming}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === SINAIS VITAIS === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">SINAIS VITAIS</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Temperatura Retal (°C)</label>
                  <input
                    type="text"
                    name="rectalTemp"
                    value={formData.rectalTemp}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Freq. Cardíaca (/min)</label>
                  <input
                    type="text"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Freq. Respiratória (/min)</label>
                  <input
                    type="text"
                    name="respiratoryRate"
                    value={formData.respiratoryRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Pulso (/min)</label>
                  <input
                    type="text"
                    name="pulse"
                    value={formData.pulse}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === EXAME CLÍNICO - SISTEMAS === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">EXAME CLÍNICO - SISTEMAS</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ectoscopia (Estado geral, mucosas, pele, linfonodos)</label>
                  <textarea
                    name="ectoscopy"
                    value={formData.ectoscopy}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Cavidade Abdominal (Forma, conteúdo, estômago, fígado)</label>
                  <textarea
                    name="abdominalCavity"
                    value={formData.abdominalCavity}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Cabeça e Pescoço (Ouvidos, olhos, nariz, boca)</label>
                  <textarea
                    name="headAndNeck"
                    value={formData.headAndNeck}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Sistema Nervoso (Comportamento, reflexos, paralisias)</label>
                  <textarea
                    name="nervousSystem"
                    value={formData.nervousSystem}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Cavidade Torácica (Palpação, percussão, auscultação)</label>
                  <textarea
                    name="thoracicCavity"
                    value={formData.thoracicCavity}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Sistema Locomotor (Ossos e articulações)</label>
                  <textarea
                    name="locomotorSystem"
                    value={formData.locomotorSystem}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === DIAGNÓSTICO E PROGNÓSTICO === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">DIAGNÓSTICO E PROGNÓSTICO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Diagnóstico Provável</label>
                  <textarea
                    name="provisionalDiagnosis"
                    value={formData.provisionalDiagnosis}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Exames Complementares</label>
                  <textarea
                    name="complementaryExams"
                    value={formData.complementaryExams}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Diagnóstico Definitivo</label>
                  <textarea
                    name="definitiveDiagnosis"
                    value={formData.definitiveDiagnosis}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Prognóstico</label>
                  <textarea
                    name="prognosis"
                    value={formData.prognosis}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === OBSERVAÇÕES E INSTRUÇÕES === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">OBSERVAÇÕES E INSTRUÇÕES</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Observações Gerais</label>
                  <textarea
                    name="observations"
                    value={formData.observations}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Prescrições e Instruções</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Observações Adicionais / Descrição Livre</label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200" 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-8 py-2 rounded-lg text-sm font-bold text-white bg-green-700 hover:bg-green-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading || !medicalRecordId}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            {loading ? 'Salvando...' : 'Salvar Ficha'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
