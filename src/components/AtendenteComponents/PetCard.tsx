import { DogIcon } from 'lucide-react';

/**
 * Mapeamento de espécies para estilos de badge.
 * TODO: Integração Backend: Alinhar nomes/estilos com dados do backend.
 */
const speciesStyles: { [key: string]: string } = {
  Cachorro: 'bg-blue-100 text-blue-800',
  Gato: 'bg-purple-100 text-purple-800',
  Outro: 'bg-gray-100 text-gray-800',
};

/**
 * Componente reutilizável para exibir um único pet na lista/grid.
 */
type Pet = {
  id: string | number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: string | number;
  age: string | number;
  ownerName: string;
};

export default function PetCard({ pet }: { pet: Pet }) {
  // Verificação de segurança para evitar erro de desestruturação
  if (!pet) {
    return null;
  }

  const { id, name, species, breed, gender, weight, age, ownerName } = pet;

  const badgeStyle = speciesStyles[species] || speciesStyles['Outro'];

  const handleEdit = () => {
    // TODO: Integração Backend: Lógica para editar
    // Provavelmente navegar para /atendente/animais/editar/[id]
    console.log(`Editar pet: ${id}`);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white flex flex-col h-full">
      
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <DogIcon size={22} className="text-gray-700" />
          <span className="text-xl font-bold text-gray-800">{name}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle}`}>
          {species}
        </span>
      </div>

      {/* Detalhes do Pet */}
      <div className="grow mb-4 space-y-1.5 text-sm text-gray-600">
        <DetailItem label="Raça" value={breed} />
        <DetailItem label="Sexo" value={gender} />
        <DetailItem label="Peso" value={weight} />
        <DetailItem label="Idade" value={age} />
        <DetailItem label="Responsável" value={ownerName} isOwner={true} />
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-3 mt-auto">
        {/* Usando <a> no lugar de <Link> para evitar erro de build no preview */}
        <a 
          href={`/atendente/animais/prontuario/${id}`} // TODO: Definir rota correta
          className="flex-1 text-center px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Ver Prontuário
        </a>
        <button 
          onClick={handleEdit}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

/**
 * Sub-componente interno para renderizar os itens de detalhe
 */
type DetailItemProps = {
  label: string;
  value: string | number;
  isOwner?: boolean;
};

function DetailItem({ label, value, isOwner = false }: DetailItemProps) {
  const valueClass = isOwner ? "font-medium text-gray-700" : "text-gray-800";
  return (
    <div>
      <span className="font-medium">{label}: </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}