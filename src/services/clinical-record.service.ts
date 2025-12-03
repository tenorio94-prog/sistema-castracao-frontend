import api from "@/lib/axios";

// Enums do backend
export enum ClinicalRecordType {
  TRIAGE = "triage",
  SURGERY = "surgery",
  FOLLOW_UP = "followUp",
}

export enum SurgeryType {
  ORCHIECTOMY = "orchiectomy",
  OVARIOHYSTERECTOMY = "ovariohysterectomy",
}

// Interface completa da ficha clínica (todos os 40+ campos)
export interface ClinicalRecord {
  id: number;
  medicalRecordId: number;
  appointmentId?: number;
  veterinarianId: number;
  type: ClinicalRecordType;
  treatmentDate: string;
  
  // Triage
  fitForSurgery?: boolean;
  
  // Surgery
  surgeryType?: SurgeryType;
  
  // === ANIMAL DATA ===
  animalName?: string;
  breed?: string;
  age?: string;
  coat?: string;
  weight?: string;
  size?: string;
  
  // === OWNER DATA ===
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  ownerNumber?: string;
  ownerNeighborhood?: string;
  ownerCity?: string;
  ownerReference?: string;
  
  // === SERVICE TYPE ===
  clinicalGuidance?: boolean;
  returnVisit?: boolean;
  consultation?: boolean;
  treatmentChange?: boolean;
  
  // === HISTORY (ANAMNESIS) ===
  anamnesis?: string;
  vaccinations?: string;
  vaccinationDate?: string;
  deworming?: string;
  
  // === CLINICAL EXAMINATION - VITAL SIGNS ===
  rectalTemp?: string;
  heartRate?: string;
  respiratoryRate?: string;
  pulse?: string;
  
  // === CLINICAL EXAMINATION - SPECIFIC SYSTEMS ===
  ectoscopy?: string;
  abdominalCavity?: string;
  headAndNeck?: string;
  nervousSystem?: string;
  thoracicCavity?: string;
  locomotorSystem?: string;
  
  // === DIAGNOSIS AND PROGNOSIS ===
  provisionalDiagnosis?: string;
  complementaryExams?: string;
  definitiveDiagnosis?: string;
  prognosis?: string;
  
  observations?: string;
  instructions?: string;
  additionalNotes?: string;
  
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
    serviceType: string;
  };
  veterinarian?: {
    id: number;
    user: {
      id: number;
      completeName: string;
    };
  };
}

export interface CreateClinicalRecordData {
  medicalRecordId: number;
  appointmentId?: number;
  veterinarianId: number;
  type: ClinicalRecordType;
  treatmentDate?: string;
  
  // Triage
  fitForSurgery?: boolean;
  
  // Surgery
  surgeryType?: SurgeryType;
  
  // === ANIMAL DATA ===
  animalName?: string;
  breed?: string;
  age?: string;
  coat?: string;
  weight?: string;
  size?: string;
  
  // === OWNER DATA ===
  ownerName?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  ownerNumber?: string;
  ownerNeighborhood?: string;
  ownerCity?: string;
  ownerReference?: string;
  
  // === SERVICE TYPE ===
  clinicalGuidance?: boolean;
  returnVisit?: boolean;
  consultation?: boolean;
  treatmentChange?: boolean;
  
  // === HISTORY (ANAMNESIS) ===
  anamnesis?: string;
  vaccinations?: string;
  vaccinationDate?: string;
  deworming?: string;
  
  // === CLINICAL EXAMINATION - VITAL SIGNS ===
  rectalTemp?: string;
  heartRate?: string;
  respiratoryRate?: string;
  pulse?: string;
  
  // === CLINICAL EXAMINATION - SPECIFIC SYSTEMS ===
  ectoscopy?: string;
  abdominalCavity?: string;
  headAndNeck?: string;
  nervousSystem?: string;
  thoracicCavity?: string;
  locomotorSystem?: string;
  
  // === DIAGNOSIS AND PROGNOSIS ===
  provisionalDiagnosis?: string;
  complementaryExams?: string;
  definitiveDiagnosis?: string;
  prognosis?: string;
  
