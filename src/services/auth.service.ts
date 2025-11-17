import api from '@/lib/axios';
import { AxiosError } from 'axios';

/**
 * Interface para os dados de login
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface para registro de usuário
 */
export interface RegisterData {
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
  role: 'admin' | 'veterinarian' | 'attendant' | 'petOwner';
  crmv?: string; // Required for veterinarian
  address?: string; // Required for petOwner
  active?: boolean;
}

/**
 * Interface para a resposta de login bem-sucedido
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

/**
 * Interface para erros de API
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Serviço de Autenticação
 * Centraliza todas as chamadas relacionadas à autenticação
 */
export class AuthService {
  /**
   * Realiza o login do usuário
   * @param credentials - Email e senha do usuário
   * @returns Dados do usuário e tokens de acesso
   */
  static async login(credentials: LoginData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Registra um novo usuário no sistema
   * @param data - Dados do usuário a ser registrado
   * @returns Dados do usuário criado e tokens
   */
  static async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Realiza o logout do usuário
   */
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar tokens independentemente do resultado
      this.clearTokens();
    }
  }

  /**
   * Renova o access token usando o refresh token
   * @param refreshToken - Token de renovação
   */
  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Salva os tokens no localStorage
   */
  static saveTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Remove os tokens do localStorage
   */
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      return !!token;
    }
    return false;
  }

  /**
   * Obtém o token de acesso atual
   */
  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * Trata erros de requisição da API
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });
      
      // Erros de validação
      if (apiError?.errors) {
        const errorMessages = Object.values(apiError.errors).flat();
        return new Error(errorMessages.join(', '));
      }
      
      // Mensagem de erro da API
      if (apiError?.message) {
        return new Error(apiError.message);
      }
      
      // Erro de rede ou timeout
      if (error.code === 'ECONNABORTED') {
        return new Error('O servidor está demorando para responder. Isso é normal quando o serviço está inativo. Por favor, aguarde e tente novamente.');
      }
      
      if (error.code === 'ERR_NETWORK') {
        return new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.');
      }
      
      // Erros HTTP genéricos
      if (error.response?.status === 401) {
        return new Error('Email ou senha incorretos. Por favor, verifique suas credenciais.');
      }
      
      if (error.response?.status === 403) {
        return new Error('Acesso negado. Você não tem permissão para acessar este recurso.');
      }
      
      if (error.response?.status === 404) {
        return new Error('Serviço não encontrado. O servidor pode estar offline.');
      }
      
      if (error.response?.status === 500) {
        return new Error('Erro interno do servidor. O backend pode estar reiniciando. Aguarde 30 segundos e tente novamente.');
      }
      
      if (error.response?.status === 502 || error.response?.status === 503) {
        return new Error('Servidor temporariamente indisponível. O serviço está sendo iniciado. Por favor, aguarde e tente novamente.');
      }
      
      if (error.response?.status && error.response.status >= 500) {
        return new Error('Erro no servidor. Por favor, tente novamente em alguns instantes.');
      }
    }
    
    return new Error('Ocorreu um erro inesperado. Por favor, verifique sua conexão e tente novamente.');
  }
}
