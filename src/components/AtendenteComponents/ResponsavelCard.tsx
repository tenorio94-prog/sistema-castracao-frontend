// @/components/AtendenteComponents/ResponsavelCard.tsx
import React from 'react';
import { User, Phone, Mail, MapPin, Dog } from 'lucide-react';

// --- ATUALIZAÇÃO ---
// 1. Esta é agora a "Fonte da Verdade" para o tipo.
// Nós o definimos e exportamos daqui.
export type Responsavel = {
  id: string;
  tipo: 'PF' | 'ONG';
  nome: string;
  cpf?: string;
  nis?: string;
  cnpj?: string;
  telefone?: string; 
  animais: string[]; 
  senha: string;     
  email?: string;     
  endereco?: string;  
};
// --------------------

// 2. Props do Componente (usa o tipo local)
type ResponsavelCardProps = {
  responsavel: Responsavel;
  onVerDetalhes: (responsavel: Responsavel) => void;
};

export default function ResponsavelCard({ responsavel, onVerDetalhes }: ResponsavelCardProps) {
  if (!responsavel) {
    return null;
  }

  // 3. 'animais' extraído (nome correto)
  const { id, nome, cpf, telefone, email, endereco, animais } = responsavel;

  return (
    <div className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white flex flex-wrap items-center justify-between gap-6">
      
      <div className="flex-1 min-w-[300px]">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{nome}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <DetailItem icon={<User size={14} />} label="CPF" value={cpf || 'N/A'} />
          <DetailItem icon={<Phone size={14} />} label="Telefone" value={telefone || 'N/A'} />
          <DetailItem icon={<Mail size={14} />} label="Email" value={email || 'N/A'} />
          <DetailItem icon={<MapPin size={14} />} label="Endereço" value={endereco || 'N/A'} />
          <DetailItem icon={<Dog size={14} />} label="Animais" value={animais.join(', ')} />
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <button 
          type="button"
          onClick={() => onVerDetalhes(responsavel)} 
          className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  );
}

// Sub-componente
function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <span className="font-medium">{label}:</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}