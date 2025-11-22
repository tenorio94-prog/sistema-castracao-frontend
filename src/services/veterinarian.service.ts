import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { Role } from '@/types/auth.types';

/**
 * Interface para Veterinário do backend
 */
export interface Veterinarian {
  id: number;
  userId: number;
  crmv: string;
  specialty?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: number;
    completeName: string;
    email: string;
    cpf: string;
    phone: string;
    role: string;
  };
  _count?: {
    clinicalRecords: number;
  };
}

/**
 * Interface para criar veterinário no backend
 */
export interface CreateVeterinarianData {
  crmv: string;
  active?: boolean;
}

/**
 * Interface para atualizar veterinário
 */
export interface UpdateVeterinarianData {
  crmv?: string;
  specialty?: string;
  active?: boolean;
  email?: string;
  password?: string;
  phone?: string;
  completeName?: string;
  cpf?: string;
}

/**
 * Interface para resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Serviço de Veterinários
 */
export class VeterinarianService {
  private static readonly BASE_PATH = '/veterinarian';

  /**
   * Buscar todos os veterinários
   */
  static async getAll(): Promise<Veterinarian[]> {
    try {
      // Incluir o user relacionado via query param
      const response = await api.get<Veterinarian[]>(`${this.BASE_PATH}?include=user`);
      console.log('✅ Veterinários recebidos do backend:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar veterinário por ID
   */
  static async getById(id: number): Promise<Veterinarian> {
    try {
      const response = await api.get<Veterinarian>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo veterinário
   * Usa o endpoint /veterinarian com apenas crmv e active
   */
  static async create(data: CreateVeterinarianData): Promise<Veterinarian> {
    try {
      console.log('🔄 Criando veterinário com dados:', data);
      
      const response = await api.post<Veterinarian>(this.BASE_PATH, data);
      
      console.log('✅ Veterinário criado:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar veterinário
   */
  static async update(id: number, data: UpdateVeterinarianData): Promise<Veterinarian> {
    try {
      const response = await api.patch<Veterinarian>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deletar veterinário
   */
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Tratamento de erros
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      console.error('❌ Erro no VeterinarianService:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? JSON.parse(error.config.data) : null
        }
      });

      const apiMessage = error.response?.data?.message || error.message;
      const apiErrors = error.response?.data?.errors;
      
      // Tratamento específico para erro 400 (Bad Request)
      if (error.response?.status === 400) {
        if (apiErrors && Array.isArray(apiErrors)) {
          const errorMessages = apiErrors.map((err: any) => err.message || err).join(', ');
          return new Error(`Dados inválidos: ${errorMessages}`);
        }
        return new Error(`Dados inválidos: ${apiMessage}`);
      }
      
      // Tratamento específico para erro 500 (Internal Server Error)
      if (error.response?.status === 500) {
        console.error('🔥 ERRO 500 - Detalhes completos:', {
          responseData: error.response?.data,
          requestPayload: error.config?.data ? JSON.parse(error.config.data) : null,
          endpoint: error.config?.url
        });
        
        if (apiErrors && Array.isArray(apiErrors)) {
          const errorMessages = apiErrors.map((err: any) => err.message || err).join(', ');
          return new Error(`Erro no servidor: ${errorMessages}`);
        }
        return new Error(`Erro no servidor: ${apiMessage || 'Verifique os dados enviados e tente novamente.'}`);
      }
      
      // Tratamento específico para erro 404
      if (error.response?.status === 404) {
        return new Error('Endpoint não encontrado. Verifique se o backend está rodando corretamente.');
      }
      
      return new Error(apiMessage);
    }
    return new Error('Erro ao processar requisição de veterinários');
  }
}
