import api from '@/lib/axios';
import { AxiosError } from 'axios';
// Importamos as tipagens necessárias de outros serviços para manter consistência
import { MedicalRecord } from './medical-record.service';

/**
 * Interface fiel ao retorno do Backend
 */
export interface SurgicalRecord {
  id: number;
  medicalRecordId: number;
  appointmentId?: number | null;
  recordNumber?: string | null;
  recordDate: string;
  
  // Identificação (Snapshot - dados copiados no momento da criação)
  animalName?: string;
  species?: string;
  breed?: string;
  coat?: string;
  size?: string;
  gender?: string;
  age?: string;
  weight?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  
  // Equipe
  surgeon?: string;
  firstAssistant?: string;
  secondAssistant?: string;
  instrumentator?: string;
  anesthetist?: string;
  
  // Tempos
  duration?: string;
  surgeryStart?: string; 
  surgeryEnd?: string;   
  
  // Diagnósticos
  preoperativeDiagnosis?: string;
  postoperativeDiagnosis?: string;
  proposedOperation?: string;
  performedOperation?: string;
  
  // Detalhes
  materialsUsed?: string;
  postoperativeControl?: string;
  operationDescription?: string;
  additionalObservations?: string;
  
  createdAt: string;
  updatedAt: string;

  // --- RELAÇÕES (O erro acontecia pela falta destes campos) ---
  medicalRecord?: MedicalRecord; // Agora o TS sabe que existe um objeto aqui
  appointment?: {
    id: number;
    startTime: string;
    status: string;
  } | null;
}

export interface CreateSurgicalRecordData {
  medicalRecordId: number;
  appointmentId?: number;
  recordNumber?: string;
  recordDate?: string; 

  // Snapshot Data
  animalName?: string;
  species?: string;
  breed?: string;
  coat?: string;
  size?: string;
  gender?: string;
  age?: string;
  weight?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;

  // Equipe
  surgeon?: string;
  firstAssistant?: string;
  secondAssistant?: string;
  instrumentator?: string;
  anesthetist?: string;

  // Tempos
  duration?: string;
  surgeryStart?: string;
  surgeryEnd?: string;

  // Procedimentos
  preoperativeDiagnosis?: string;
  postoperativeDiagnosis?: string;
  proposedOperation?: string;
  performedOperation?: string;

  // Descritivos
  materialsUsed?: string;
  postoperativeControl?: string;
  operationDescription?: string;
  additionalObservations?: string;
}

export class SurgicalRecordService {
  private static readonly BASE_PATH = '/surgical-record';

  static async getAll(): Promise<SurgicalRecord[]> {
    try {
      const response = await api.get<SurgicalRecord[]>(this.BASE_PATH);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar fichas:', error);
      throw error;
    }
  }

  static async getById(id: number): Promise<SurgicalRecord> {
    const response = await api.get<SurgicalRecord>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async create(data: CreateSurgicalRecordData): Promise<SurgicalRecord> {
    try {
      const response = await api.post<SurgicalRecord>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async update(id: number, data: Partial<CreateSurgicalRecordData>): Promise<SurgicalRecord> {
    const response = await api.patch<SurgicalRecord>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`${this.BASE_PATH}/${id}`);
  }
}