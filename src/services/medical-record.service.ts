import api from '@/lib/axios';
import { AxiosError } from 'axios';

// ==================== ENUMS ====================

export enum ClinicalRecordType {
  triage = 'triage',
  surgery = 'surgery',
  followUp = 'followUp',
}

export enum SurgeryType {
  orchiectomy = 'orchiectomy',           // Male castration
  ovariohysterectomy = 'ovariohysterectomy', // Female castration
}

// ==================== LABELS ====================

export const CLINICAL_RECORD_TYPE_LABELS: Record<ClinicalRecordType, string> = {
  [ClinicalRecordType.triage]: 'Triagem',
  [ClinicalRecordType.surgery]: 'Cirurgia',
  [ClinicalRecordType.followUp]: 'Retorno',
};

export const SURGERY_TYPE_LABELS: Record<SurgeryType, string> = {
  [SurgeryType.orchiectomy]: 'Orquiectomia',
  [SurgeryType.ovariohysterectomy]: 'Ovariohisterectomia',
};

// ==================== INTERFACES ====================

/**
 * Medical Record (Prontuário Médico)
 */
export interface MedicalRecord {
  id: number;
  animalId: number;
  microchipNumber: string | null;
  createdAt: string;
  updatedAt: string;
  animal?: {
    id: number;
    name: string | null;
    species: string;
    gender: string;
    estimatedAge: string;
    breed: string | null;
    sizeWeight: string;
    petOwner?: {
      id: number;
      fullAddress: string;
      user?: {
        completeName: string;
        email: string;
        phone: string;
        cpf: string;
      };
    };
  };
  clinicalRecords?: ClinicalRecord[];
}

/**
 * Clinical Record (Registro Clínico)
 */
export interface ClinicalRecord {
  id: number;
  medicalRecordId: number;
  appointmentId: number | null;
  veterinarianId: number;
  type: ClinicalRecordType;
  treatmentDate: string;
  fitForSurgery: boolean | null;
  surgeryType: SurgeryType | null;
  observations: string | null;
  instructions: string | null;
  medicalRecord?: MedicalRecord;
  appointment?: {
    id: number;
    startTime: string;
    endTime: string;
    serviceType: string;
    status: string;
  };
  veterinarian?: {
    id: number;
    crmv: string | null;
    specialty: string | null;
    user?: {
      completeName: string;
      email: string;
      phone: string;
    };
  };
}

/**
 * Create Medical Record DTO
 */
export interface CreateMedicalRecordData {
  animalId: number;
  microchipNumber?: string;
}

/**
 * Update Medical Record DTO
 */
export interface UpdateMedicalRecordData {
  animalId?: number;
  microchipNumber?: string;
}

/**
 * Create Clinical Record DTO
 */
export interface CreateClinicalRecordData {
  medicalRecordId: number;
  appointmentId?: number;
  veterinarianId: number;
  type: ClinicalRecordType;
  treatmentDate?: string; // ISO format
  fitForSurgery?: boolean;
  surgeryType?: SurgeryType;
  observations?: string;
  instructions?: string;
}

/**
 * Update Clinical Record DTO
 */
export interface UpdateClinicalRecordData {
  medicalRecordId?: number;
  appointmentId?: number;
  veterinarianId?: number;
  type?: ClinicalRecordType;
  treatmentDate?: string;
  fitForSurgery?: boolean;
  surgeryType?: SurgeryType;
  observations?: string;
  instructions?: string;
}

// ==================== MEDICAL RECORD SERVICE ====================

export class MedicalRecordService {
  private static readonly BASE_PATH = '/medical-record';

  /**
   * Get all medical records
   */
  static async getAll(): Promise<MedicalRecord[]> {
    try {
      const response = await api.get<MedicalRecord[]>(this.BASE_PATH);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get medical record by ID
   */
  static async getById(id: number): Promise<MedicalRecord> {
    try {
      const response = await api.get<MedicalRecord>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get medical record by animal ID
   */
  static async getByAnimalId(animalId: number): Promise<MedicalRecord> {
    try {
      const response = await api.get<MedicalRecord>(`${this.BASE_PATH}/animal/${animalId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record by animal:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Alias for getByAnimalId (for compatibility)
   */
  static async findByAnimal(animalId: number): Promise<MedicalRecord> {
    return this.getByAnimalId(animalId);
  }

  /**
   * Create medical record
   */
  static async create(data: CreateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const response = await api.post<MedicalRecord>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update medical record
   */
  static async update(id: number, data: UpdateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const response = await api.patch<MedicalRecord>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete medical record
   */
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw this.handleError(error);
    }
  }

  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return new Error('Erro ao processar requisição de prontuários médicos');
  }
}

// ==================== CLINICAL RECORD SERVICE ====================

export class ClinicalRecordService {
  private static readonly BASE_PATH = '/clinical-record';

  /**
   * Get all clinical records
   */
  static async getAll(): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get<ClinicalRecord[]>(this.BASE_PATH);
      return response.data;
    } catch (error) {
      console.error('Error fetching clinical records:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get clinical record by ID
   */
  static async getById(id: number): Promise<ClinicalRecord> {
    try {
      const response = await api.get<ClinicalRecord>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clinical record:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get clinical records by medical record ID
   */
  static async getByMedicalRecordId(medicalRecordId: number): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get<ClinicalRecord[]>(`${this.BASE_PATH}/medical-record/${medicalRecordId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clinical records by medical record:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get clinical records by animal ID
   * Returns empty array if medical record doesn't exist
   */
  static async getByAnimalId(animalId: number): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get<ClinicalRecord[]>(`${this.BASE_PATH}/animal/${animalId}`);
      return response.data;
    } catch (error: any) {
      // Se o erro for 404 (prontuário não encontrado), retorna array vazio
      if (error.response?.status === 404) {
        console.log('No medical record found for animal', animalId);
        return [];
      }
      console.error('Error fetching clinical records by animal:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create clinical record
   */
  static async create(data: CreateClinicalRecordData): Promise<ClinicalRecord> {
    try {
      const response = await api.post<ClinicalRecord>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      console.error('Error creating clinical record:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update clinical record
   */
  static async update(id: number, data: UpdateClinicalRecordData): Promise<ClinicalRecord> {
    try {
      const response = await api.patch<ClinicalRecord>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating clinical record:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete clinical record
   */
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error('Error deleting clinical record:', error);
      throw this.handleError(error);
    }
  }

  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return new Error('Erro ao processar requisição de registros clínicos');
  }
}
