import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { Role } from '@/types/auth.types';

/**
 * Interface para Veterinário
 * Retorno da API usa "completeName"
 */
export interface Veterinarian {
  id: string;
  completeName: string;
  email: string;
  cpf?: string;
  phone?: string;
  crmv: string;
  specialty?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para criar veterinário
 * Nota: O backend usa "completeName" e não "name"
 */
export interface CreateVeterinarianData {
  completeName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  crmv: string;
  specialty?: string;
}

/**
 * Interface para atualizar veterinário
 */
export interface UpdateVeterinarianData {
  completeName?: string;
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
  crmv?: string;
  specialty?: string;
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
  private static readonly BASE_PATH = '/users'; // Veterinários são users com role 'veterinarian'

  /**
   * Buscar todos os veterinários
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    specialty?: string;
  }): Promise<Veterinarian[] | PaginatedResponse<Veterinarian>> {
    try {
      // Adiciona filtro de role para buscar apenas veterinários
      const requestParams = {
        ...params,
        role: Role.veterinarian
      };
      
      console.log('🔍 Buscando veterinários com params:', requestParams);
      
      const response = await api.get<Veterinarian[] | PaginatedResponse<Veterinarian>>(
        this.BASE_PATH,
        { params: requestParams }
      );
      
      console.log('✅ Veterinários recebidos:', response.data);
      console.log('✅ Primeiro veterinário (detalhado):', Array.isArray(response.data) ? response.data[0] : response.data.data?.[0]);
      
      // Garantir que retorna apenas veterinários (filtro adicional no frontend)
      const data = Array.isArray(response.data) ? response.data : response.data.data;
      
      // Log de cada veterinário antes do filtro
      console.log('📋 Veterinários antes do filtro:', data?.map((v: any) => ({
        id: v.id,
        completeName: v.completeName,
        email: v.email,
        role: v.role,
        crmv: v.crmv,
        specialty: v.specialty,
        veterinarian: v.veterinarian // Caso tenha nested
      })));
      
      const veterinarians = data.filter((user: any) => user.role === Role.veterinarian);
      
      console.log('✅ Veterinários filtrados:', veterinarians);
      
      return Array.isArray(response.data) 
        ? veterinarians 
        : { ...response.data, data: veterinarians, total: veterinarians.length };
        
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar veterinário por ID
   */
  static async getById(id: string): Promise<Veterinarian> {
    try {
      const response = await api.get<Veterinarian>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo veterinário
   * Usa o endpoint /auth/register com role veterinarian
   */
  static async create(data: CreateVeterinarianData): Promise<Veterinarian> {
    try {
      console.log('🔄 Criando veterinário com dados:', data);
      
      // Payload exato que o backend espera
      const payload = {
        completeName: data.completeName,
        email: data.email,
        password: data.password,
        cpf: data.cpf,
        phone: data.phone,
        role: Role.veterinarian,
        crmv: data.crmv,
        specialty: data.specialty,
        active: true
      };
      
      console.log('📤 Payload enviado:', payload);
      
      const response = await api.post<any>('/auth/register', payload);
      
      console.log('✅ Response completo:', response);
      console.log('✅ Response.data:', response.data);
      console.log('✅ Response.data.user:', response.data.user);
      
      // O backend pode retornar { user: {...} } ou diretamente o user
      const userData = response.data.user || response.data;
      
      console.log('✅ UserData final:', userData);
      console.log('✅ CRMV no userData:', userData.crmv);
      console.log('✅ Specialty no userData:', userData.specialty);
      
      return userData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar veterinário
   */
  static async update(id: string, data: UpdateVeterinarianData): Promise<Veterinarian> {
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
  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar veterinários por especialidade
   */
  static async getBySpecialty(specialty: string): Promise<Veterinarian[]> {
    try {
      const response = await api.get<Veterinarian[]>(this.BASE_PATH, {
        params: {
          role: Role.veterinarian,
          specialty: specialty
        }
      });
      return Array.isArray(response.data) ? response.data : (response.data as any).data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar agenda do veterinário
   * Nota: Este endpoint pode não existir, ajuste conforme sua API
   */
  static async getSchedule(id: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`/veterinarians/${id}/schedule`, { params });
      return response.data;
    } catch (error) {
      // Se o endpoint não existir, retorna array vazio ao invés de erro
      console.warn('Endpoint de agenda não disponível:', error);
      return [];
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
