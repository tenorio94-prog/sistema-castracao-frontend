"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Printer, Syringe, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AnestheticRecordService, {
  AsaClassification,
  AnestheticRisk,
  RecoveryQuality,
  MedicationPhase,
  CreateAnestheticRecordData,
  AnestheticMedication,
  AnestheticMonitoring,
} from '@/services/anesthetic-record.service';
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

export default function FichaAnestesicaModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [animalsList, setAnimalsList] = useState<AnimalSearchResult[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  const [medicalRecordId, setMedicalRecordId] = useState<number | null>(null);
  const [anesthetistId, setAnesthetistId] = useState<number | null>(null);
  
  // Form data principal
  const [formData, setFormData] = useState<CreateAnestheticRecordData>({
    medicalRecordId: 0,
    
    // Identification
    animalName: '',
    species: '',
    breed: '',
    weight: '',
    age: '',
    procedure: '',
    surgeonId: undefined,
    
    // Risk Assessment
    asaClassification: undefined,
    anestheticRisk: undefined,
    
    // Pre-anesthetic Evaluation
    preHeartRate: '',
    preRespiratoryRate: '',
    preMucousMembranes: '',
    preCapillaryRefill: '',
    preTemperature: '',
    comorbidities: '',
    allergies: '',
    
    // Airway
    intubation: false,
    tubeNumber: '',
    circuit: '',
    
    // Maintenance
    maintenanceInhalation: false,
    maintenanceTIVA: false,
    
    // Recovery
    extubationTime: '',
    recoveryQuality: undefined,
    postoperativeMedication: '',
    generalObservations: '',
    
    medications: [],
    monitoring: [],
  });

  // Medications state
  const [medications, setMedications] = useState<AnestheticMedication[]>([]);
  
  // Monitoring state
  const [monitoring, setMonitoring] = useState<AnestheticMonitoring[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Save and restore focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll
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

  // Load data
  useEffect(() => {
    if (isOpen) {
      loadAnimals();
      loadAnesthetist();
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

  const loadAnesthetist = async () => {
    try {
      const veterinarian = await VeterinarianService.getMe();
      setAnesthetistId(veterinarian.id);
    } catch (error: any) {
      console.error('Error loading anesthetist:', error);
      // Se o erro for 403, aguardar correção do backend
      if (error.message?.includes('403') || error.message?.includes('Acesso negado')) {
        toast.error('Aguardando correção de permissões no backend...');
      } else {
        toast.error('Não foi possível identificar o anestesista');
      }
    }
  };

  const handleAnimalSelect = async (animalId: number) => {
    try {
      setSelectedAnimalId(animalId);
      const animal = animalsList.find(a => a.id === animalId);
      
      if (!animal) return;

      // Auto-populate form
      setFormData(prev => ({
        ...prev,
        animalName: animal.name,
        species: animal.species,
        breed: animal.breed || '',
        age: animal.estimatedAge,
        weight: animal.sizeWeight,
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

  // Medication handlers
  const addMedication = () => {
    setMedications([...medications, {
      phase: MedicationPhase.MPA,
      drugName: '',
      dosage: '',
      route: '',
      administrationTime: '',
    }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof AnestheticMedication, value: any) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  // Monitoring handlers
  const addMonitoring = () => {
    setMonitoring([...monitoring, {
      measurementTime: '',
      agent: '',
      heartRate: '',
      respiratoryRate: '',
      spo2: '',
      etco2: '',
      systolicPressure: '',
      diastolicPressure: '',
      temperature: '',
    }]);
  };

  const removeMonitoring = (index: number) => {
    setMonitoring(monitoring.filter((_, i) => i !== index));
  };

  const updateMonitoring = (index: number, field: keyof AnestheticMonitoring, value: any) => {
    const updated = [...monitoring];
    updated[index] = { ...updated[index], [field]: value };
    setMonitoring(updated);
  };

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = async () => {
    if (!medicalRecordId) {
      toast.error('Selecione um animal antes de salvar');
      return;
    }

    if (!anesthetistId) {
      toast.error('Anestesista não identificado');
      return;
    }

    try {
      setLoading(true);

      const anestheticData: CreateAnestheticRecordData = {
        ...formData,
        medicalRecordId,
        anesthetistId,
        medications: medications.length > 0 ? medications : undefined,
        monitoring: monitoring.length > 0 ? monitoring : undefined,
      };

      await AnestheticRecordService.create(anestheticData);
      toast.success("Ficha anestésica salva com sucesso!");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving anesthetic record:', error);
      toast.error(error.message || 'Erro ao salvar ficha anestésica');
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
      <div className="bg-gray-100 w-full max-w-7xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <Syringe className="text-purple-700" size={24} />
            <h2 className="text-lg font-bold text-gray-900">Nova Ficha Anestésica</h2>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-200">
          <div className="bg-white shadow-lg border border-gray-300 p-10 mx-auto max-w-[1200px] text-gray-900">
            
            {/* SELEÇÃO DE ANIMAL */}
            <div className="mb-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
              <h1 className="text-xl font-bold">Ficha Anestésica</h1>
              <div className="text-right text-[10px] font-bold text-gray-600 uppercase leading-tight">
                <p>Departamento de Medicina Veterinária</p>
                <p>Hospital Veterinário - UFRPE</p>
              </div>
            </div>

            {/* === IDENTIFICAÇÃO DO PACIENTE === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">IDENTIFICAÇÃO DO PACIENTE</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-xs font-bold text-gray-600 mb-1">Espécie</label>
                  <input
                    type="text"
                    name="species"
                    value={formData.species}
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
                  <label className="block text-xs font-bold text-gray-600 mb-1">Peso (kg)</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
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
                  <label className="block text-xs font-bold text-gray-600 mb-1">Procedimento</label>
                  <input
                    type="text"
                    name="procedure"
                    value={formData.procedure}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === AVALIAÇÃO DE RISCO === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">AVALIAÇÃO DE RISCO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Classificação ASA</label>
                  <select
                    name="asaClassification"
                    value={formData.asaClassification || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione</option>
                    <option value={AsaClassification.ASA_I}>ASA I - Paciente saudável</option>
                    <option value={AsaClassification.ASA_II}>ASA II - Doença sistêmica leve</option>
                    <option value={AsaClassification.ASA_III}>ASA III - Doença sistêmica grave</option>
                    <option value={AsaClassification.ASA_IV}>ASA IV - Doença sistêmica grave com risco de vida</option>
                    <option value={AsaClassification.ASA_V}>ASA V - Moribundo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Risco Anestésico</label>
                  <select
                    name="anestheticRisk"
                    value={formData.anestheticRisk || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione</option>
                    <option value={AnestheticRisk.MILD}>Leve</option>
                    <option value={AnestheticRisk.MODERATE}>Moderado</option>
                    <option value={AnestheticRisk.HIGH}>Alto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* === AVALIAÇÃO PRÉ-ANESTÉSICA === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">AVALIAÇÃO PRÉ-ANESTÉSICA (SINAIS VITAIS)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">FC (/min)</label>
                  <input
                    type="text"
                    name="preHeartRate"
                    value={formData.preHeartRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">fR (/min)</label>
                  <input
                    type="text"
                    name="preRespiratoryRate"
                    value={formData.preRespiratoryRate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Mucosas</label>
                  <input
                    type="text"
                    name="preMucousMembranes"
                    value={formData.preMucousMembranes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">TPC (seg)</label>
                  <input
                    type="text"
                    name="preCapillaryRefill"
                    value={formData.preCapillaryRefill}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Temp (°C)</label>
                  <input
                    type="text"
                    name="preTemperature"
                    value={formData.preTemperature}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Comorbidades</label>
                  <textarea
                    name="comorbidities"
                    value={formData.comorbidities}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Alergias</label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === VIAS AÉREAS === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">VIAS AÉREAS</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="intubation"
                      checked={formData.intubation}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm font-bold text-gray-700">Intubação</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Sonda Nº</label>
                  <input
                    type="text"
                    name="tubeNumber"
                    value={formData.tubeNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Circuito</label>
                  <input
                    type="text"
                    name="circuit"
                    value={formData.circuit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* === MANUTENÇÃO === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">TIPO DE MANUTENÇÃO</h3>
              <div className="flex gap-8">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="maintenanceInhalation"
                    checked={formData.maintenanceInhalation}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">Inalatória</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="maintenanceTIVA"
                    checked={formData.maintenanceTIVA}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">TIVA</span>
                </label>
              </div>
            </div>

            {/* === MEDICAÇÕES (MPA E INDUÇÃO) === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">MEDICAÇÕES (MPA E INDUÇÃO)</h3>
                <button
                  onClick={addMedication}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold"
                >
                  <Plus size={16} />
                  Adicionar Medicação
                </button>
              </div>
              {medications.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nenhuma medicação adicionada</p>
              ) : (
                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-bold text-gray-700">Medicação #{index + 1}</span>
                        <button
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Fase</label>
                          <select
                            value={med.phase}
                            onChange={(e) => updateMedication(index, 'phase', e.target.value as MedicationPhase)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          >
                            <option value={MedicationPhase.MPA}>MPA</option>
                            <option value={MedicationPhase.INDUCTION}>Indução</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Fármaco</label>
                          <input
                            type="text"
                            value={med.drugName}
                            onChange={(e) => updateMedication(index, 'drugName', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Dose</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Via</label>
                          <input
                            type="text"
                            value={med.route}
                            onChange={(e) => updateMedication(index, 'route', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">Hora</label>
                          <input
                            type="text"
                            value={med.administrationTime}
                            onChange={(e) => updateMedication(index, 'administrationTime', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* === MONITORAMENTO (GRID TEMPORAL) === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">MONITORAMENTO (GRID TEMPORAL)</h3>
                <button
                  onClick={addMonitoring}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-bold"
                >
                  <Plus size={16} />
                  Adicionar Leitura
                </button>
              </div>
              {monitoring.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nenhuma leitura de monitoramento adicionada</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 py-1">Hora</th>
                        <th className="border border-gray-300 px-2 py-1">Agente</th>
                        <th className="border border-gray-300 px-2 py-1">FC</th>
                        <th className="border border-gray-300 px-2 py-1">fR</th>
                        <th className="border border-gray-300 px-2 py-1">SpO2</th>
                        <th className="border border-gray-300 px-2 py-1">EtCO2</th>
                        <th className="border border-gray-300 px-2 py-1">PAS</th>
                        <th className="border border-gray-300 px-2 py-1">PAD</th>
                        <th className="border border-gray-300 px-2 py-1">Temp</th>
                        <th className="border border-gray-300 px-2 py-1">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitoring.map((mon, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.measurementTime}
                              onChange={(e) => updateMonitoring(index, 'measurementTime', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                              placeholder="00:00"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.agent}
                              onChange={(e) => updateMonitoring(index, 'agent', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.heartRate}
                              onChange={(e) => updateMonitoring(index, 'heartRate', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.respiratoryRate}
                              onChange={(e) => updateMonitoring(index, 'respiratoryRate', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.spo2}
                              onChange={(e) => updateMonitoring(index, 'spo2', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.etco2}
                              onChange={(e) => updateMonitoring(index, 'etco2', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.systolicPressure}
                              onChange={(e) => updateMonitoring(index, 'systolicPressure', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.diastolicPressure}
                              onChange={(e) => updateMonitoring(index, 'diastolicPressure', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1">
                            <input
                              type="text"
                              value={mon.temperature}
                              onChange={(e) => updateMonitoring(index, 'temperature', e.target.value)}
                              className="w-full px-1 py-0.5 border-0 text-xs"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-1 text-center">
                            <button
                              onClick={() => removeMonitoring(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* === RECUPERAÇÃO E PÓS-OPERATÓRIO === */}
            <div className="border-t-2 border-gray-300 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">RECUPERAÇÃO E PÓS-OPERATÓRIO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Hora de Extubação</label>
                  <input
                    type="datetime-local"
                    name="extubationTime"
                    value={formData.extubationTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Qualidade da Recuperação</label>
                  <select
                    name="recoveryQuality"
                    value={formData.recoveryQuality || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione</option>
                    <option value={RecoveryQuality.RAPID_SMOOTH}>Rápida/Suave</option>
                    <option value={RecoveryQuality.SLOW}>Lenta</option>
                    <option value={RecoveryQuality.AGITATED_EXCITEMENT}>Agitada/Excitação</option>
                    <option value={RecoveryQuality.VOCALIZATION_PAIN}>Vocalização/Dor</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Medicação Pós-Cirúrgica</label>
                  <textarea
                    name="postoperativeMedication"
                    value={formData.postoperativeMedication}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Observações Gerais / Intercorrências</label>
                  <textarea
                    name="generalObservations"
                    value={formData.generalObservations}
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
            className="px-8 py-2 rounded-lg text-sm font-bold text-white bg-purple-700 hover:bg-purple-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
