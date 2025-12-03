import api from "@/lib/axios";

// Enums do backend
export enum AsaClassification {
  ASA_I = "ASA_I",
  ASA_II = "ASA_II",
  ASA_III = "ASA_III",
  ASA_IV = "ASA_IV",
  ASA_V = "ASA_V",
}

export enum AnestheticRisk {
  MILD = "mild",
  MODERATE = "moderate",
  HIGH = "high",
}

export enum RecoveryQuality {
  RAPID_SMOOTH = "rapidSmooth",
  SLOW = "slow",
  AGITATED_EXCITEMENT = "agitatedExcitement",
  VOCALIZATION_PAIN = "vocalizationPain",
}

export enum MedicationPhase {
  MPA = "MPA",
  INDUCTION = "INDUCTION",
}

// Labels para exibição
export const ASA_CLASSIFICATION_LABELS: Record<AsaClassification, string> = {
  [AsaClassification.ASA_I]: 'ASA I - Paciente Saudável',
  [AsaClassification.ASA_II]: 'ASA II - Doença Sistêmica Leve',
  [AsaClassification.ASA_III]: 'ASA III - Doença Sistêmica Grave',
  [AsaClassification.ASA_IV]: 'ASA IV - Doença Sistêmica Grave com Risco de Vida',
  [AsaClassification.ASA_V]: 'ASA V - Moribundo'
};

export const ANESTHETIC_RISK_LABELS: Record<AnestheticRisk, string> = {
  [AnestheticRisk.MILD]: 'Leve',
  [AnestheticRisk.MODERATE]: 'Moderado',
  [AnestheticRisk.HIGH]: 'Alto'
};

export const RECOVERY_QUALITY_LABELS: Record<RecoveryQuality, string> = {
  [RecoveryQuality.RAPID_SMOOTH]: 'Rápida/Suave',
  [RecoveryQuality.SLOW]: 'Lenta',
  [RecoveryQuality.AGITATED_EXCITEMENT]: 'Agitada/Excitação',
  [RecoveryQuality.VOCALIZATION_PAIN]: 'Vocalização/Dor'
};

export const MEDICATION_PHASE_LABELS: Record<MedicationPhase, string> = {
  [MedicationPhase.MPA]: 'MPA - Medicação Pré-Anestésica',
  [MedicationPhase.INDUCTION]: 'Indução Anestésica'
};

// Nested DTOs
export interface AnestheticMedication {
  id?: number;
  phase: MedicationPhase;
  drugName: string;
  dosage: string;
  route: string;
  administrationTime: string;
}

export interface AnestheticMonitoring {
  id?: number;
  measurementTime: string;
  agent?: string;
  heartRate?: string;
  respiratoryRate?: string;
  spo2?: string;
  etco2?: string;
  systolicPressure?: string;
  diastolicPressure?: string;
  temperature?: string;
}

// Interface completa da ficha anestésica
export interface AnestheticRecord {
  id: number;
  medicalRecordId: number;
  appointmentId?: number;
  
  // === HEADER AND IDENTIFICATION ===
  animalName?: string;
  species?: string;
  breed?: string;
  weight?: string;
  age?: string;
  procedure?: string;
  anesthetistId?: number;
  surgeonId?: number;
  
  // === RISK ASSESSMENT ===
  asaClassification?: AsaClassification;
  anestheticRisk?: AnestheticRisk;
  
  // === PRE-ANESTHETIC EVALUATION (VITAL SIGNS) ===
  preHeartRate?: string;
  preRespiratoryRate?: string;
  preMucousMembranes?: string;
  preCapillaryRefill?: string;
  preTemperature?: string;
  comorbidities?: string;
  allergies?: string;
  
  // === AIRWAY ===
  intubation?: boolean;
  tubeNumber?: string;
  circuit?: string;
  
  // === MAINTENANCE TYPE ===
  maintenanceInhalation: boolean;
  maintenanceTIVA: boolean;
  
  // === RECOVERY AND POST-OPERATIVE ===
  extubationTime?: string;
  recoveryQuality?: RecoveryQuality;
  postoperativeMedication?: string;
  generalObservations?: string;
  
  createdAt: string;
  updatedAt: string;
  
  // Relations
  medicalRecord?: {
    id: number;
    animalId: number;
    animal: {
      id: number;
      name: string;
      species: string;
      breed?: string;
      petOwner: {
        id: number;
        user: {
          id: number;
          completeName: string;
          phone: string;
        };
      };
    };
  };
  appointment?: {
    id: number;
    startTime: string;
  };
  anesthetist?: {
    id: number;
    user: {
      id: number;
      completeName: string;
    };
  };
  surgeon?: {
    id: number;
    user: {
      id: number;
      completeName: string;
    };
  };
  medications: AnestheticMedication[];
  monitoring: AnestheticMonitoring[];
}

