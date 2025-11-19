import api from '@/lib/axios';
import { AxiosError } from 'axios';

/**
 * Interface para Responsável (Pet Owner)
 */
export interface PetOwner {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'NGO';
  cpf?: string;
  nis?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para criar responsável
 */
export interface CreatePetOwnerData {
  name: string;
  type: 'INDIVIDUAL' | 'NGO';
  cpf?: string;
  nis?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  password?: string;
}

/**
 * Interface para atualizar responsável
 */
export interface UpdatePetOwnerData {
  name?: string;
  type?: 'INDIVIDUAL' | 'NGO';
  cpf?: string;
  nis?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  password?: string;
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
 * Serviço de Responsáveis (Pet Owners)
 */
export class PetOwnerService {
  private static readonly BASE_PATH = '/pet-owner';

  /**
   * Buscar todos os responsáveis
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'INDIVIDUAL' | 'NGO';
  }): Promise<PetOwner[] | PaginatedResponse<PetOwner>> {
    try {
      const response = await api.get<PetOwner[] | PaginatedResponse<PetOwner>>(
        this.BASE_PATH,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar responsável por ID
   */
  static async getById(id: string): Promise<PetOwner> {
    try {
      const response = await api.get<PetOwner>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo responsável
   */
  static async create(data: CreatePetOwnerData): Promise<PetOwner> {
    try {
      const response = await api.post<PetOwner>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar responsável
   */
  static async update(id: string, data: UpdatePetOwnerData): Promise<PetOwner> {
    try {
      const response = await api.put<PetOwner>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deletar responsável
   */
  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar responsáveis por tipo
   */
  static async getByType(type: 'INDIVIDUAL' | 'NGO'): Promise<PetOwner[]> {
    try {
      const response = await api.get<PetOwner[]>(`${this.BASE_PATH}/type/${type}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar animais de um responsável
   */
  static async getAnimals(id: string): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`${this.BASE_PATH}/me/pets`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar responsável por email
   */
  static async getByEmail(email: string): Promise<PetOwner> {
    try {
      const response = await api.get<PetOwner>(`${this.BASE_PATH}/email/${email}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar perfil do responsável logado
   */
  static async getMe(): Promise<PetOwner> {
    try {
      const response = await api.get<PetOwner>(`${this.BASE_PATH}/me`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar perfil do responsável logado
   */
  static async updateMe(data: UpdatePetOwnerData): Promise<PetOwner> {
    try {
      const response = await api.patch<PetOwner>(`${this.BASE_PATH}/me`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deletar perfil do responsável logado
   */
  static async deleteMe(): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/me`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Tratamento de erros
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return new Error('Erro ao processar requisição de responsáveis');
  }
}
