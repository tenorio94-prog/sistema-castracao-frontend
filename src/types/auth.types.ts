/**
 * Tipos de autenticação baseados no backend Prisma
 */

/**
 * Enum de Roles - deve corresponder exatamente ao enum do Prisma no backend
 */
export enum Role {
  administrator = 'administrator', // Coordination/Admin (UFRPE)
  semas = 'semas',                 // SEMAS Team (registers responsible persons)
  veterinarian = 'veterinarian',   // Medical Team (performs procedures)
  receptionist = 'receptionist',   // HVU Reception (schedules follow-ups, etc.)
  petOwner = 'petOwner',           // Animal Owner (online scheduling)
  student = 'student'              // Student
}

/**
 * Enum de Tipos de Responsável (Pet Owner)
 */
export enum PetOwnerType {
  individual = 'individual', // Pessoa Física
  ngo = 'ngo'               // ONG
}

/**
 * Enum de Especialidades Médicas Veterinárias
 * Valores padronizados para seleção de especialidade de veterinários
 */
export enum VeterinarySpecialty {
  GENERAL = 'Clínico Geral',
  ANESTHETIST = 'Anestesista',
  CLINICAL_PATHOLOGIST = 'Patologista Clínico',
  DIAGNOSTIC_IMAGING = 'Diagnóstico por Imagem',
  SURGEON = 'Cirurgião'
}

/**
 * Array com todas as especialidades disponíveis para uso em selects
 */
export const VETERINARY_SPECIALTIES = [
  { value: VeterinarySpecialty.GENERAL, label: 'Clínico Geral' },
  { value: VeterinarySpecialty.ANESTHETIST, label: 'Anestesista' },
  { value: VeterinarySpecialty.CLINICAL_PATHOLOGIST, label: 'Patologista Clínico' },
  { value: VeterinarySpecialty.DIAGNOSTIC_IMAGING, label: 'Diagnóstico por Imagem' },
  { value: VeterinarySpecialty.SURGEON, label: 'Cirurgião' }
] as const;

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
  cpf?: string;
  cnpj?: string;
  phone: string;
  completeName: string;
  role: Role;
  
  // Campos específicos para veterinarian
  crmv?: string;      // Required for veterinarian
  specialty?: string; // Optional specialty for veterinarian
  
  // Campos específicos para student
  enrollment?: string; // Required for student (matrícula)
  
  // Campos específicos para petOwner
  address?: string;         // Required for petOwner (backend converte para fullAddress)
  nis?: string;             // Optional for petOwner
  documentUrl?: string;     // Optional for petOwner
  petOwnerType?: PetOwnerType; // Tipo de responsável (individual ou ONG)
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