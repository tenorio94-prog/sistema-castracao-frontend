import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { Role } from '@/types/auth.types';

/**
 * Interface para Veterinário do backend
 * Baseada na resposta do endpoint GET /veterinarian
 */
export interface Veterinarian {
  id: number;
  userId: number;
  crmv: string | null;
  specialty: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id?: number;
    completeName: string;
    email: string;
    cpf: string;
    phone: string;
    role?: string;
  };
  _count?: {
    clinicalRecords: number;
  };
}

/**
 * Interface para criar veterinário no backend
 * O veterinário deve ser criado APÓS a criação do usuário
 */
export interface CreateVeterinarianData {
  crmv?: string;
  specialty?: string;
  active?: boolean;
}

/**
 * Interface para atualizar veterinário
 * Baseada no UpdateVeterinarianDto do backend
 * Permite atualizar tanto campos do veterinarian quanto do user relacionado
 */
export interface UpdateVeterinarianData {
  // Campos do Veterinarian
  crmv?: string;
  specialty?: string;
  active?: boolean;
  
  // Campos do User (podem ser atualizados junto)
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
   * Buscar perfil do veterinário logado
   * Tenta /veterinarian/me primeiro, depois busca na lista como fallback
   */
  static async getMe(): Promise<Veterinarian> {
    try {
      // Tentar endpoint /veterinarian/me (se existir no backend)
      console.log('🔍 Buscando perfil do veterinário logado...');
      const response = await api.get<Veterinarian>(`${this.BASE_PATH}/me`);
      console.log('✅ Perfil do veterinário obtido:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Se /veterinarian/me não existir (404), tentar buscar na lista
        if (error.response?.status === 404) {
          console.warn('⚠️ Endpoint /veterinarian/me não existe, tentando buscar na lista...');
          return this.findMeInList();
        }
        // Se for 403 (acesso negado), tentar buscar na lista
        if (error.response?.status === 403) {
          console.warn('⚠️ Acesso negado ao /veterinarian/me, tentando buscar na lista...');
          return this.findMeInList();
        }
      }
      throw this.handleError(error);
    }
  }

  /**
   * Buscar o veterinário logado na lista de todos os veterinários
   * Fallback quando /veterinarian/me não está disponível
   */
  private static async findMeInList(): Promise<Veterinarian> {
    try {
      // Obter userId do token
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!userStr) {
        throw new Error('Usuário não autenticado');
      }
      
      const user = JSON.parse(userStr);
      const userId = parseInt(user.sub, 10);
      
      console.log('🔍 Buscando veterinário na lista pelo userId:', userId);
      
      // Buscar todos os veterinários
      const allVeterinarians = await this.getAll();
      
      // Encontrar o veterinário com o userId correspondente
      const myProfile = allVeterinarians.find(vet => vet.userId === userId);
      
      if (!myProfile) {
        throw new Error('Perfil de veterinário não encontrado para este usuário');
      }
      
      console.log('✅ Veterinário encontrado na lista:', myProfile);
      return myProfile;
    } catch (error) {
      console.error('❌ Erro ao buscar veterinário na lista:', error);
      throw error;
    }
  }

  /**
   * Atualizar perfil do veterinário logado
   */
  static async updateMe(data: UpdateVeterinarianData): Promise<Veterinarian> {
    try {
      // Tentar endpoint /veterinarian/me primeiro
      console.log('🔄 Atualizando perfil do veterinário logado...');
      const response = await api.patch<Veterinarian>(`${this.BASE_PATH}/me`, data);
      console.log('✅ Perfil atualizado:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Se /veterinarian/me não existir, tentar pelo userId
        if (error.response?.status === 404 || error.response?.status === 403) {
          console.warn('⚠️ Endpoint /veterinarian/me não disponível, tentando pelo userId...');
          
          // Obter userId do token
          const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          if (!userStr) {
            throw new Error('Usuário não autenticado');
          }
          
          const user = JSON.parse(userStr);
          const userId = parseInt(user.sub, 10);
          
          return this.update(userId, data);
        }
      }
      throw this.handleError(error);
    }
  }

  /**
   * Buscar todos os veterinários
   * Retorna veterinários com dados do user relacionado
   */
  static async getAll(): Promise<Veterinarian[]> {
    try {
      const response = await api.get<Veterinarian[]>(this.BASE_PATH);
      console.log('✅ Veterinários recebidos do backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar veterinários');
      throw this.handleError(error);
    }
  }

  /**
   * Buscar veterinário por ID
   * @param userId - ID do usuário (não é o veterinarianId)
   */
  static async getById(userId: number): Promise<Veterinarian> {
    try {
      console.log('🔍 Buscando veterinário por userId:', userId);
      const response = await api.get<Veterinarian>(`${this.BASE_PATH}/${userId}`);
      console.log('✅ Veterinário encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar veterinário por ID');
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo veterinário vinculado a um usuário existente
   * Este método NÃO deve ser usado para criar novos veterinários do zero.
   * Use AuthService.register() que cria o usuário E o veterinário automaticamente.
   * Este método é apenas para casos especiais onde o usuário já existe.
   */
  static async createForExistingUser(userId: number, data: CreateVeterinarianData): Promise<Veterinarian> {
    try {
      console.log('🔄 Criando veterinário para usuário existente:', { userId, data });
      
      const response = await api.post<Veterinarian>(this.BASE_PATH, data);
      
      console.log('✅ Veterinário criado:', response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar veterinário
   * @param userId - ID do usuário (não é o veterinarianId)
   * @param data - Dados a serem atualizados (campos do user e/ou veterinarian)
   */
  static async update(userId: number, data: UpdateVeterinarianData): Promise<Veterinarian> {
    try {
      console.log('🔄 Atualizando veterinário:', { userId, data });
      const response = await api.patch<Veterinarian>(`${this.BASE_PATH}/${userId}`, data);
      console.log('✅ Veterinário atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar veterinário');
      throw this.handleError(error);
    }
  }

  /**
   * Deletar veterinário
   * Deleta o usuário e automaticamente deleta o veterinarian relacionado (cascade)
   * @param userId - ID do usuário (não é o veterinarianId)
   */
  static async delete(userId: number): Promise<void> {
    try {
      console.log('🗑️ Deletando veterinário com userId:', userId);
      await api.delete(`${this.BASE_PATH}/${userId}`);
      console.log('✅ Veterinário deletado com sucesso');
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
