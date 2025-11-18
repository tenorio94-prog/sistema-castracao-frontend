import api from '@/lib/axios';
import { AxiosError } from 'axios';

/**
 * Interface para PetOwner do backend (baseado no Prisma schema)
 */
export interface PetOwner {
  id: number;
  userId: number;
  fullAddress: string | null;
  user?: {
    id: number;
    completeName: string;
    email: string;
    cpf: string;
    phone: string;
  };
  _count?: {
    animals: number;
  };
  commitmentTerms?: CommitmentTerm[];
}

/**
 * Interface para CommitmentTerm
 */
export interface CommitmentTerm {
  id: number;
  documentUrl: string;
  signatureDate: Date;
}

/**
 * Interface para criar PetOwner (via AuthService)
 * PetOwner é criado via POST /auth/register com role: petOwner
 */
export interface CreatePetOwnerDto {
  fullAddress: string;
  documentUrl?: string;
}

/**
 * Interface para atualizar PetOwner
 */
export interface UpdatePetOwnerDto {
  fullAddress?: string;
  email?: string;
  password?: string;
  phone?: string;
  completeName?: string;
  cpf?: string;
}

/**
 * Serviço de PetOwners (Responsáveis)
 */
export class PetOwnerService {
  private static readonly BASE_PATH = '/pet-owner';

  /**
   * Buscar todos os pet owners
   */
  static async getAll(): Promise<PetOwner[]> {
    try {
      const response = await api.get<PetOwner[]>(this.BASE_PATH);
      console.log('✅ PetOwners recebidos do backend:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar pet owner por ID (userId)
   */
  static async getById(userId: number): Promise<PetOwner> {
    try {
      const response = await api.get<PetOwner>(`${this.BASE_PATH}/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar pet owner por email
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
   * Criar novo pet owner
   * Primeiro cria o User via AuthService, depois cria o PetOwner
   */
  static async create(dto: CreatePetOwnerDto): Promise<PetOwner> {
    try {
      console.log('🔄 Criando pet owner:', dto);
      const response = await api.post<PetOwner>(this.BASE_PATH, dto);
      console.log('✅ PetOwner criado:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar pet owner (usa userId, não petOwnerId)
   */
  static async update(userId: number, dto: UpdatePetOwnerDto): Promise<PetOwner> {
    try {
      const response = await api.patch<PetOwner>(`${this.BASE_PATH}/${userId}`, dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deletar pet owner
   */
  static async delete(userId: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${userId}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar animais de um pet owner
   */
  static async getAnimals(userId: number): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`${this.BASE_PATH}/${userId}/animals`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Rotas para o pet owner logado
   */
  static async getMe(): Promise<PetOwner> {
    try {
      const response = await api.get<PetOwner>(`${this.BASE_PATH}/me`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getMyPets(): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`${this.BASE_PATH}/me/pets`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updateMe(dto: UpdatePetOwnerDto): Promise<PetOwner> {
    try {
      const response = await api.patch<PetOwner>(`${this.BASE_PATH}/me`, dto);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

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
      console.error('❌ Erro no PetOwnerService:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      const apiMessage = error.response?.data?.message || error.message;
      
      if (error.response?.status === 400) {
        return new Error(`Dados inválidos: ${apiMessage}`);
      }
      
      if (error.response?.status === 404) {
        return new Error('Responsável não encontrado');
      }
      
      if (error.response?.status === 409) {
        return new Error(`Conflito: ${apiMessage}`);
      }
      
      return new Error(apiMessage);
    }
    return new Error('Erro ao processar requisição de responsáveis');
  }
}

