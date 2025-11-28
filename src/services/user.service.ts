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
      // Tentar endpoint /users/me
      const response = await api.patch<User>(`${this.BASE_PATH}/me`, data);
      return response.data;
    } catch (error) {
      // Se /users/me não existir, tentar /auth/profile
      if (error instanceof AxiosError && error.response?.status === 404) {
        try {
          const response = await api.patch<User>('/auth/profile', data);
          return response.data;
        } catch (profileError) {
          throw this.handleError(profileError);
        }
      }
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
      const apiMessage = error.response?.data?.message || error.message;
      if (error.response?.status === 409) return new Error(`Conflito: ${apiMessage}`);
      return new Error(apiMessage);
    }
    return new Error('Erro ao processar requisição de usuários');
  }
}