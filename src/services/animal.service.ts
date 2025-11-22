import api from '@/lib/axios';
import { AxiosError } from 'axios';

/**
 * Interface para Animal
 */
export interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  sex?: 'MALE' | 'FEMALE';
  status?: 'COMPLETED' | 'PENDING_SCREENING' | 'PENDING_RETURN' | 'UNFIT';
  petOwnerId: string;
  petOwner?: {
    id: string;
    name: string;
    type: 'INDIVIDUAL' | 'NGO';
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface para criar animal
 */
export interface CreateAnimalData {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  sex?: 'MALE' | 'FEMALE';
  petOwnerId: string;
}

/**
 * Interface para atualizar animal
 */
export interface UpdateAnimalData {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  weight?: number;
  sex?: 'MALE' | 'FEMALE';
  status?: 'COMPLETED' | 'PENDING_SCREENING' | 'PENDING_RETURN' | 'UNFIT';
  petOwnerId?: string;
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
 * Serviço de Animais
 */
export class AnimalService {
  private static readonly BASE_PATH = '/animals';

  /**
   * Buscar todos os animais
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    species?: string;
    status?: string;
    petOwnerId?: string;
  }): Promise<Animal[] | PaginatedResponse<Animal>> {
    try {
      const response = await api.get<Animal[] | PaginatedResponse<Animal>>(
        this.BASE_PATH,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar animal por ID
   */
  static async getById(id: string): Promise<Animal> {
    try {
      const response = await api.get<Animal>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo animal
   */
  static async create(data: CreateAnimalData): Promise<Animal> {
    try {
      const response = await api.post<Animal>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar animal
   */
  static async update(id: string, data: UpdateAnimalData): Promise<Animal> {
    try {
      const response = await api.put<Animal>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deletar animal
   */
  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar animais por responsável
   */
  static async getByPetOwner(petOwnerId: string): Promise<Animal[]> {
    try {
      const response = await api.get<Animal[]>(`${this.BASE_PATH}/petowner/${petOwnerId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar animais por espécie
   */
  static async getBySpecies(species: string): Promise<Animal[]> {
    try {
      const response = await api.get<Animal[]>(`${this.BASE_PATH}/species/${species}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar animais por status
   */
  static async getByStatus(status: string): Promise<Animal[]> {
    try {
      const response = await api.get<Animal[]>(`${this.BASE_PATH}/status/${status}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar histórico médico do animal
   */
  static async getMedicalHistory(id: string): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`${this.BASE_PATH}/${id}/medical-history`);
      return response.data;
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
    return new Error('Erro ao processar requisição de animais');
  }
}