  observations?: string;
  instructions?: string;
  additionalNotes?: string;
}

export type UpdateClinicalRecordData = Partial<CreateClinicalRecordData>;

class ClinicalRecordService {
  private static readonly BASE_PATH = "/clinical-record";

  /**
   * Busca todas as fichas clínicas
   */
  static async getAll(): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get<ClinicalRecord[]>(this.BASE_PATH);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching clinical records:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para visualizar fichas clínicas.");
      } else if (status === 500) {
        throw new Error("Erro no servidor ao buscar fichas clínicas.");
      }
      throw new Error(message || "Erro ao buscar fichas clínicas");
    }
  }

  /**
   * Busca uma ficha clínica por ID
   */
  static async getById(id: number): Promise<ClinicalRecord> {
    try {
      const response = await api.get<ClinicalRecord>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching clinical record ${id}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error("Ficha clínica não encontrada.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para visualizar esta ficha clínica.");
      }
      throw new Error(message || "Erro ao buscar ficha clínica");
    }
  }

  /**
   * Busca fichas clínicas por prontuário médico
   */
  static async getByMedicalRecord(medicalRecordId: number): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get<ClinicalRecord[]>(
        `${this.BASE_PATH}/medical-record/${medicalRecordId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching clinical records for medical record ${medicalRecordId}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error("Prontuário não encontrado.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      }
      throw new Error(message || "Erro ao buscar fichas clínicas do prontuário");
    }
  }

  /**
   * Busca fichas clínicas por animal
   */
  static async getByAnimal(animalId: number): Promise<ClinicalRecord[]> {
    try {
      const response = await api.get<ClinicalRecord[]>(
        `${this.BASE_PATH}/animal/${animalId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching clinical records for animal ${animalId}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error("Prontuário do animal não encontrado.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      }
      throw new Error(message || "Erro ao buscar fichas clínicas do animal");
    }
  }

  /**
   * Cria uma nova ficha clínica
   */
  static async create(data: CreateClinicalRecordData): Promise<ClinicalRecord> {
    try {
      console.log('📤 Enviando ficha clínica para o backend:', data);
      const response = await api.post<ClinicalRecord>(this.BASE_PATH, data);
      console.log('✅ Resposta do backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao criar ficha clínica:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      const backendError = error.response?.data;

      // Log completo do erro para debug
      if (status === 500) {
        console.error("🔴 Erro 500 detalhado:", backendError);
      }

      if (status === 400) {
        throw new Error(message || "Dados inválidos para criar ficha clínica.");
      } else if (status === 404) {
        throw new Error("Prontuário, veterinário ou agendamento não encontrado.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para criar fichas clínicas.");
      } else if (status === 500) {
        throw new Error(`Erro interno do servidor: ${message}`);
      }
      throw new Error(message || "Erro ao criar ficha clínica");
    }
  }

  /**
   * Atualiza uma ficha clínica existente
   */
  static async update(id: number, data: UpdateClinicalRecordData): Promise<ClinicalRecord> {
    try {
      const response = await api.patch<ClinicalRecord>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating clinical record ${id}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 400) {
        throw new Error(message || "Dados inválidos para atualizar ficha clínica.");
      } else if (status === 404) {
        throw new Error("Ficha clínica não encontrada.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para atualizar fichas clínicas.");
      }
      throw new Error(message || "Erro ao atualizar ficha clínica");
    }
  }

  /**
   * Deleta uma ficha clínica
   */
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting clinical record ${id}:`, error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 404) {
        throw new Error("Ficha clínica não encontrada.");
      } else if (status === 401) {
        throw new Error("Não autorizado. Faça login novamente.");
      } else if (status === 403) {
        throw new Error("Você não tem permissão para deletar fichas clínicas.");
      }
      throw new Error(message || "Erro ao deletar ficha clínica");
    }
  }

  /**
   * Alias para getByAnimal (compatibilidade)
   */
  static async findByAnimal(animalId: number): Promise<ClinicalRecord[]> {
    return this.getByAnimal(animalId);
  }
}

export default ClinicalRecordService;
