import api from '@/lib/axios';

/**
 * Exemplo de Serviço para Animais
 * Demonstra como criar serviços para outras entidades do sistema
 */

export interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
  sexo?: string;
  responsavelId: string;
}

export interface CreateAnimalData {
  nome: string;
  especie: string;
  raca?: string;
  idade?: number;
  peso?: number;
  sexo?: string;
  responsavelId: string;
}

export class AnimalService {
  /**
   * Buscar todos os animais
   */
  static async getAll(): Promise<Animal[]> {
    const response = await api.get<Animal[]>('/animals');
    return response.data;
  }

  /**
   * Buscar animal por ID
   */
  static async getById(id: string): Promise<Animal> {
    const response = await api.get<Animal>(`/animals/${id}`);
    return response.data;
  }

  /**
   * Criar novo animal
   */
  static async create(data: CreateAnimalData): Promise<Animal> {
    const response = await api.post<Animal>('/animals', data);
    return response.data;
  }

  /**
   * Atualizar animal
   */
  static async update(id: string, data: Partial<CreateAnimalData>): Promise<Animal> {
    const response = await api.put<Animal>(`/animals/${id}`, data);
    return response.data;
  }

  /**
   * Deletar animal
   */
  static async delete(id: string): Promise<void> {
    await api.delete(`/animals/${id}`);
  }

  /**
   * Buscar animais por responsável
   */
  static async getByResponsavel(responsavelId: string): Promise<Animal[]> {
    const response = await api.get<Animal[]>(`/animals/responsavel/${responsavelId}`);
    return response.data;
  }

  /**
   * Buscar com filtros
   */
  static async search(params: {
    nome?: string;
    especie?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Animal[]; total: number; page: number }> {
    const response = await api.get('/animals/search', { params });
    return response.data;
  }
}

/**
 * Exemplo de uso em um componente React:
 * 
 * import { AnimalService } from '@/services/animal.service';
 * 
 * function AnimaisPage() {
 *   const [animais, setAnimais] = useState<Animal[]>([]);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     async function loadAnimais() {
 *       try {
 *         const data = await AnimalService.getAll();
 *         setAnimais(data);
 *       } catch (error) {
 *         console.error('Erro ao carregar animais:', error);
 *       } finally {
 *         setLoading(false);
 *       }
 *     }
 *     loadAnimais();
 *   }, []);
 * 
 *   const handleCreate = async (formData) => {
 *     try {
 *       const newAnimal = await AnimalService.create(formData);
 *       setAnimais([...animais, newAnimal]);
 *     } catch (error) {
 *       console.error('Erro ao criar animal:', error);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {loading ? 'Carregando...' : animais.map(animal => (
 *         <div key={animal.id}>{animal.nome}</div>
 *       ))}
 *     </div>
 *   );
 * }
 */
