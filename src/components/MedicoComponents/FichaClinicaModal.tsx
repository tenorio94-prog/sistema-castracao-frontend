"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, FileText, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import ClinicalRecordService, { 
  ClinicalRecord, 
  ClinicalRecordType, 
  SurgeryType, 
  CreateClinicalRecordData
} from '@/services/clinical-record.service';
import { MedicalRecordService } from '@/services/medical-record.service';
import { AnimalService, SPECIES_LABELS } from '@/services/animal.service';
import { VeterinarianService } from '@/services/veterinarian.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: ClinicalRecord;
}

interface AnimalSearchItem {
  id: number;
  name: string;
  species: string;
  ownerName: string;
  fullData: any;
}

// Interface do formulário - inclui 'species' apenas para display (NÃO enviado ao backend)
interface ClinicalRecordFormData {
  // Campos do backend
  type: ClinicalRecordType;
  treatmentDate: string;
  fitForSurgery?: boolean;
  surgeryType?: SurgeryType;
  
  // Snapshot Animal
  animalName?: string;
  breed?: string;
  age?: string;
  coat?: string;
  weight?: string;
  size?: string;
  
  // Snapshot Tutor
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  ownerNumber?: string;
  ownerNeighborhood?: string;
  ownerCity?: string;
  ownerReference?: string;
  
  // Serviços
  clinicalGuidance?: boolean;
  returnVisit?: boolean;
  consultation?: boolean;
  treatmentChange?: boolean;
  
  // Anamnese
  anamnesis?: string;
  vaccinations?: string;
  vaccinationDate?: string;
  deworming?: string;
  
  // Sinais Vitais
  rectalTemp?: string;
  heartRate?: string;
  respiratoryRate?: string;
  pulse?: string;
  
  // Exame Físico
  ectoscopy?: string;
  abdominalCavity?: string;
  headAndNeck?: string;
  nervousSystem?: string;
  thoracicCavity?: string;
  locomotorSystem?: string;
  
  // Diagnóstico
  provisionalDiagnosis?: string;
  complementaryExams?: string;
  definitiveDiagnosis?: string;
  prognosis?: string;
  
  // Observações
  observations?: string;
  instructions?: string;
  additionalNotes?: string;
  
  // Campo APENAS para display (NÃO enviado ao backend)
  species?: string;
}

