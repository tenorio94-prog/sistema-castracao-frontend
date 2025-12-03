"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Syringe, Loader2, Search, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AnestheticRecordService, {
  AsaClassification,
  AnestheticRisk,
  RecoveryQuality,
  MedicationPhase,
  CreateAnestheticRecordData,
  AnestheticMedication,
  AnestheticMonitoring,
  ASA_CLASSIFICATION_LABELS,
  ANESTHETIC_RISK_LABELS,
  RECOVERY_QUALITY_LABELS,
  MEDICATION_PHASE_LABELS
} from '@/services/anesthetic-record.service';
import { MedicalRecordService } from '@/services/medical-record.service';
import { AnimalService, SPECIES_LABELS } from '@/services/animal.service';
import { VeterinarianService } from '@/services/veterinarian.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AnimalSearchItem {
  id: number;
  name: string;
  species: string;
  ownerName: string;
  fullData: any;
}

export default function FichaAnestesicaModal({ isOpen, onClose, onSuccess }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados de Busca/Seleção
  const [animalsList, setAnimalsList] = useState<AnimalSearchItem[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [showAnimalSearch, setShowAnimalSearch] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  
  // IDs de relacionamento
  const [medicalRecordId, setMedicalRecordId] = useState<number>(0);
  const [anesthetistId, setAnesthetistId] = useState<number>(0);

  // Estado inicial do formulário
  const getInitialFormData = () => ({
    medicalRecordId: 0,
    anesthetistId: 0,
    
    // Identificação (snapshot)
    animalName: '',
    species: '',
    breed: '',
    weight: '',
    age: '',
    procedure: '',
    surgeonId: undefined as number | undefined,
    
    // Avaliação de Risco
    asaClassification: undefined as AsaClassification | undefined,
    anestheticRisk: undefined as AnestheticRisk | undefined,
    
    // Avaliação Pré-Anestésica
    preHeartRate: '',
    preRespiratoryRate: '',
    preMucousMembranes: '',
    preCapillaryRefill: '',
    preTemperature: '',
    comorbidities: '',
    allergies: '',
    
    // Via Aérea
    intubation: false,
    tubeNumber: '',
    circuit: '',
    
    // Manutenção
    maintenanceInhalation: false,
    maintenanceTIVA: false,
    
    // Recuperação
    extubationTime: '',
    recoveryQuality: undefined as RecoveryQuality | undefined,
    postoperativeMedication: '',
    generalObservations: '',
    
    // Medicações e Monitoramento (arrays)
    medications: [] as AnestheticMedication[],
    monitoring: [] as AnestheticMonitoring[]
  });

  const [formData, setFormData] = useState(getInitialFormData());

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadInitialData();
    } else {
      document.body.style.overflow = '';
      resetForm();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const resetForm = () => {
    setFormData(getInitialFormData());
    setSelectedAnimal(null);
    setMedicalRecordId(0);
    setShowAnimalSearch(false);
  };

  const loadInitialData = async () => {
    try {
      setLoadingAnimals(true);
      
      // 1. Identificar Veterinário Logado
      const vet = await VeterinarianService.getMe();
      setAnesthetistId(vet.id);

      // 2. Carregar Animais
      const animals = await AnimalService.getAll();
      const formatted = animals.map((a: any) => ({
        id: a.id,
        name: a.name || 'Sem Nome',
        species: a.species,
        ownerName: a.petOwner?.user?.completeName || 'Tutor Desconhecido',
        fullData: a
      }));
      setAnimalsList(formatted);

    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error("Erro ao carregar dados.");
      onClose();
    } finally {
      setLoadingAnimals(false);
    }
  };

  const handleSelectAnimal = async (animalItem: AnimalSearchItem) => {
    const animal = animalItem.fullData;
    setSelectedAnimal(animal);
    setShowAnimalSearch(false);

    // Preencher dados do animal (snapshot)
    setFormData(prev => ({
      ...prev,
      animalName: animal.name || '',
      species: SPECIES_LABELS[animal.species as keyof typeof SPECIES_LABELS] || animal.species,
      breed: animal.breed || 'SRD',
      age: animal.estimatedAge || '',
      weight: animal.sizeWeight || ''
    }));

    // Buscar ou criar prontuário médico
    try {
      const loadingToast = toast.loading("Verificando prontuário médico...");
      
      try {
        const record = await MedicalRecordService.findByAnimal(animal.id);
        setMedicalRecordId(record.id);
        setFormData(prev => ({ ...prev, medicalRecordId: record.id }));
        toast.dismiss(loadingToast);
        toast.success("Prontuário médico encontrado!", { duration: 2000 });
      } catch (e: any) {
        if (e.message?.includes('not found') || e.message?.includes('Medical record not found')) {
          const newRecord = await MedicalRecordService.create({ animalId: animal.id });
          setMedicalRecordId(newRecord.id);
          setFormData(prev => ({ ...prev, medicalRecordId: newRecord.id }));
          toast.dismiss(loadingToast);
          toast.success("Prontuário médico criado automaticamente!", { duration: 2000 });
        } else {
          throw e;
        }
      }
    } catch (error: any) {
      console.error('Erro ao vincular prontuário:', error);
      toast.error("Erro ao vincular prontuário médico.");
      setMedicalRecordId(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  // === MEDICAÇÕES ===
  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        phase: MedicationPhase.MPA,
        drugName: '',
        dosage: '',
        route: '',
        administrationTime: ''
      }]
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: keyof AnestheticMedication, value: any) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  // === MONITORAMENTO ===
  const addMonitoring = () => {
    setFormData(prev => ({
      ...prev,
      monitoring: [...prev.monitoring, {
        measurementTime: '',
        agent: '',
        heartRate: '',
        respiratoryRate: '',
        spo2: '',
        etco2: '',
        systolicPressure: '',
        diastolicPressure: '',
        temperature: ''
      }]
    }));
  };

  const removeMonitoring = (index: number) => {
    setFormData(prev => ({
      ...prev,
      monitoring: prev.monitoring.filter((_, i) => i !== index)
    }));
  };

  const updateMonitoring = (index: number, field: keyof AnestheticMonitoring, value: string) => {
    setFormData(prev => ({
      ...prev,
      monitoring: prev.monitoring.map((mon, i) => 
        i === index ? { ...mon, [field]: value } : mon
      )
    }));
  };

  const handleSubmit = async () => {
    // Validações
    if (!medicalRecordId) {
      toast.warning("Selecione um animal primeiro.");
      return;
    }
    if (!anesthetistId) {
      toast.error("Anestesista não identificado.");
      return;
    }
    if (!formData.animalName?.trim()) {
      toast.warning("Nome do animal é obrigatório.");
      return;
    }

    try {
      setSaving(true);

      // Helper: converte string vazia para undefined
      const emptyToUndefined = (value?: string) => value?.trim() ? value.trim() : undefined;

      // Payload alinhado com o backend
      const payload: CreateAnestheticRecordData = {
        medicalRecordId,
        anesthetistId,
        
        // Identificação
        animalName: emptyToUndefined(formData.animalName),
        species: emptyToUndefined(formData.species),
        breed: emptyToUndefined(formData.breed),
        weight: emptyToUndefined(formData.weight),
        age: emptyToUndefined(formData.age),
        procedure: emptyToUndefined(formData.procedure),
        surgeonId: formData.surgeonId || undefined,
        
        // Avaliação de Risco
        asaClassification: formData.asaClassification || undefined,
        anestheticRisk: formData.anestheticRisk || undefined,
        
        // Avaliação Pré-Anestésica
        preHeartRate: emptyToUndefined(formData.preHeartRate),
        preRespiratoryRate: emptyToUndefined(formData.preRespiratoryRate),
        preMucousMembranes: emptyToUndefined(formData.preMucousMembranes),
        preCapillaryRefill: emptyToUndefined(formData.preCapillaryRefill),
        preTemperature: emptyToUndefined(formData.preTemperature),
        comorbidities: emptyToUndefined(formData.comorbidities),
        allergies: emptyToUndefined(formData.allergies),
        
        // Via Aérea
        intubation: formData.intubation || undefined,
        tubeNumber: emptyToUndefined(formData.tubeNumber),
        circuit: emptyToUndefined(formData.circuit),
        
        // Manutenção
        maintenanceInhalation: formData.maintenanceInhalation || undefined,
        maintenanceTIVA: formData.maintenanceTIVA || undefined,
        
        // Recuperação
        extubationTime: formData.extubationTime ? new Date(formData.extubationTime).toISOString() : undefined,
        recoveryQuality: formData.recoveryQuality || undefined,
        postoperativeMedication: emptyToUndefined(formData.postoperativeMedication),
        generalObservations: emptyToUndefined(formData.generalObservations),
        
        // Medicações e Monitoramento (apenas se tiverem dados)
        medications: formData.medications.length > 0 ? formData.medications : undefined,
        monitoring: formData.monitoring.length > 0 ? formData.monitoring : undefined
      };

      await AnestheticRecordService.create(payload);
      
      toast.success("Ficha Anestésica salva com sucesso!");
      if (onSuccess) onSuccess();
      onClose();

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      const errorMsg = error.response?.data?.message || error.message || "Erro ao salvar ficha.";
      
      if (Array.isArray(errorMsg)) {
        toast.error(errorMsg[0]);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in">
      <div className="bg-gray-100 w-full max-w-7xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Syringe className="text-blue-700" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Nova Ficha Anestésica</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <X size={24}/>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="bg-white shadow-sm border border-gray-300 p-8 mx-auto max-w-6xl rounded-sm">
            
            {/* Cabeçalho do Documento */}
            <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-800 uppercase">Ficha Anestésica</h1>
              <div className="text-right text-[10px] font-bold text-gray-500 uppercase leading-tight">
                <p>Hospital Veterinário</p>
                <p>Departamento de Anestesiologia</p>
              </div>
            </div>

            {/* SELEÇÃO DO ANIMAL */}
            <div className="mb-8 relative">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paciente</label>
              <button 
                onClick={() => setShowAnimalSearch(!showAnimalSearch)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded text-left hover:border-blue-400 transition-colors"
              >
                <span className="font-bold text-blue-900 flex items-center gap-2">
                  <Search size={16}/>
                  {formData.animalName ? `${formData.animalName} (${formData.species})` : "Selecionar Paciente..."}
                </span>
                <span className="text-xs text-blue-500">▼</span>
              </button>

              {showAnimalSearch && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 shadow-xl max-h-60 overflow-y-auto z-10 rounded">
                  {loadingAnimals ? (
                    <div className="p-4 text-center text-sm text-gray-500">Carregando...</div>
                  ) : (
                    animalsList.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => handleSelectAnimal(item)}
                        className="p-3 border-b hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <p className="font-bold text-gray-800">{item.name} <span className="text-xs text-blue-600">({SPECIES_LABELS[item.species as keyof typeof SPECIES_LABELS] || item.species})</span></p>
                        <p className="text-xs text-gray-500">Tutor: {item.ownerName}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 1. IDENTIFICAÇÃO E PROCEDIMENTO */}
            <SectionTitle title="Identificação e Procedimento" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Input label="Animal" name="animalName" value={formData.animalName || ''} onChange={handleChange} readOnly />
              <Input label="Espécie" name="species" value={formData.species || ''} onChange={handleChange} readOnly />
              <Input label="Raça" name="breed" value={formData.breed || ''} onChange={handleChange} />
              <Input label="Peso (kg)" name="weight" value={formData.weight || ''} onChange={handleChange} />
              <Input label="Idade" name="age" value={formData.age || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input label="Procedimento" name="procedure" value={formData.procedure || ''} onChange={handleChange} placeholder="Ex: Ovariohisterectomia" />
            </div>

            {/* 2. AVALIAÇÃO DE RISCO */}
            <SectionTitle title="Avaliação de Risco" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Classificação ASA</label>
                <select 
                  name="asaClassification" 
                  value={formData.asaClassification || ''} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">Selecione...</option>
                  {Object.values(AsaClassification).map(asa => (
                    <option key={asa} value={asa}>{ASA_CLASSIFICATION_LABELS[asa]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Risco Anestésico</label>
                <select 
                  name="anestheticRisk" 
                  value={formData.anestheticRisk || ''} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">Selecione...</option>
                  {Object.values(AnestheticRisk).map(risk => (
                    <option key={risk} value={risk}>{ANESTHETIC_RISK_LABELS[risk]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. AVALIAÇÃO PRÉ-ANESTÉSICA */}
            <SectionTitle title="Avaliação Pré-Anestésica (Sinais Vitais)" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <Input label="FC (/min)" name="preHeartRate" value={formData.preHeartRate || ''} onChange={handleChange} />
              <Input label="fR (/min)" name="preRespiratoryRate" value={formData.preRespiratoryRate || ''} onChange={handleChange} />
              <Input label="Mucosas" name="preMucousMembranes" value={formData.preMucousMembranes || ''} onChange={handleChange} />
              <Input label="TPC (seg)" name="preCapillaryRefill" value={formData.preCapillaryRefill || ''} onChange={handleChange} />
              <Input label="Temp (°C)" name="preTemperature" value={formData.preTemperature || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <TextArea label="Comorbidades" name="comorbidities" value={formData.comorbidities || ''} onChange={handleChange} rows={2} />
              <TextArea label="Alergias" name="allergies" value={formData.allergies || ''} onChange={handleChange} rows={2} />
            </div>

            {/* 4. VIA AÉREA */}
            <SectionTitle title="Via Aérea" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-blue-50 rounded">
                <input 
                  type="checkbox" 
                  name="intubation" 
                  checked={!!formData.intubation} 
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Intubação</span>
              </label>
              <Input label="Sonda Nº" name="tubeNumber" value={formData.tubeNumber || ''} onChange={handleChange} />
              <Input label="Circuito" name="circuit" value={formData.circuit || ''} onChange={handleChange} />
            </div>

            {/* 5. MANUTENÇÃO */}
            <SectionTitle title="Tipo de Manutenção" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-blue-50 rounded">
                <input 
                  type="checkbox" 
                  name="maintenanceInhalation" 
                  checked={!!formData.maintenanceInhalation} 
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Inalatória</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-blue-50 rounded">
                <input 
                  type="checkbox" 
                  name="maintenanceTIVA" 
                  checked={!!formData.maintenanceTIVA} 
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">TIVA (Total Intravenosa)</span>
              </label>
            </div>

            {/* 6. MEDICAÇÕES (MPA E INDUÇÃO) */}
            <SectionTitle title="Medicações (MPA e Indução)" />
            <div className="mb-4">
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Adicionar Medicação
              </button>
            </div>
            {formData.medications.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-3 p-4 bg-blue-50 rounded border border-blue-200">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Fase</label>
                  <select
                    value={med.phase}
                    onChange={(e) => updateMedication(index, 'phase', e.target.value as MedicationPhase)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  >
                    {Object.values(MedicationPhase).map(phase => (
                      <option key={phase} value={phase}>{MEDICATION_PHASE_LABELS[phase]}</option>
                    ))}
                  </select>
                </div>
                <Input 
                  label="Fármaco" 
                  value={med.drugName} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMedication(index, 'drugName', e.target.value)} 
                />
                <Input 
                  label="Dose" 
                  value={med.dosage} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMedication(index, 'dosage', e.target.value)} 
                />
                <Input 
                  label="Via" 
                  value={med.route} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMedication(index, 'route', e.target.value)} 
                />
                <Input 
                  label="Hora" 
                  value={med.administrationTime} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMedication(index, 'administrationTime', e.target.value)} 
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* 7. MONITORAMENTO TRANSOPERATÓRIO */}
            <SectionTitle title="Monitoramento Transoperatório" />
            <div className="mb-4">
              <button
                type="button"
                onClick={addMonitoring}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Adicionar Registro de Monitoramento
              </button>
            </div>
            {formData.monitoring.map((mon, index) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 p-4 bg-green-50 rounded border border-green-200">
                <Input 
                  label="Hora" 
                  value={mon.measurementTime} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'measurementTime', e.target.value)} 
                />
                <Input 
                  label="Agente" 
                  value={mon.agent || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'agent', e.target.value)} 
                />
                <Input 
                  label="FC" 
                  value={mon.heartRate || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'heartRate', e.target.value)} 
                />
                <Input 
                  label="fR" 
                  value={mon.respiratoryRate || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'respiratoryRate', e.target.value)} 
                />
                <Input 
                  label="SpO2 (%)" 
                  value={mon.spo2 || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'spo2', e.target.value)} 
                />
                <Input 
                  label="EtCO2" 
                  value={mon.etco2 || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'etco2', e.target.value)} 
                />
                <Input 
                  label="PAS (mmHg)" 
                  value={mon.systolicPressure || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'systolicPressure', e.target.value)} 
                />
                <Input 
                  label="PAD (mmHg)" 
                  value={mon.diastolicPressure || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'diastolicPressure', e.target.value)} 
                />
                <Input 
                  label="Temp (°C)" 
                  value={mon.temperature || ''} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMonitoring(index, 'temperature', e.target.value)} 
                />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeMonitoring(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* 8. RECUPERAÇÃO */}
            <SectionTitle title="Recuperação e Pós-Operatório" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input 
                label="Hora da Extubação" 
                type="datetime-local" 
                name="extubationTime" 
                value={formData.extubationTime || ''} 
                onChange={handleChange} 
              />
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Qualidade da Recuperação</label>
                <select 
                  name="recoveryQuality" 
                  value={formData.recoveryQuality || ''} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                  <option value="">Selecione...</option>
                  {Object.values(RecoveryQuality).map(quality => (
                    <option key={quality} value={quality}>{RECOVERY_QUALITY_LABELS[quality]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <TextArea 
                label="Medicação Pós-Cirúrgica" 
                name="postoperativeMedication" 
                value={formData.postoperativeMedication || ''} 
                onChange={handleChange} 
                rows={3} 
              />
              <TextArea 
                label="Observações Gerais / Intercorrências" 
                name="generalObservations" 
                value={formData.generalObservations || ''} 
                onChange={handleChange} 
                rows={4} 
              />
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
            onClick={handleSubmit}
            disabled={saving || !medicalRecordId}
            className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Salvando..." : "Salvar Ficha"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}

// Componentes UI Auxiliares
const SectionTitle = ({ title }: { title: string }) => (
  <div className="border-b border-gray-200 pb-1 mb-4 mt-6">
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
  </div>
);

const Input = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">{label}</label>
    <input 
      {...props}
      className="w-full border-b border-gray-300 bg-transparent px-1 py-1 text-sm text-gray-900 focus:border-blue-600 focus:outline-none placeholder:text-gray-300 transition-colors"
    />
  </div>
);

const TextArea = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">{label}</label>
    <textarea 
      {...props}
      className="w-full border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm text-gray-800 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all resize-none"
    />
  </div>
);
