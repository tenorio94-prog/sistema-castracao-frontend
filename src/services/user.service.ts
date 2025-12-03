import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { CreateUserDto, Role } from '@/types/auth.types';

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
  // Relacionamentos
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
    nis?: string | null;
  } | null;
}

/**
 * Interface para atualizar usuário
 */
export interface UpdateUserData {
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
  completeName?: string;
  role?: Role;
  crmv?: string;
  specialty?: string;
  address?: string;
  nis?: string;
}

export class UserService {
  private static readonly BASE_PATH = '/users';

  /**
   * Buscar perfil do usuário logado (próprio usuário)
   * Tenta /users/me primeiro, depois /auth/profile como fallback
   */
  static async getMe(): Promise<User> {
    try {
      // Tentar endpoint /users/me
      const response = await api.get<User>(`${this.BASE_PATH}/me`);
      return response.data;
    } catch (error) {
      // Se /users/me não existir, tentar /auth/profile
      if (error instanceof AxiosError && error.response?.status === 404) {
        try {
          const response = await api.get<User>('/auth/profile');
          return response.data;
        } catch (profileError) {
          throw this.handleError(profileError);
        }
      }
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar perfil do usuário logado (próprio usuário)
   */
  static async updateMe(data: UpdateUserData): Promise<User> {
    try {
      // Primeiro, buscar dados do usuário para obter o ID
      const currentUser = await this.getMe();
      
      console.log('🔄 Atualizando usuário:', {
        userId: currentUser.id,
        updates: Object.keys(data)
      });
      
      // Filtrar apenas campos que o backend aceita
      const allowedFields: UpdateUserData = {};
      
      if (data.completeName !== undefined) allowedFields.completeName = data.completeName;
      if (data.email !== undefined) allowedFields.email = data.email;
      if (data.phone !== undefined) allowedFields.phone = data.phone;
      if (data.password !== undefined) allowedFields.password = data.password;
      if (data.cpf !== undefined) allowedFields.cpf = data.cpf;
      if (data.role !== undefined) allowedFields.role = data.role;
      
      // Usar endpoint /users/:id para atualização
      const response = await api.patch<User>(`${this.BASE_PATH}/${currentUser.id}`, allowedFields);
      
      console.log('✅ Usuário atualizado com sucesso');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', {
        error: error instanceof AxiosError ? {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data
        } : error
      });
      throw this.handleError(error);
    }
  }

  static async getAll(): Promise<User[]> {
    try {
      const response = await api.get<User[]>(this.BASE_PATH);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getById(id: number): Promise<User> {
    try {
      const response = await api.get<User>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async create(data: CreateUserDto): Promise<User> {
    try {
      const response = await api.post<User>(this.BASE_PATH, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async update(id: number, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch<User>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // --- MÉTODOS AUXILIARES (Adicionados) ---

  /**
   * Filtra usuários para retornar apenas atendentes (Recepcionista e SEMAS)
   */
  static filterAttendants(users: User[]): User[] {
    return users.filter(user => 
      user.role === Role.receptionist || user.role === Role.semas
    );
  }

  /**
   * Filtra usuários por uma role específica
   */
  static filterByRole(users: User[], role: Role): User[] {
    return users.filter(user => user.role === role);
  }

  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const apiMessage = error.response?.data?.message || error.message;
      
      // Mensagens específicas por código de erro
      if (statusCode === 400) return new Error(`Dados inválidos: ${apiMessage}`);
      if (statusCode === 401) return new Error('Não autorizado. Faça login novamente.');
      if (statusCode === 403) return new Error('Acesso negado: permissão insuficiente');
      if (statusCode === 404) return new Error('Usuário não encontrado');
      if (statusCode === 409) return new Error(`Conflito: ${apiMessage}`);
      if (statusCode === 500) return new Error('Erro no servidor. Tente novamente mais tarde.');
      
      return new Error(apiMessage || 'Erro ao processar requisição');
    }
    return new Error('Erro ao processar requisição de usuários');
  }
}