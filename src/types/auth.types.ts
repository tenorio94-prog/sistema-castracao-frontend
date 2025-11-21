export enum Role {
  administrator = 'administrator',
  semas = 'semas',
  veterinarian = 'veterinarian',
  receptionist = 'receptionist',
  petOwner = 'petOwner',
  student = 'student',
}

export interface CreateUserDto {
  completeName: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  role: Role | string;
  // Campos opcionais
  address?: string; 
  nis?: string;
  documentUrl?: string;
  
  // Campos de veterinário
  crmv?: string;
  specialty?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  completeName: string;
  role: Role;
}