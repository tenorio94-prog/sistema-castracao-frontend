import api from '@/lib/axios';

// --- ENUMS ---
export enum AppointmentStatus {
  scheduled = 'scheduled',
  confirmed = 'confirmed',
  completed = 'completed',
  canceled = 'canceled',
  absent = 'absent',
}

export enum ServiceType {
  triage = 'triage',
  castrationSurgery = 'castrationSurgery',
  postOperative = 'postOperative',
}

// --- MAPEAMENTOS PARA UI ---
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.scheduled]: 'Agendado',
  [AppointmentStatus.confirmed]: 'Confirmado',
  [AppointmentStatus.completed]: 'Concluído',
  [AppointmentStatus.canceled]: 'Cancelado',
  [AppointmentStatus.absent]: 'Ausente',
};

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.triage]: 'Triagem',
  [ServiceType.castrationSurgery]: 'Cirurgia de Castração',
  [ServiceType.postOperative]: 'Pós-Operatório',
};

// --- INTERFACES ---
export interface Appointment {
  id: number;
  animalId: number;
  petOwnerId: number;
  startTime: string;
  endTime: string;
  serviceType: ServiceType | null;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  animal?: {
    id: number;
    name: string | null;
    species: string;
    gender: string;
    breed?: string | null;
  };
  petOwner?: {
    id: number;
    userId: number;
    nis: string | null;
    fullAddress: string;
    user?: {
      completeName: string;
      email: string;
      phone: string | null;
      cpf?: string | null;
    };
  };
  clinicalRecords?: Array<{
    id: number;
    type: string;
    treatmentDate: string;
  }>;
}

export interface CreateAppointmentData {
  animalId: number;
  petOwnerId: number;
  startTime: Date | string;
  endTime: Date | string;
  serviceType?: ServiceType;
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentData {
  startTime?: Date | string;
  endTime?: Date | string;
  serviceType?: ServiceType;
  status?: AppointmentStatus;
  notes?: string;
}

// --- SERVICE ---
export const AppointmentService = {
  /**
   * Buscar todos os agendamentos
   * GET /appointment
   */
  async getAll(): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>('/appointment');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar agendamentos');
    }
  },

  /**
   * Buscar agendamento por ID
   * GET /appointment/:id
   */
  async getById(id: number): Promise<Appointment> {
    try {
      const response = await api.get<Appointment>(`/appointment/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointment:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar agendamento');
    }
  },

  /**
   * Buscar agendamentos por status
   * GET /appointment/status/:status
   */
  async getByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>(`/appointment/status/${status}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointments by status:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar agendamentos por status');
    }
  },

  /**
   * Buscar agendamentos por animal
   * GET /appointment/animal/:animalId
   */
  async getByAnimalId(animalId: number): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>(`/appointment/animal/${animalId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointments by animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar agendamentos do animal');
    }
  },

  /**
   * Buscar agendamentos por responsável
   * GET /appointment/pet-owner/:petOwnerId
   */
  async getByPetOwnerId(petOwnerId: number): Promise<Appointment[]> {
    try {
      const response = await api.get<Appointment[]>(`/appointment/pet-owner/${petOwnerId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointments by pet owner:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar agendamentos do responsável');
    }
  },

  /**
   * Criar novo agendamento
   * POST /appointment
   * 
   * Validações do backend:
   * - Animal e PetOwner devem existir
   * - Animal deve pertencer ao PetOwner
   * - startTime deve ser antes de endTime
   * - Não pode haver conflito de horário para o mesmo animal
   */
  async create(data: CreateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.post<Appointment>('/appointment', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar agendamento');
    }
  },

  /**
   * Atualizar agendamento existente
   * PATCH /appointment/:id
   * @param id - ID do agendamento
   * @param data - Dados parciais para atualização
   */
  async update(id: number, data: UpdateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.patch<Appointment>(`/appointment/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar agendamento');
    }
  },

  /**
   * Deletar agendamento
   * DELETE /appointment/:id
   * @param id - ID do agendamento
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/appointment/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      throw new Error(error.response?.data?.message || 'Erro ao deletar agendamento');
    }
  },

  /**
   * Filtrar agendamentos por data no lado do cliente
   */
  filterByDate(appointments: Appointment[], date: Date): Appointment[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === targetDate.getTime();
    });
  },

  /**
   * Filtrar agendamentos por período no lado do cliente
   */
  filterByDateRange(appointments: Appointment[], startDate: Date, endDate: Date): Appointment[] {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate >= start && appointmentDate <= end;
    });
  },
};
