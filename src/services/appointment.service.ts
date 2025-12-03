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

// --- LABELS UI ---
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
  serviceType: ServiceType;
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
}

export interface CreateAppointmentData {
  animalId: number;
  petOwnerId: number;
  veterinarianId?: number;
  startTime: string;
  endTime: string;
  serviceType?: ServiceType;
  status?: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentData {
  startTime?: string;
  endTime?: string;
  serviceType?: ServiceType;
  status?: AppointmentStatus;
  notes?: string;
}

// --- SERVICE ---
export const AppointmentService = {
  async getAll(): Promise<Appointment[]> {
    try {
      console.log('🔍 Buscando todos os agendamentos...');
      const response = await api.get<Appointment[]>('/appointment');
      console.log('✅ Agendamentos recebidos:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching appointments:', error);
      // Tentar rota alternativa se /appointments falhar
      if (error.response?.status === 404) {
        console.log('⚠️ Tentando rota alternativa /appointment...');
        try {
          const response = await api.get<Appointment[]>('/appointment');
          return response.data;
        } catch (fallbackError) {
          throw new Error('Erro ao buscar agendamentos');
        }
      }
      throw new Error(error.response?.data?.message || 'Erro ao buscar agendamentos');
    }
  },

  async getById(id: number): Promise<Appointment> {
    try {
      const response = await api.get<Appointment>(`/appointment/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        try {
          const response = await api.get<Appointment>(`/appointment/${id}`);
          return response.data;
        } catch (fallbackError) {
          throw new Error('Agendamento não encontrado');
        }
      }
      throw new Error(error.response?.data?.message || 'Erro ao buscar agendamento');
    }
  },

  async create(data: CreateAppointmentData): Promise<Appointment> {
    try {
      console.log('📤 Criando agendamento no endpoint /appointment...');
      const response = await api.post<Appointment>('/appointment', data);
      console.log('✅ Agendamento criado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro no POST /appointment:', error.response?.status);
      // Tentar rota alternativa se /appointments falhar
      if (error.response?.status === 404) {
        console.log('⚠️ Tentando rota alternativa /appointment...');
        try {
          const response = await api.post<Appointment>('/appointment', data);
          console.log('✅ Agendamento criado (rota alternativa):', response.data);
          return response.data;
        } catch (fallbackError) {
          console.error('❌ Falha em ambas as rotas');
          throw fallbackError;
        }
      }
      // Repassa o erro original para que o componente possa verificar o status 409
      throw error; 
    }
  },

  async update(id: number, data: UpdateAppointmentData): Promise<Appointment> {
    try {
      const response = await api.patch<Appointment>(`/appointment/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        try {
          const response = await api.patch<Appointment>(`/appointment/${id}`, data);
          return response.data;
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  },

  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/appointment/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        try {
          const response = await api.delete<{ message: string }>(`/appointment/${id}`);
          return response.data;
        } catch (fallbackError) {
          throw new Error('Erro ao deletar agendamento');
        }
      }
      throw new Error(error.response?.data?.message || 'Erro ao deletar agendamento');
    }
  },
};