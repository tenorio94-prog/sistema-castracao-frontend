/**
 * Tipos de autenticação baseados no backend Prisma
 */

/**
 * Enum de Roles - deve corresponder exatamente ao enum do Prisma
 */
export enum Role {
  administrator = 'administrator', // Coordination/Admin (UFRPE)
  semas = 'semas',                 // SEMAS Team (registers responsible persons)
  veterinarian = 'veterinarian',   // Medical Team (performs procedures)
  receptionist = 'receptionist',   // HVU Reception (schedules follow-ups, etc.)
  petOwner = 'petOwner',           // Animal Owner (online scheduling)
  student = 'student'
}

/**
 * Interface para os dados de login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Interface para a resposta de login do backend
 * Retorna apenas accessToken e refreshToken
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Interface para dados do usuário decodificados do token JWT
 */
export interface AuthUser {
  sub: string;      // user ID
  email: string;
  role: Role;
  iat?: number;     // issued at
  exp?: number;     // expiration
}

/**
 * Interface para registro de usuário
 */
export interface CreateUserDto {
  email: string;
  password: string;
  cpf: string;
  phone: string;
  completeName: string;
  role: Role;
  crmv?: string;      // Required for veterinarian
  address?: string;   // Required for petOwner (fullAddress no backend)
}

/**
 * Interface para resposta de registro
 */
export interface RegisterResponse {
  id: string;
  email: string;
  cpf: string;
  phone: string;
  completeName: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  related?: any; // Veterinarian ou PetOwner relacionado
}

/**
 * Interface para erros de API
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
