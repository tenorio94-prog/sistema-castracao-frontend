import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { CreateUserDto, Role, RegisterResponse } from '@/types/auth.types';

/**
 * Interface para Usuário - Resposta do Backend
 */
export interface User {
  id: number;
  email: string;
  cpf: string;
  phone: string;
  completeName: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  // Relacionamentos (podem estar presentes dependendo da role)
  veterinarian?: {
    id: number;
    userId: number;
    crmv: string | null;
    specialty: string | null;
    active: boolean;
  } | null;
  petOwner?: {
    id: number;
    userId: number;
    fullAddress: string;
  } | null;
}

/**
 * Interface para atualizar usuário
 * Baseada no UpdateUserDto do backend
 */
export interface UpdateUserData {
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
  completeName?: string;
  role?: Role;
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
 * Serviço de Usuários
 */
export class UserService {
  private static readonly BASE_PATH = '/users';

  /**
   * Buscar todos os usuários
   * Retorna array de usuários com relacionamentos
   */
  static async getAll(): Promise<User[]> {
    try {
      console.log('🔍 Buscando todos os usuários');
      const response = await api.get<User[]>(this.BASE_PATH);
      console.log('✅ Usuários recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar usuários');
      throw this.handleError(error);
    }
  }

  /**
   * Buscar usuário por ID
   * @param id - ID do usuário
   */
  static async getById(id: number): Promise<User> {
    try {
      console.log('🔍 Buscando usuário por ID:', id);
      const response = await api.get<User>(`${this.BASE_PATH}/${id}`);
      console.log('✅ Usuário encontrado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID');
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo usuário
   * Este método NÃO deve ser usado diretamente.
   * Use AuthService.register() que cria o usuário com a role correta.
   * O endpoint POST /users existe mas é apenas para admin e casos especiais.
   */
  static async create(data: CreateUserDto): Promise<User> {
    try {
      console.log('🔄 Criando usuário (admin only):', data);
      const response = await api.post<User>(this.BASE_PATH, data);
      console.log('✅ Usuário criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao criar usuário');
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar usuário
   * @param id - ID do usuário
   * @param data - Dados a serem atualizados
   */
  static async update(id: number, data: UpdateUserData): Promise<User> {
    try {
      console.log('🔄 Atualizando usuário:', { id, data });
      const response = await api.patch<User>(`${this.BASE_PATH}/${id}`, data);
      console.log('✅ Usuário atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário');
      throw this.handleError(error);
    }
  }

  /**
   * Deletar usuário
   * @param id - ID do usuário
   */
  static async delete(id: number): Promise<void> {
    try {
      console.log('🗑️ Deletando usuário com ID:', id);
      await api.delete(`${this.BASE_PATH}/${id}`);
      console.log('✅ Usuário deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar usuário');
      throw this.handleError(error);
    }
  }

  /**
   * Filtrar usuários por role (cliente-side)
   * @param users - Array de usuários
   * @param role - Role para filtrar
   */
  static filterByRole(users: User[], role: Role): User[] {
    return users.filter(user => user.role === role);
  }

  /**
   * Filtrar atendentes (receptionist e semas)
   * @param users - Array de usuários
   */
  static filterAttendants(users: User[]): User[] {
    return users.filter(user => 
      user.role === Role.receptionist || user.role === Role.semas
    );
  }

  /**
   * Tratamento de erros
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      console.error('❌ Erro no UserService:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
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
        return new Error('Usuário não encontrado');
      }
      
      if (error.response?.status === 409) {
        return new Error(`Conflito: ${apiMessage}`);
      }
      
      return new Error(apiMessage);
    }
    return new Error('Erro ao processar requisição de usuários');
  }
}
