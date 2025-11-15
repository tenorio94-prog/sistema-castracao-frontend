import { User, Phone, Mail, MapPin, Dog } from 'lucide-react';

/**
 * Componente reutilizável para exibir um único responsável na lista.
 */
type Responsavel = {
  id: string | number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  pets: string[];
};

type ResponsavelCardProps = {
  responsavel: Responsavel;
};

export default function ResponsavelCard({ responsavel }: ResponsavelCardProps) {
  // Verificação de segurança
  if (!responsavel) {
    return null;
  }

  const { id, nome, cpf, telefone, email, endereco, pets } = responsavel;

  return (
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white flex flex-wrap items-center justify-between gap-6">
      
      {/* Informações Principais */}
      <div className="flex-1 min-w-[300px]">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{nome}</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <DetailItem icon={<User size={14} />} label="CPF" value={cpf} />
          <DetailItem icon={<Phone size={14} />} label="Telefone" value={telefone} />
          <DetailItem icon={<Mail size={14} />} label="Email" value={email} />
          <DetailItem icon={<MapPin size={14} />} label="Endereço" value={endereco} />
          <DetailItem icon={<Dog size={14} />} label="Animais" value={pets.join(', ')} />
        </div>
      </div>

      {/* Botão de Ação */}
      <div className="shrink-0">
        <a 
          href={`/atendente/responsaveis/${id}`} // TODO: Definir rota correta
          className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Ver Detalhes
        </a>
      </div>
    </div>
  );
}

/**
 * Sub-componente interno para renderizar os itens de detalhe
 */
type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string | number;
};

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <span className="font-medium">{label}:</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}
