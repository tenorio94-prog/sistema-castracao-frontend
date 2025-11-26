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