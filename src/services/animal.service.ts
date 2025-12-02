import api from '@/lib/axios';

export enum Gender {
  male = 'male',
  female = 'female',
}

export enum Species {
  canine = 'canine',
  feline = 'feline',
}

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.male]: 'Macho',
  [Gender.female]: 'Fêmea',
};

export const SPECIES_LABELS: Record<Species, string> = {
  [Species.canine]: 'Cachorro',
  [Species.feline]: 'Gato',
};

export interface Animal {
  id: number;
  name: string | null;
  estimatedAge: string;
  species: Species;
  gender: Gender;
  sizeWeight: string;
  breed: string | null;
  microchipNumber: string | null;
  petOwnerId: number;
  createdAt: string;
  updatedAt: string;
  petOwner?: {
    id: number;
    userId: number;
    nis: string | null;
    fullAddress: string;
    user?: {
      id: number;
      completeName: string;
      email: string;
      cpf: string | null;
      phone: string | null;
    };
  };
}

export interface CreateAnimalData {
  name?: string;
  estimatedAge: string;
  species: Species;
  gender: Gender;
  sizeWeight: string;
  breed?: string;
  microchipNumber?: string;
  petOwnerId: number;
}

export interface UpdateAnimalData {
  name?: string;
  estimatedAge?: string;
  species?: Species;
  gender?: Gender;
  sizeWeight?: string;
  breed?: string;
  microchipNumber?: string;
}

export const AnimalService = {
  async getAll(): Promise<Animal[]> {
    try {
      const response = await api.get<Animal[]>('/animals');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching animals:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar animais');
    }
  },

  async getById(id: number): Promise<Animal> {
    try {
      const response = await api.get<Animal>(`/animals/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching animal:', error);
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      // Tratamento específico para erro 403
      if (statusCode === 403) {
        throw new Error('Acesso negado: permissão insuficiente');
      }
      
      throw new Error(message || 'Erro ao buscar animal');
    }
  },

  async create(data: CreateAnimalData): Promise<Animal> {
    try {
      const response = await api.post<Animal>('/animals', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar animal');
    }
  },

  async update(id: number, data: UpdateAnimalData): Promise<Animal> {
    try {
      const response = await api.patch<Animal>(`/animals/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar animal');
    }
  },

  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/animals/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao deletar animal');
    }
  },
};