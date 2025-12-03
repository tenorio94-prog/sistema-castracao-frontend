import api from "@/lib/axios";
import { AxiosError } from "axios";

// --- ENUMS IGUAIS AO PRISMA ---
export enum ClinicalRecordType {
  triage = "triage",
  surgery = "surgery",
  followUp = "followUp",
}

export enum SurgeryType {
  orchiectomy = "orchiectomy",
  ovariohysterectomy = "ovariohysterectomy",
}

// --- LABELS PARA EXIBIÇÃO ---
export const CLINICAL_RECORD_TYPE_LABELS: Record<ClinicalRecordType, string> = {
  [ClinicalRecordType.triage]: 'Triagem',
  [ClinicalRecordType.surgery]: 'Cirurgia',
  [ClinicalRecordType.followUp]: 'Retorno',
};

export const SURGERY_TYPE_LABELS: Record<SurgeryType, string> = {
  [SurgeryType.orchiectomy]: 'Orquiectomia (Macho)',
  [SurgeryType.ovariohysterectomy]: 'Ovariohisterectomia (Fêmea)',
};

// --- INTERFACE DE VISUALIZAÇÃO (RESPOSTA DO BACKEND) ---
export interface ClinicalRecord {
  id: number;
  medicalRecordId: number;
  appointmentId?: number | null;
  veterinarianId: number;
  type: ClinicalRecordType;
  treatmentDate: string;
  
  // Triage / Cirurgia
  fitForSurgery?: boolean | null;
  surgeryType?: SurgeryType | null;
  
  // Snapshot Data (Cópia histórica do Animal)
  animalName?: string | null;
  breed?: string | null;
  age?: string | null;
  coat?: string | null;
  weight?: string | null;
  size?: string | null;
  
  // Snapshot Data (Cópia histórica do Tutor)
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerAddress?: string | null;
  ownerNumber?: string | null;
  ownerNeighborhood?: string | null;
  ownerCity?: string | null;
  ownerReference?: string | null;
  
  // Checkboxes de Serviço
  clinicalGuidance?: boolean | null;
  returnVisit?: boolean | null;
  consultation?: boolean | null;
  treatmentChange?: boolean | null;
  
  // Anamnese e Histórico
  anamnesis?: string | null;
  vaccinations?: string | null;
  vaccinationDate?: string | null;
  deworming?: string | null;
  
  // Sinais Vitais
  rectalTemp?: string | null;
  heartRate?: string | null;
  respiratoryRate?: string | null;
  pulse?: string | null;
  
  // Exame Físico por Sistemas
  ectoscopy?: string | null;
  abdominalCavity?: string | null;
  headAndNeck?: string | null;
  nervousSystem?: string | null;
  thoracicCavity?: string | null;
  locomotorSystem?: string | null;
  
  // Diagnóstico e Prognóstico
  provisionalDiagnosis?: string | null;
  complementaryExams?: string | null;
  definitiveDiagnosis?: string | null;
  prognosis?: string | null;
  
  // Observações e Instruções
  observations?: string | null;
  instructions?: string | null;
  additionalNotes?: string | null;
  
  // Relações
  medicalRecord?: {
    id: number;
    animalId: number;
    animal: {
      id: number;
      name: string | null;
      species: string;
      gender: string;
      breed: string | null;
      estimatedAge: string;
      sizeWeight: string;
      petOwner: {
        id: number;
        fullAddress: string;
        user: { 
          completeName: string;
          phone: string;
          cpf: string | null;
        };
      };
    };
  };
  veterinarian?: {
    id: number;
    crmv: string | null;
    user: { completeName: string };
  };
  appointment?: {
    id: number;
    startTime: string;
    serviceType: string;
  };
}

// --- DTO DE CRIAÇÃO (PAYLOAD) ---
export interface CreateClinicalRecordData {
  medicalRecordId: number;
  veterinarianId: number;
  appointmentId?: number;
  type: ClinicalRecordType;
  treatmentDate?: string; // ISO Date String

  // Triage & Cirurgia
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

  // Campos de Texto - Anamnese
  anamnesis?: string;
  vaccinations?: string;
  vaccinationDate?: string;
  deworming?: string;
  
  // Campos de Texto - Sinais Vitais
  rectalTemp?: string;
  heartRate?: string;
  respiratoryRate?: string;
  pulse?: string;
  
  // Campos de Texto - Exame Físico
  ectoscopy?: string;
  abdominalCavity?: string;
  headAndNeck?: string;
  nervousSystem?: string;
  thoracicCavity?: string;
  locomotorSystem?: string;
  
  // Campos de Texto - Diagnóstico
  provisionalDiagnosis?: string;
  complementaryExams?: string;
  definitiveDiagnosis?: string;
  prognosis?: string;
  
  // Campos de Texto - Observações
  observations?: string;
  instructions?: string;
  additionalNotes?: string;
}

export class ClinicalRecordService {
  private static readonly BASE_PATH = "/clinical-record";

  static async getAll(): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get<ClinicalRecord[]>(this.BASE_PATH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getById(id: number): Promise<ClinicalRecord> {
    try {
      const response = await api.get<ClinicalRecord>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async create(data: CreateClinicalRecordData): Promise<ClinicalRecord> {
    try {
      const response = await api.post<ClinicalRecord>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tratamento de erro centralizado
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 403) return new Error("Acesso negado. Apenas veterinários podem realizar esta ação.");
      if (status === 404) return new Error("Registro ou dependência não encontrada.");
      
      return new Error(Array.isArray(message) ? message[0] : message);
    }
    return new Error("Erro desconhecido ao processar ficha clínica.");
  }
}

export default ClinicalRecordService;