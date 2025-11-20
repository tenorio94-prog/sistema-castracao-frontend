import api from '@/lib/axios';

// --- ENUMS ---
export enum Gender {
  male = 'male',
  female = 'female',
}

export enum Species {
  dog = 'dog',
  cat = 'cat',
}

// --- MAPEAMENTOS PARA UI ---
export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.male]: 'Macho',
  [Gender.female]: 'Fêmea',
};

export const SPECIES_LABELS: Record<Species, string> = {
  [Species.dog]: 'Cachorro',
  [Species.cat]: 'Gato',
};

// --- INTERFACES ---
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
    documentUrl: string | null;
    createdAt: string;
    updatedAt: string;
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

// --- SERVICE ---
export const AnimalService = {
  /**
   * Buscar todos os animais
   * GET /animals
   */
  async getAll(): Promise<Animal[]> {
    try {
      const response = await api.get<Animal[]>('/animals');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching animals:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar animais');
    }
  },

  /**
   * Buscar animal por ID
   * GET /animals/:id
   */
  async getById(id: number): Promise<Animal> {
    try {
      const response = await api.get<Animal>(`/animals/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar animal');
    }
  },

  /**
   * Criar novo animal
   * POST /animals
   * Nota: Requer petOwnerId existente
   */
  async create(data: CreateAnimalData): Promise<Animal> {
    try {
      const response = await api.post<Animal>('/animals', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar animal');
    }
  },

  /**
   * Atualizar animal existente
   * PATCH /animals/:id
   * @param id - ID do animal (não do petOwner)
   * @param data - Dados parciais para atualização
   */
  async update(id: number, data: UpdateAnimalData): Promise<Animal> {
    try {
      const response = await api.patch<Animal>(`/animals/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar animal');
    }
  },

  /**
   * Deletar animal
   * DELETE /animals/:id
   * @param id - ID do animal (não do petOwner)
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/animals/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting animal:', error);
      throw new Error(error.response?.data?.message || 'Erro ao deletar animal');
    }
  },

  /**
   * Filtrar animais por petOwnerId no lado do cliente
   */
  filterByPetOwner(animals: Animal[], petOwnerId: number): Animal[] {
    return animals.filter(animal => animal.petOwnerId === petOwnerId);
  },

  /**
   * Filtrar animais por espécie no lado do cliente
   */
  filterBySpecies(animals: Animal[], species: Species): Animal[] {
    return animals.filter(animal => animal.species === species);
  },
};
