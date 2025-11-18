import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { CreateUserDto, Role, RegisterResponse } from '@/types/auth.types';

/**
 * Interface para Usuário
 */
export interface User {
  id: string;
  email: string;
  cpf?: string;
  phone?: string;
  completeName?: string;
  role: Role;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  address?: string;
  active?: boolean;
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
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<User[] | PaginatedResponse<User>> {
    try {
      const response = await api.get<User[] | PaginatedResponse<User>>(
        this.BASE_PATH,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getById(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`${this.BASE_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Criar novo usuário (usa /auth/register)
   */
  static async create(data: CreateUserDto): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Atualizar usuário
   */
  static async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await api.put<User>(`${this.BASE_PATH}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Deletar usuário
   */
  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Buscar usuários por role
   */
  static async getByRole(role: string): Promise<User[]> {
    try {
      const response = await api.get<User[]>(`${this.BASE_PATH}/role/${role}`);
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
    return new Error('Erro ao processar requisição de usuários');
  }
}