export default function FichaClinicaModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados de Busca/Seleção
  const [animalsList, setAnimalsList] = useState<AnimalSearchItem[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(false);
  const [showAnimalSearch, setShowAnimalSearch] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null);
  
  // IDs de relacionamento
  const [medicalRecordId, setMedicalRecordId] = useState<number>(0);
  const [veterinarianId, setVeterinarianId] = useState<number>(0);

  // Estado inicial do formulário
  const getInitialFormData = (): ClinicalRecordFormData => ({
    type: ClinicalRecordType.triage,
    treatmentDate: new Date().toISOString().split('T')[0],
    fitForSurgery: false,
    clinicalGuidance: false,
    returnVisit: false,
    consultation: false,
    treatmentChange: false,
    animalName: '',
    breed: '',
    age: '',
    coat: '',
    weight: '',
    size: '',
    ownerName: '',
    ownerPhone: '',
    ownerAddress: '',
    ownerNumber: '',
    ownerNeighborhood: '',
    ownerCity: '',
    ownerReference: '',
    anamnesis: '',
    vaccinations: '',
    vaccinationDate: '',
    deworming: '',
    rectalTemp: '',
    heartRate: '',
    respiratoryRate: '',
    pulse: '',
    ectoscopy: '',
    abdominalCavity: '',
    headAndNeck: '',
    nervousSystem: '',
    thoracicCavity: '',
    locomotorSystem: '',
    provisionalDiagnosis: '',
    complementaryExams: '',
    definitiveDiagnosis: '',
    prognosis: '',
    observations: '',
    instructions: '',
    additionalNotes: '',
    species: ''
  });

  const [formData, setFormData] = useState<ClinicalRecordFormData>(getInitialFormData());

  useEffect(() => { setIsMounted(true); }, []);

  // Carregar dados iniciais ao abrir e limpar ao fechar
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
      setVeterinarianId(vet.id);

      // 2. Carregar Animais com seus tutores
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
      toast.error("Erro ao carregar dados. Verifique se você é um veterinário.");
      onClose();
    } finally {
      setLoadingAnimals(false);
    }
  };

  const handleSelectAnimal = async (animalItem: AnimalSearchItem) => {
    const animal = animalItem.fullData;
    setSelectedAnimal(animal);
    setShowAnimalSearch(false);

    // 1. Preencher Snapshot (Dados Históricos) - Todos os campos do Schema
    setFormData(prev => ({
      ...prev,
      species: animal.species, // Espécie do animal
      animalName: animal.name || 'Sem nome',
      breed: animal.breed || 'SRD',
      age: animal.estimatedAge || '',
      coat: '', // Campo não está no Animal, pode ser preenchido manualmente
      weight: animal.sizeWeight || '',
      size: animal.sizeWeight || '',
      ownerName: animal.petOwner?.user?.completeName || '',
      ownerPhone: animal.petOwner?.user?.phone || '',
      ownerAddress: animal.petOwner?.fullAddress || '',
      ownerNumber: '', // Precisa ser extraído ou preenchido manualmente
      ownerNeighborhood: '', // Precisa ser extraído ou preenchido manualmente
      ownerCity: '', // Precisa ser extraído ou preenchido manualmente
      ownerReference: '', // Precisa ser preenchido manualmente
    }));

    // 2. Resolver MedicalRecord (Get or Create) - LÓGICA CORRIGIDA
    try {
      const loadingToast = toast.loading("Verificando prontuário médico...");
      
      try {
        // Tenta buscar o prontuário existente
        const record = await MedicalRecordService.findByAnimal(animal.id);
        setMedicalRecordId(record.id);
        toast.dismiss(loadingToast);
        toast.success("Prontuário médico encontrado!", { duration: 2000 });
      } catch (e: any) {
        // Se não encontrar (404), cria automaticamente
        if (e.message?.includes('not found') || e.message?.includes('Medical record not found')) {
          console.log('Prontuário não encontrado. Criando novo...');
          const newRecord = await MedicalRecordService.create({ animalId: animal.id });
          setMedicalRecordId(newRecord.id);
          toast.dismiss(loadingToast);
          toast.success("Prontuário médico criado automaticamente!", { duration: 2000 });
        } else {
          throw e;
        }
      }
    } catch (error: any) {
      console.error('Erro ao vincular prontuário:', error);
      toast.error("Erro crítico ao vincular prontuário médico.");
      setMedicalRecordId(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async () => {
    // Validação de IDs necessários
    if (!medicalRecordId) {
      toast.warning("Selecione um animal primeiro.");
      return;
    }
    if (!veterinarianId) {
      toast.error("Veterinário não identificado.");
      return;
    }

    // Validação de campos obrigatórios do snapshot
    if (!formData.animalName?.trim()) {
      toast.warning("Nome do animal é obrigatório.");
      return;
    }

    // Validações específicas por tipo de registro
    if (formData.type === ClinicalRecordType.triage && formData.fitForSurgery === undefined) {
      toast.warning("Marque se o animal está apto para cirurgia.");
      return;
    }

    if (formData.type === ClinicalRecordType.surgery && !formData.surgeryType) {
      toast.warning("Selecione o tipo de cirurgia.");
      return;
    }

    try {
      setSaving(true);

      // Helper: converte string vazia para undefined
      const emptyToUndefined = (value?: string) => value?.trim() ? value.trim() : undefined;

      // Payload CORRETO - sem campo 'species'
      const payload: CreateClinicalRecordData = {
        medicalRecordId,
        veterinarianId,
        type: formData.type,
        treatmentDate: new Date(formData.treatmentDate).toISOString(),
        
        // Campos condicionais por tipo
        ...(formData.type === ClinicalRecordType.triage && {
          fitForSurgery: formData.fitForSurgery
        }),
        ...(formData.type === ClinicalRecordType.surgery && {
          surgeryType: formData.surgeryType
        }),
        
        // Snapshot do Animal (convertendo strings vazias para undefined)
        animalName: emptyToUndefined(formData.animalName),
        breed: emptyToUndefined(formData.breed),
        age: emptyToUndefined(formData.age),
        coat: emptyToUndefined(formData.coat),
        weight: emptyToUndefined(formData.weight),
        size: emptyToUndefined(formData.size),
        
        // Snapshot do Tutor
        ownerName: emptyToUndefined(formData.ownerName),
        ownerPhone: emptyToUndefined(formData.ownerPhone),
        ownerAddress: emptyToUndefined(formData.ownerAddress),
        ownerNumber: emptyToUndefined(formData.ownerNumber),
        ownerNeighborhood: emptyToUndefined(formData.ownerNeighborhood),
        ownerCity: emptyToUndefined(formData.ownerCity),
        ownerReference: emptyToUndefined(formData.ownerReference),
        
        // Checkboxes de Serviço
        clinicalGuidance: formData.clinicalGuidance || undefined,
        returnVisit: formData.returnVisit || undefined,
        consultation: formData.consultation || undefined,
        treatmentChange: formData.treatmentChange || undefined,
        
        // Anamnese
        anamnesis: emptyToUndefined(formData.anamnesis),
        vaccinations: emptyToUndefined(formData.vaccinations),
        vaccinationDate: emptyToUndefined(formData.vaccinationDate),
        deworming: emptyToUndefined(formData.deworming),
        
        // Sinais Vitais
        rectalTemp: emptyToUndefined(formData.rectalTemp),
        heartRate: emptyToUndefined(formData.heartRate),
        respiratoryRate: emptyToUndefined(formData.respiratoryRate),
        pulse: emptyToUndefined(formData.pulse),
        
        // Exame Físico
        ectoscopy: emptyToUndefined(formData.ectoscopy),
        abdominalCavity: emptyToUndefined(formData.abdominalCavity),
        headAndNeck: emptyToUndefined(formData.headAndNeck),
        nervousSystem: emptyToUndefined(formData.nervousSystem),
        thoracicCavity: emptyToUndefined(formData.thoracicCavity),
        locomotorSystem: emptyToUndefined(formData.locomotorSystem),
        
        // Diagnóstico
        provisionalDiagnosis: emptyToUndefined(formData.provisionalDiagnosis),
        complementaryExams: emptyToUndefined(formData.complementaryExams),
        definitiveDiagnosis: emptyToUndefined(formData.definitiveDiagnosis),
        prognosis: emptyToUndefined(formData.prognosis),
        
        // Observações
        observations: emptyToUndefined(formData.observations),
        instructions: emptyToUndefined(formData.instructions),
        additionalNotes: emptyToUndefined(formData.additionalNotes),
      };

      await ClinicalRecordService.create(payload);
      
      toast.success("Ficha Clínica salva com sucesso!");
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
      <div className="bg-gray-100 w-full max-w-6xl h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="text-green-700" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Nova Ficha Clínica</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <X size={24}/>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="bg-white shadow-sm border border-gray-300 p-8 mx-auto max-w-4xl rounded-sm">
            
            {/* Cabeçalho do Documento */}
            <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-8">
              <h1 className="text-2xl font-bold text-gray-800 uppercase">Ficha Clínica</h1>
              <div className="text-right text-[10px] font-bold text-gray-500 uppercase leading-tight">
                <p>Hospital Veterinário</p>
                <p>Departamento de Medicina Veterinária</p>
              </div>
            </div>

            {/* SELEÇÃO DO ANIMAL (Custom Dropdown) */}
            <div className="mb-8 relative">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paciente</label>
              <button 
                onClick={() => setShowAnimalSearch(!showAnimalSearch)}
                className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded text-left hover:border-blue-400 transition-colors"
              >
                <span className="font-bold text-blue-900 flex items-center gap-2">
                  <Search size={16}/>
                  {formData.animalName ? `${formData.animalName} ${formData.species ? `(${SPECIES_LABELS[formData.species as keyof typeof SPECIES_LABELS]})` : ''} - Tutor: ${formData.ownerName}` : "Selecionar Paciente..."}
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

            {/* TIPO E DATA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 rounded border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Tipo de Registro</label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value={ClinicalRecordType.triage}>Triagem</option>
                  <option value={ClinicalRecordType.surgery}>Cirurgia</option>
                  <option value={ClinicalRecordType.followUp}>Retorno</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Data</label>
                <input 
                  type="date" 
                  name="treatmentDate" 
                  value={formData.treatmentDate} 
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              
              {/* Campos Condicionais */}
              <div className="flex items-end pb-2">
                {formData.type === ClinicalRecordType.triage && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="fitForSurgery" 
                      checked={!!formData.fitForSurgery} 
                      onChange={handleChange}
                      className="w-5 h-5 text-green-600 rounded"
                    />
                    <span className="font-bold text-green-700">Apto para Cirurgia?</span>
                  </label>
                )}
                {formData.type === ClinicalRecordType.surgery && (
                  <select 
                    name="surgeryType" 
                    value={formData.surgeryType || ''} 
                    onChange={handleChange}
                    className="w-full p-2 border border-green-300 bg-green-50 rounded focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Selecione a Cirurgia...</option>
                    <option value={SurgeryType.orchiectomy}>Orquiectomia (Macho)</option>
                    <option value={SurgeryType.ovariohysterectomy}>Ovariohisterectomia (Fêmea)</option>
                  </select>
                )}
              </div>
            </div>

            {/* SEÇÕES DO FORMULÁRIO */}
            
            {/* 1. Identificação (Preenchida autom., mas editável) */}
            <SectionTitle title="Identificação do Paciente" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Input label="Espécie" name="species" value={formData.species || ''} onChange={handleChange} readOnly />
              <Input label="Raça" name="breed" value={formData.breed || ''} onChange={handleChange} />
              <Input label="Idade" name="age" value={formData.age || ''} onChange={handleChange} />
              <Input label="Peso" name="weight" value={formData.weight || ''} onChange={handleChange} />
              <Input label="Pelagem" name="coat" value={formData.coat || ''} onChange={handleChange} />
              <Input label="Porte" name="size" value={formData.size || ''} onChange={handleChange} />
            </div>

            <SectionTitle title="Dados do Tutor" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <Input label="Nome Completo" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} />
              </div>
              <Input label="Telefone" name="ownerPhone" value={formData.ownerPhone || ''} onChange={handleChange} />
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Input label="Endereço" name="ownerAddress" value={formData.ownerAddress || ''} onChange={handleChange} />
                </div>
                <Input label="Número" name="ownerNumber" value={formData.ownerNumber || ''} onChange={handleChange} />
                <Input label="Bairro" name="ownerNeighborhood" value={formData.ownerNeighborhood || ''} onChange={handleChange} />
                <Input label="Cidade" name="ownerCity" value={formData.ownerCity || ''} onChange={handleChange} />
              </div>
              <div className="md:col-span-3">
                <Input label="Ponto de Referência" name="ownerReference" value={formData.ownerReference || ''} onChange={handleChange} />
              </div>
            </div>

            {/* 2. Tipo de Atendimento (Checkboxes) */}
            <SectionTitle title="Tipo de Atendimento" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-green-50 rounded">
                <input type="checkbox" name="clinicalGuidance" checked={formData.clinicalGuidance} onChange={handleChange} className="w-4 h-4 text-green-600 rounded" />
                <span className="text-sm text-gray-700">Orientação Clínica</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-green-50 rounded">
                <input type="checkbox" name="returnVisit" checked={formData.returnVisit} onChange={handleChange} className="w-4 h-4 text-green-600 rounded" />
                <span className="text-sm text-gray-700">Retorno</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-green-50 rounded">
                <input type="checkbox" name="consultation" checked={formData.consultation} onChange={handleChange} className="w-4 h-4 text-green-600 rounded" />
                <span className="text-sm text-gray-700">Consulta</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-green-50 rounded">
                <input type="checkbox" name="treatmentChange" checked={formData.treatmentChange} onChange={handleChange} className="w-4 h-4 text-green-600 rounded" />
                <span className="text-sm text-gray-700">Mudança de Tratamento</span>
              </label>
            </div>

            {/* 3. Anamnese */}
            <SectionTitle title="Anamnese" />
            <div className="space-y-4 mb-6">
              <TextArea label="Histórico / Queixa Principal" name="anamnesis" value={formData.anamnesis || ''} onChange={handleChange} rows={3} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input label="Vacinas" name="vaccinations" value={formData.vaccinations || ''} onChange={handleChange} />
                <Input label="Data da Vacinação" type="date" name="vaccinationDate" value={formData.vaccinationDate || ''} onChange={handleChange} />
                <Input label="Vermifugação" name="deworming" value={formData.deworming || ''} onChange={handleChange} />
              </div>
            </div>

            {/* 4. Sinais Vitais */}
            <SectionTitle title="Sinais Vitais" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Input label="Temp. Retal (°C)" name="rectalTemp" value={formData.rectalTemp || ''} onChange={handleChange} />
              <Input label="Freq. Cardíaca" name="heartRate" value={formData.heartRate || ''} onChange={handleChange} />
              <Input label="Freq. Respiratória" name="respiratoryRate" value={formData.respiratoryRate || ''} onChange={handleChange} />
              <Input label="TPC / Pulso" name="pulse" value={formData.pulse || ''} onChange={handleChange} />
            </div>

            {/* 5. Exame Físico por Sistemas */}
            <SectionTitle title="Exame Físico por Sistemas" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <TextArea label="Ectoscopia (Pele/Mucosas)" name="ectoscopy" value={formData.ectoscopy || ''} onChange={handleChange} rows={2} />
              <TextArea label="Cabeça e Pescoço" name="headAndNeck" value={formData.headAndNeck || ''} onChange={handleChange} rows={2} />
              <TextArea label="Cavidade Torácica (Coração/Pulmão)" name="thoracicCavity" value={formData.thoracicCavity || ''} onChange={handleChange} rows={2} />
              <TextArea label="Cavidade Abdominal" name="abdominalCavity" value={formData.abdominalCavity || ''} onChange={handleChange} rows={2} />
              <TextArea label="Sistema Nervoso" name="nervousSystem" value={formData.nervousSystem || ''} onChange={handleChange} rows={2} />
              <TextArea label="Sistema Locomotor" name="locomotorSystem" value={formData.locomotorSystem || ''} onChange={handleChange} rows={2} />
            </div>

            {/* 6. Diagnóstico */}
            <SectionTitle title="Diagnóstico" />
            <div className="space-y-4 mb-6">
              <TextArea label="Suspeita Clínica" name="provisionalDiagnosis" value={formData.provisionalDiagnosis || ''} onChange={handleChange} rows={2} />
              <TextArea label="Exames Complementares Solicitados" name="complementaryExams" value={formData.complementaryExams || ''} onChange={handleChange} rows={2} />
              <TextArea label="Diagnóstico Definitivo" name="definitiveDiagnosis" value={formData.definitiveDiagnosis || ''} onChange={handleChange} rows={2} />
              <TextArea label="Prognóstico" name="prognosis" value={formData.prognosis || ''} onChange={handleChange} rows={2} />
            </div>

            {/* 7. Prescrições e Observações */}
            <SectionTitle title="Prescrições e Observações" />
            <div className="space-y-4">
              <TextArea label="Instruções ao Tutor / Prescrição" name="instructions" value={formData.instructions || ''} onChange={handleChange} rows={4} />
              <TextArea label="Observações Gerais" name="observations" value={formData.observations || ''} onChange={handleChange} rows={3} />
              <TextArea label="Notas Adicionais" name="additionalNotes" value={formData.additionalNotes || ''} onChange={handleChange} rows={2} />
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
            className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-green-700 hover:bg-green-800 shadow-lg disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
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
      className="w-full border-b border-gray-300 bg-transparent px-1 py-1 text-sm text-gray-900 focus:border-green-600 focus:outline-none placeholder:text-gray-300 transition-colors"
    />
  </div>
);

const TextArea = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">{label}</label>
    <textarea 
      {...props}
      className="w-full border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm text-gray-800 rounded focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none transition-all resize-none"
    />
  </div>
);