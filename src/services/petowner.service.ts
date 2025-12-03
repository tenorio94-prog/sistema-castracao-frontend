import api from '@/lib/axios';
import { AxiosError } from 'axios';

/**
 * Interface para Responsável (Pet Owner) - Resposta do Backend
 * PetOwner é uma extensão de User
 */
export interface PetOwner {
  id: number;              // petOwnerId
  userId: number;          // ID do user relacionado
  fullAddress: string;
  nis: string | null;
  type?: 'individual' | 'ngo'; // Tipo de responsável
  documentUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id?: number;
    completeName: string;
    email: string;
    cpf?: string;
    cnpj?: string;
    phone: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  _count?: {
    animals: number;
  };
}

/**
 * Interface para criar PetOwner no backend
 * O PetOwner deve ser criado APÓS a criação do usuário
 * Este DTO é usado no POST /pet-owner (apenas para vincular user existente)
 */
export interface CreatePetOwnerData {
  fullAddress: string;
  nis?: string;
  documentUrl?: string;
}

/**
 * Interface para atualizar PetOwner
 * Baseada no UpdatePetOwnerDto do backend
 * Permite atualizar tanto campos do petOwner quanto do user relacionado
 */
export interface UpdatePetOwnerData {
  // Campos do PetOwner
  fullAddress?: string;
  documentUrl?: string;
  
  // Campos do User (podem ser atualizados junto)
  email?: string;
  password?: string;
  completeName?: string;
  phone?: string;
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
 * Serviço de Responsáveis (Pet Owners)
 */
export class PetOwnerService {
  private static readonly BASE_PATH = '/pet-owner';

  /**
   * Buscar todos os responsáveis
   * Retorna petOwners com dados do user relacionado
   */
  static async getAll(): Promise<PetOwner[]> {
    try {
      console.log('🔍 Buscando todos os pet owners');
      const response = await api.get<PetOwner[]>(this.BASE_PATH);
      console.log('✅ Pet owners recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar pet owners');
      throw this.handleError(error);
    }
  }

  /**
   * Buscar responsável por ID
   * @param userId - ID do usuário (não é o petOwnerId)
   */
  static async getById(userId: number): Promise<PetOwner> {
    try {
      console.log('🔍 Buscando pet owner por userId:', userId);
      const response = await api.get<PetOwner>(`${this.BASE_PATH}/${userId}`);
      console.log('✅ Pet owner encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar pet owner por ID');
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo PetOwner vinculado ao usuário autenticado
   * Requer que o usuário esteja autenticado (token JWT)
   * O backend pega o userId do token automaticamente
   */
  static async create(data: CreatePetOwnerData): Promise<PetOwner> {
    try {
      console.log('🔄 Criando pet owner (autenticado):', data);
      const response = await api.post<PetOwner>(this.BASE_PATH, data);
      console.log('✅ Pet owner criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar pet owner');
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo PetOwner vinculado a um usuário existente
   * Este método NÃO deve ser usado para criar novos responsáveis do zero.
   * Use AuthService.register() que cria o usuário E o petOwner automaticamente.
   * Este método é apenas para casos especiais onde o usuário já existe.
   */
  static async createForExistingUser(userId: number, data: CreatePetOwnerData): Promise<PetOwner> {
    try {
      console.log('🔄 Criando pet owner para usuário existente:', { userId, data });
      const response = await api.post<PetOwner>(this.BASE_PATH, data);
      console.log('✅ Pet owner criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar pet owner');
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar responsável
   * @param userId - ID do usuário (não é o petOwnerId)
   * @param data - Dados a serem atualizados (campos do user e/ou petOwner)
   */
  static async update(userId: number, data: UpdatePetOwnerData): Promise<PetOwner> {
    try {
      console.log('🔄 Atualizando pet owner:', { userId, data });
      const response = await api.patch<PetOwner>(`${this.BASE_PATH}/${userId}`, data);
      console.log('✅ Pet owner atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar pet owner');
      throw this.handleError(error);
    }
  }

  /**
   * Deletar responsável
   * Deleta o usuário e automaticamente deleta o petOwner relacionado (cascade)
   * @param userId - ID do usuário (não é o petOwnerId)
   */
  static async delete(userId: number): Promise<void> {
    try {
      console.log('🗑️ Deletando pet owner com userId:', userId);
      await api.delete(`${this.BASE_PATH}/${userId}`);
      console.log('✅ Pet owner deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar pet owner');
      throw this.handleError(error);
    }
  }

  /**
   * Buscar responsável por email
   * @param email - Email do responsável
   */
  static async getByEmail(email: string): Promise<PetOwner> {
    try {
      console.log('🔍 Buscando pet owner por email:', email);
      const response = await api.get<PetOwner>(`${this.BASE_PATH}/email/${email}`);
      console.log('✅ Pet owner encontrado por email');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar pet owner por email');
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
   * Buscar animais do responsável logado
   */
  static async getMyPets(): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`${this.BASE_PATH}/me/pets`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar agendamentos do responsável logado
   */
  static async getMyAppointments(): Promise<any[]> {
    try {
      const response = await api.get<any[]>(`${this.BASE_PATH}/me/appointments`);
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
      console.error('❌ Erro no PetOwnerService:', {
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
      
      if (error.response?.status === 400) {
        if (apiErrors && Array.isArray(apiErrors)) {
          const errorMessages = apiErrors.map((err: any) => err.message || err).join(', ');
          return new Error(`Dados inválidos: ${errorMessages}`);
        }
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