export interface CreateAnestheticRecordData {
  medicalRecordId: number;
  appointmentId?: number;
  
  // === HEADER AND IDENTIFICATION ===
  animalName?: string;
  species?: string;
  breed?: string;
  weight?: string;
  age?: string;
  procedure?: string;
  anesthetistId?: number;
  surgeonId?: number;
  
  // === RISK ASSESSMENT ===
  asaClassification?: AsaClassification;
  anestheticRisk?: AnestheticRisk;
  
  // === PRE-ANESTHETIC EVALUATION ===
  preHeartRate?: string;
  preRespiratoryRate?: string;
  preMucousMembranes?: string;
  preCapillaryRefill?: string;
  preTemperature?: string;
  comorbidities?: string;
  allergies?: string;
  
  // === AIRWAY ===
  intubation?: boolean;
  tubeNumber?: string;
  circuit?: string;
  
  // === MAINTENANCE TYPE ===
  maintenanceInhalation?: boolean;
  maintenanceTIVA?: boolean;
  
  // === RECOVERY ===
  extubationTime?: string;
  recoveryQuality?: RecoveryQuality;
  postoperativeMedication?: string;
  generalObservations?: string;
  
  // === NESTED DATA ===
  medications?: AnestheticMedication[];
  monitoring?: AnestheticMonitoring[];
}

export type UpdateAnestheticRecordData = Partial<CreateAnestheticRecordData>;

class AnestheticRecordService {
  private static readonly BASE_PATH = "/anesthetic-record";

  /**
   * Busca todas as fichas anestésicas
   */
  static async getAll(): Promise<AnestheticRecord[]> {
    try {
      const response = await api.get<AnestheticRecord[]>(this.BASE_PATH);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching anesthetic records:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para visualizar fichas anestésicas.");
      } else if (status === 500) {
        throw new Error("Erro no servidor ao buscar fichas anestésicas.");
      }
      throw new Error(message || "Erro ao buscar fichas anestésicas");
    }
  }

  /**
   * Busca uma ficha anestésica por ID
   */
  static async getById(id: number): Promise<AnestheticRecord> {
    try {
      const response = await api.get<AnestheticRecord>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching anesthetic record ${id}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error("Ficha anestésica não encontrada.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para visualizar esta ficha anestésica.");
      }
      throw new Error(message || "Erro ao buscar ficha anestésica");
    }
  }

  /**
   * Busca fichas anestésicas por prontuário médico
   */
  static async getByMedicalRecord(medicalRecordId: number): Promise<AnestheticRecord[]> {
    try {
      const response = await api.get<AnestheticRecord[]>(
        `${this.BASE_PATH}/medical-record/${medicalRecordId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching anesthetic records for medical record ${medicalRecordId}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error("Prontuário não encontrado.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      }
      throw new Error(message || "Erro ao buscar fichas anestésicas do prontuário");
    }
  }

  /**
   * Cria uma nova ficha anestésica
   */
  static async create(data: CreateAnestheticRecordData): Promise<AnestheticRecord> {
    try {
      const response = await api.post<AnestheticRecord>(this.BASE_PATH, data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating anesthetic record:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 400) {
        throw new Error(message || "Dados inválidos para criar ficha anestésica.");
      } else if (status === 404) {
        throw new Error("Prontuário, veterinário ou agendamento não encontrado.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para criar fichas anestésicas.");
      }
      throw new Error(message || "Erro ao criar ficha anestésica");
    }
  }

  /**
   * Atualiza uma ficha anestésica existente
   */
  static async update(id: number, data: UpdateAnestheticRecordData): Promise<AnestheticRecord> {
    try {
      const response = await api.patch<AnestheticRecord>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating anesthetic record ${id}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 400) {
        throw new Error(message || "Dados inválidos para atualizar ficha anestésica.");
      } else if (status === 404) {
        throw new Error("Ficha anestésica não encontrada.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para atualizar fichas anestésicas.");
      }
      throw new Error(message || "Erro ao atualizar ficha anestésica");
    }
  }

  /**
   * Deleta uma ficha anestésica
   */
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting anesthetic record ${id}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error("Ficha anestésica não encontrada.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para deletar fichas anestésicas.");
      }
      throw new Error(message || "Erro ao deletar ficha anestésica");
    }
  }
}

export default AnestheticRecordService;
