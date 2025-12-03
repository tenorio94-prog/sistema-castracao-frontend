"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, FileText, Loader2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import FormInput from '@/components/forms/FormInput';
import FormSelect from '@/components/forms/FormSelect';
import { AppointmentService, ServiceType, SERVICE_TYPE_LABELS, AppointmentStatus } from '@/services/appointment.service';
import { AnimalService, Animal, SPECIES_LABELS } from '@/services/animal.service';
import { PetOwnerService, PetOwner } from '@/services/petowner.service';
import { VeterinarianService, Veterinarian } from '@/services/veterinarian.service';

interface ModalNovoAgendamentoAtendenteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ModalNovoAgendamentoAtendente({ isOpen, onClose, onSuccess }: ModalNovoAgendamentoAtendenteProps) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Dados do formulário
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedVetId, setSelectedVetId] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.triage);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  
  // Dados carregados
  const [owners, setOwners] = useState<PetOwner[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  
  // Busca de responsável
  const [ownerSearch, setOwnerSearch] = useState('');

  // Carregar dados ao abrir modal
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    } else {
      resetForm();
    }
  }, [isOpen]);

  // Filtrar animais quando o responsável é selecionado
  useEffect(() => {
    if (selectedOwnerId) {
      const ownerId = parseInt(selectedOwnerId);
      const ownerAnimals = animals.filter(animal => animal.petOwnerId === ownerId);
      setFilteredAnimals(ownerAnimals);
      
      // Limpa seleção do animal se não pertencer ao novo responsável
      const selectedAnimal = animals.find(a => a.id.toString() === selectedAnimalId);
      if (selectedAnimal && selectedAnimal.petOwnerId !== ownerId) {
        setSelectedAnimalId('');
      }
    } else {
      setFilteredAnimals([]);
      setSelectedAnimalId('');
    }
  }, [selectedOwnerId, animals, selectedAnimalId]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Busca paralela de Tutores, Animais e Veterinários
      const [fetchedOwners, fetchedAnimals, fetchedVets] = await Promise.all([
        PetOwnerService.getAll(),
        AnimalService.getAll(),
        VeterinarianService.getAll()
      ]);
      
      setOwners(fetchedOwners);
      setAnimals(fetchedAnimals);
      setVeterinarians(fetchedVets.filter(vet => vet.active)); // Apenas veterinários ativos
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados: ' + (error.message || 'Verifique sua conexão'));
      setOwners([]);
      setAnimals([]);
      setVeterinarians([]);
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setSelectedOwnerId('');
    setSelectedAnimalId('');
    setSelectedVetId('');
    setServiceType(ServiceType.triage);
    setDate('');
    setTime('');
    setDuration('60');
    setNotes('');
    setOwnerSearch('');
    setFilteredAnimals([]);
  };

  const calculateEndTime = (startDateTime: Date, durationMinutes: number): Date => {
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMinutes);
    return endDateTime;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOwnerId) {
      toast.error('Selecione um responsável');
      return;
    }
    
    if (!selectedAnimalId) {
      toast.error('Selecione um animal');
      return;
    }
    
    if (!selectedVetId) {
      toast.error('Selecione um veterinário');
      return;
    }
    
    if (!date || !time) {
      toast.error('Informe a data e hora do agendamento');
      return;
    }

    setLoading(true);
    
    try {
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = calculateEndTime(startDateTime, parseInt(duration));
      
      const payload = {
        animalId: parseInt(selectedAnimalId),
        petOwnerId: parseInt(selectedOwnerId),
        veterinarianId: parseInt(selectedVetId),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        serviceType,
        status: AppointmentStatus.scheduled,
        notes: notes || undefined
      };

      console.log('📤 Enviando agendamento:', payload);
      
      await AppointmentService.create(payload);
      
      toast.success('Agendamento criado com sucesso!');
      
      if (onSuccess) onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('❌ Erro ao criar agendamento:', error);
      console.error('❌ Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 409) {
        // Traduzir mensagens de conflito do backend
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('already an appointment for this animal')) {
          toast.error('Já existe um agendamento para este animal neste horário');
        } else if (errorMessage.includes('veterinarian already has')) {
          toast.error('O veterinário já possui um agendamento neste horário');
        } else {
          toast.error('Conflito de horário detectado');
        }
      } else if (error.response?.status === 404) {
        toast.error('Endpoint não encontrado. Verifique se o backend está rodando corretamente.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Dados inválidos';
        toast.error(errorMsg);
      } else {
        toast.error(error.response?.data?.message || 'Erro ao criar agendamento');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- PREPARAÇÃO DAS OPÇÕES PARA O FORMSELECT ---
  
  // 1. Filtrar Responsáveis pela busca
  const filteredOwners = owners.filter(owner => 
    owner.user?.completeName?.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    owner.user?.cpf?.includes(ownerSearch) ||
    owner.user?.phone?.includes(ownerSearch)
  );

  // 2. Opções de Responsáveis
  const ownerOptions = [
    { value: '', label: 'Selecione o responsável' },
    ...filteredOwners.map(owner => ({
      value: owner.id.toString(),
      label: `${owner.user?.completeName || 'Nome não informado'} - ${owner.user?.cpf || 'CPF não informado'}`
    }))
  ];

  // 3. Opções de Animais
  const animalOptions = [
    { value: '', label: selectedOwnerId ? 'Selecione o animal' : 'Primeiro selecione um responsável' },
    ...filteredAnimals.map(animal => ({
      value: animal.id.toString(),
      label: `${animal.name || 'Sem nome'} - ${SPECIES_LABELS[animal.species] || animal.species} - ${animal.breed || 'SRD'}`
    }))
  ];

  // 4. Opções de Veterinários
  const veterinarianOptions = [
    { value: '', label: 'Selecione o veterinário' },
    ...veterinarians.map(vet => ({
      value: vet.id.toString(),
      label: `Dr(a). ${vet.user?.completeName || 'Nome não informado'} ${vet.crmv ? `- CRMV: ${vet.crmv}` : ''} ${vet.specialty ? `(${vet.specialty})` : ''}`
    }))
  ];

  // 5. Opções de Tipo de Serviço
  const serviceOptions = Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => ({
    value: key,
    label: label
  }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Novo Agendamento</h2>
              <p className="text-sm text-gray-500">Agendar consulta ou procedimento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              <p className="text-gray-500">Carregando dados...</p>
            </div>
          ) : (
            <>
              {/* Seção 1: Paciente */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <User size={16} className="text-blue-600" />
                  Dados do Paciente
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select de Responsável */}
                  <div className="md:col-span-2">
                    <FormSelect
                      label="Responsável *"
                      value={selectedOwnerId}
                      onChange={(e) => setSelectedOwnerId(e.target.value)}
                      required
                      options={ownerOptions}
                    />
                    {filteredOwners.length === 0 && ownerSearch && owners.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">Nenhum responsável encontrado</p>
                    )}
                    {owners.length === 0 && !loadingData && (
                      <p className="text-sm text-yellow-600 mt-1">
                         ⚠️ Nenhum responsável cadastrado no sistema.
                      </p>
                    )}
                  </div>
                  
                  {/* Select de Animal */}
                  <div className="md:col-span-2">
                    <FormSelect
                      label="Animal *"
                      value={selectedAnimalId}
                      onChange={(e) => setSelectedAnimalId(e.target.value)}
                      required
                      disabled={!selectedOwnerId}
                      options={animalOptions}
                    />
                    {selectedOwnerId && filteredAnimals.length === 0 && (
                      <p className="text-sm text-yellow-600 mt-1">
                        ⚠️ Este responsável não possui animais cadastrados
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção 2: Veterinário */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <UserCircle size={16} className="text-blue-600" />
                  Veterinário Responsável
                </h3>
                
                <FormSelect
                  label="Veterinário *"
                  value={selectedVetId}
                  onChange={(e) => setSelectedVetId(e.target.value)}
                  required
                  options={veterinarianOptions}
                />
                {veterinarians.length === 0 && !loadingData && (
                  <p className="text-sm text-yellow-600 mt-1">
                    ⚠️ Nenhum veterinário ativo cadastrado no sistema.
                  </p>
                )}
              </div>

              {/* Seção 3: Tipo de Serviço */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Stethoscope size={16} className="text-blue-600" />
                  Tipo de Atendimento
                </h3>
                
                <FormSelect
                  label="Tipo de Serviço *"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceType)}
                  required
                  options={serviceOptions}
                />
              </div>

              {/* Seção 4: Data e Horário */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Clock size={16} className="text-blue-600" />
                  Data e Horário
                </h3>
                
                <div className="w-full flex gap-4 md:gap-6 lg:gap-8 flex-col md:flex-row md:flex">
                  <FormInput
                    label="Data *"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  
                  <FormInput
                    label="Horário *"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Seção 5: Observações */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <FileText size={16} className="text-blue-600" />
                  Observações
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionais (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Ex: Jejum de 12h, medicação pré-operatória..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || loadingData}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Criando...
              </>
            ) : (
              <>
                <Calendar size={18} />
                Criar Agendamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
