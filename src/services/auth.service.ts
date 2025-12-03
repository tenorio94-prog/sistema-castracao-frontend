import api from '@/lib/axios';
import { AxiosError } from 'axios';
import { 
  LoginDto, 
  LoginResponse, 
  CreateUserDto, 
  RegisterResponse, 
  ApiError,
  AuthUser,
  Role 
} from '@/types/auth.types';

// Re-exportar Role para facilitar importação
export { Role } from '@/types/auth.types';

/**
 * Decodifica o JWT token para extrair as informações do usuário
 */
function decodeToken(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as AuthUser;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

/**
 * Serviço de Autenticação
 * Centraliza todas as chamadas relacionadas à autenticação
 */
export class AuthService {
  /**
   * Realiza o login do usuário
   * @param credentials - Email e senha do usuário
   * @returns Tokens de acesso e refresh
   */
  static async login(credentials: LoginDto): Promise<LoginResponse> {
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
   * @returns Dados do usuário criado
   */
  static async register(data: CreateUserDto): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Registra um novo responsável (PetOwner) por recepcionista/SEMAS
   * Rota específica que permite receptionist e semas criarem responsáveis
   * @param data - Dados do responsável a ser registrado
   * @returns Dados do usuário criado
   */
  static async registerPetOwnerByReceptionist(data: CreateUserDto): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register-petowner-by-receptionist', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Solicita recuperação de senha
   * Envia um email com link para redefinir senha
   * @param email - Email do usuário
   * @returns Mensagem de confirmação
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      console.log('📧 AuthService: Enviando requisição de forgot-password para:', email);
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      console.log('✅ AuthService: Resposta recebida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Erro capturado em forgotPassword:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Redefine a senha do usuário usando o token recebido por email
   * @param token - Token de recuperação de senha
   * @param newPassword - Nova senha
   * @returns Mensagem de confirmação
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Realiza o logout do usuário
   * Como o backend não possui rota de logout, apenas limpa os tokens localmente
   */
  static async logout(): Promise<void> {
    // Limpar tokens do localStorage (logout no lado do cliente)
    this.clearTokens();
    
    // Nota: O backend não possui endpoint /auth/logout
    // O logout é feito apenas removendo os tokens do cliente
    // Se necessário invalidar o token no servidor, adicione o endpoint no backend
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
   * Salva os tokens no localStorage e retorna as informações do usuário decodificadas
   */
  static saveTokens(accessToken: string, refreshToken: string): AuthUser | null {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Decodifica o token e salva as informações do usuário
      const user = decodeToken(accessToken);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      return user;
    }
    return null;
  }

  /**
   * Remove os tokens do localStorage
   */
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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
   * Obtém as informações do usuário logado
   */
  static getCurrentUser(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr) as AuthUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Mapeia o role do usuário para a rota correspondente
   */
  static getRoleRoute(role: Role): string {
    const roleRoutes: Record<Role, string> = {
      [Role.administrator]: '/adm',
      [Role.veterinarian]: '/medico',
      [Role.receptionist]: '/atendente',
      [Role.semas]: '/atendente', // SEMAS usa mesma interface do atendente
      [Role.student]: '/medico',   // Estudante usa mesma interface do médico
      [Role.petOwner]: '/responsavel',
    };
    
    return roleRoutes[role] || '/adm';
  }

  /**
   * Trata erros de requisição da API
   */
  private static handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      
      // Log detalhado em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.error('🔴 Erro de autenticação:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: apiError?.message || error.message,
          data: error.response?.data,
          url: error.config?.url,
          fullError: apiError,
        });
      }
      
      // Mensagem de erro da API - tentar extrair de diferentes estruturas
      if (apiError?.message) {
        throw new Error(apiError.message);
      }
      
      // Tentar pegar erro de outras estruturas possíveis
      if (typeof error.response?.data === 'string') {
        throw new Error(error.response.data);
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      // Erro de rede ou timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('O servidor está demorando para responder. Isso é normal quando o serviço está inativo. Por favor, aguarde e tente novamente.');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.');
      }
      
      // Erros HTTP genéricos
      if (error.response?.status === 400) {
        // Para erro 400, tenta extrair a mensagem do backend
        const message = apiError?.message || error.response?.data?.error || 'Requisição inválida. Verifique os dados informados.';
        throw new Error(message);
      }
      
      if (error.response?.status === 401) {
        throw new Error('Email ou senha incorretos. Por favor, verifique suas credenciais.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Acesso negado. Você não tem permissão para acessar este recurso.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Serviço não encontrado. O servidor pode estar offline.');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Erro interno do servidor. O backend pode estar reiniciando. Aguarde 30 segundos e tente novamente.');
      }
      
      if (error.response?.status === 502 || error.response?.status === 503) {
        throw new Error('Servidor temporariamente indisponível. O serviço está sendo iniciado. Por favor, aguarde e tente novamente.');
      }
      
      if (error.response?.status && error.response.status >= 500) {
        throw new Error('Erro no servidor. Por favor, tente novamente em alguns instantes.');
      }
    }
    
    throw new Error('Ocorreu um erro inesperado. Por favor, verifique sua conexão e tente novamente.');
  }
}
