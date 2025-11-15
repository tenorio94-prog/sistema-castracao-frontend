import { Plus } from 'lucide-react';

/**
 * Componente reutilizável para o cabeçalho de páginas administrativas.
 * Exibe título, descrição e um botão de ação opcional (ex: "Novo").
 * * ATUALIZAÇÃO: Substituído <Link> do Next.js por <a> padrão para resolver erro de compilação.
 */
interface PageHeaderProps {
  title: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export default function PageHeader({ title, description, buttonLabel, buttonHref }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      {/* Lado Esquerdo: Título e Descrição */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      {/* Lado Direito: Botão de Ação */}
      {buttonLabel && buttonHref && (
        <a 
          href={buttonHref}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-colors duration-200"
        >
          <Plus size={18} />
          {buttonLabel}
        </a>
      )}
    </div>
  );
}