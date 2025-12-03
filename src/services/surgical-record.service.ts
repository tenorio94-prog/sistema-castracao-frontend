import api from '@/lib/axios';
import { AxiosError } from 'axios';

/**
 * Interface para Ficha Cirúrgica - Resposta do Backend
 */
export interface SurgicalRecord {
  id: number;
  medicalRecordId: number;
  appointmentId?: number | null;
  recordNumber?: string | null;
  recordDate: string;
  
  // Identificação do Paciente e Tutor
  animalName?: string | null;
  species?: string | null;
  breed?: string | null;
  coat?: string | null;
  size?: string | null;
  gender?: string | null;
  age?: string | null;
  weight?: string | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerAddress?: string | null;
  
  // Relatório da Operação (Equipe e Tempo)
  surgeon?: string | null;
  firstAssistant?: string | null;
  secondAssistant?: string | null;
  instrumentator?: string | null;
  anesthetist?: string | null;
  duration?: string | null;
  surgeryStart?: string | null;
  surgeryEnd?: string | null;
  
  // Diagnósticos e Procedimentos
  preoperativeDiagnosis?: string | null;
  postoperativeDiagnosis?: string | null;
  proposedOperation?: string | null;
  performedOperation?: string | null;
  
  // Detalhes e Pós-Operatório
  materialsUsed?: string | null;
  postoperativeControl?: string | null;
  operationDescription?: string | null;
  
  // Outros
  additionalObservations?: string | null;
  
  createdAt: string;
  updatedAt: string;
  
  // Relações
  medicalRecord?: {
    id: number;
    animalId: number;
    animal: {
      id: number;
      name: string | null;
      species: string;
      breed: string | null;
      gender: string;
      estimatedAge: string;
      sizeWeight: string;
      petOwner: {
        id: number;
        fullAddress: string;
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
    status: string;
  } | null;
}

/**
 * Interface para criar Ficha Cirúrgica
 */
export interface CreateSurgicalRecordData {
  medicalRecordId: number;
  appointmentId?: number;
  recordNumber?: string;
  recordDate?: string;
  
  // Identificação
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
  
  // Equipe e Tempo
  surgeon?: string;
  firstAssistant?: string;
  secondAssistant?: string;
  instrumentator?: string;
  anesthetist?: string;
  duration?: string;
  surgeryStart?: string;
  surgeryEnd?: string;
  
  // Diagnósticos e Procedimentos
  preoperativeDiagnosis?: string;
  postoperativeDiagnosis?: string;
  proposedOperation?: string;
  performedOperation?: string;
  
  // Detalhes
  materialsUsed?: string;
  postoperativeControl?: string;
  operationDescription?: string;
  additionalObservations?: string;
}

/**
 * Interface para atualizar Ficha Cirúrgica
 */
export interface UpdateSurgicalRecordData extends Partial<CreateSurgicalRecordData> {}

export class SurgicalRecordService {
  private static readonly BASE_PATH = '/surgical-record';

  /**
   * Buscar todas as fichas cirúrgicas
   */
  static async getAll(): Promise<SurgicalRecord[]> {
    try {
      const response = await api.get<SurgicalRecord[]>(this.BASE_PATH);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar fichas cirúrgicas:', {
        status: error instanceof AxiosError ? error.response?.status : null,
        message: error instanceof AxiosError ? error.response?.data?.message : null
      });
      
      // Se for erro 500, retornar array vazio
      if (error instanceof AxiosError && error.response?.status === 500) {
        console.warn('⚠️ Servidor retornou erro 500, retornando lista vazia');
        return [];
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Buscar ficha cirúrgica por ID
   */
  static async getById(id: number): Promise<SurgicalRecord> {
    try {
      const response = await api.get<SurgicalRecord>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar ficha cirúrgica:', {
        id,
        status: error instanceof AxiosError ? error.response?.status : null,
        message: error instanceof AxiosError ? error.response?.data?.message : null
      });
      throw this.handleError(error);
    }
  }

  /**
   * Buscar fichas cirúrgicas por prontuário médico
   */
  static async getByMedicalRecord(medicalRecordId: number): Promise<SurgicalRecord[]> {
    try {
      const response = await api.get<SurgicalRecord[]>(
        `${this.BASE_PATH}/medical-record/${medicalRecordId}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar fichas por prontuário:', {
        medicalRecordId,
        status: error instanceof AxiosError ? error.response?.status : null
      });
      
      if (error instanceof AxiosError && error.response?.status === 500) {
        return [];
      }
      
      throw this.handleError(error);
    }
  }

  /**
   * Criar nova ficha cirúrgica
   */
  static async create(data: CreateSurgicalRecordData): Promise<SurgicalRecord> {
    try {
      console.log('📝 Criando ficha cirúrgica:', {
        medicalRecordId: data.medicalRecordId,
        appointmentId: data.appointmentId,
        surgeon: data.surgeon,
        procedure: data.performedOperation
      });

      const response = await api.post<SurgicalRecord>(this.BASE_PATH, data);
      
      console.log('✅ Ficha cirúrgica criada:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar ficha cirúrgica:', {
        status: error instanceof AxiosError ? error.response?.status : null,
        message: error instanceof AxiosError ? error.response?.data?.message : null,
        data: error instanceof AxiosError ? error.response?.data : null
      });
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar ficha cirúrgica
   */
  static async update(id: number, data: UpdateSurgicalRecordData): Promise<SurgicalRecord> {
    try {
      console.log('🔄 Atualizando ficha cirúrgica:', {
        id,
        updates: Object.keys(data)
      });

      const response = await api.patch<SurgicalRecord>(`${this.BASE_PATH}/${id}`, data);
      
      console.log('✅ Ficha cirúrgica atualizada');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar ficha cirúrgica:', {
        id,
        status: error instanceof AxiosError ? error.response?.status : null,
        message: error instanceof AxiosError ? error.response?.data?.message : null
      });
      throw this.handleError(error);
    }
  }

  /**
   * Deletar ficha cirúrgica
   */
  static async delete(id: number): Promise<void> {
    try {
      console.log('🗑️ Deletando ficha cirúrgica:', id);
      
      await api.delete(`${this.BASE_PATH}/${id}`);
      
      console.log('✅ Ficha cirúrgica deletada');
    } catch (error) {
      console.error('❌ Erro ao deletar ficha cirúrgica:', {
        id,
        status: error instanceof AxiosError ? error.response?.status : null,
        message: error instanceof AxiosError ? error.response?.data?.message : null
      });
      throw this.handleError(error);
    }
  }

  /**
   * Tratamento de erros padronizado
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (statusCode === 400) {
        return new Error(`Dados inválidos: ${message}`);
      }
      if (statusCode === 401) {
        return new Error('Não autorizado. Faça login novamente.');
      }
      if (statusCode === 403) {
        return new Error('Acesso negado: permissão insuficiente');
      }
      if (statusCode === 404) {
        return new Error('Ficha cirúrgica ou prontuário não encontrado');
      }
      if (statusCode === 409) {
        return new Error(`Conflito: ${message}`);
      }
      if (statusCode === 500) {
        return new Error('Erro no servidor. Tente novamente mais tarde.');
      }
      
      return new Error(message || 'Erro ao processar requisição');
    }
    return new Error('Erro ao processar requisição de fichas cirúrgicas');
  }
}
