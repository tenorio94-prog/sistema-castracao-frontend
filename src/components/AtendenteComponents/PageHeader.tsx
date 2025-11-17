import { Plus } from 'lucide-react';

// 1. Definição dos Tipos para as Props
type PageHeaderProps = {
  title: string;
  description: string;
  buttonLabel?: string;       
  buttonHref?: string;        
  onButtonClick?: () => void; 
  buttonVariant?: 'default' | 'secondary'; 
};

/**
 * Componente reutilizável para o cabeçalho de páginas administrativas.
 */
export default function PageHeader({ 
  title, 
  description, 
  buttonLabel, 
  buttonHref,    
  onButtonClick, 
  buttonVariant = 'default' 
}: PageHeaderProps) {
  
  const buttonStyles = {
    default: "bg-green-600 text-white hover:bg-green-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };
  
  const selectedStyle = buttonStyles[buttonVariant] || buttonStyles.default;
  const buttonClasses = `flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-colors duration-200 ${selectedStyle}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      
      {/* Caso 1: É um botão de AÇÃO (tem onButtonClick) */}
      {buttonLabel && onButtonClick && (
        <button 
          type="button"
          onClick={onButtonClick}
          className={buttonClasses}
        >
          <Plus size={18} />
          <span>{buttonLabel}</span>
        </button>
      )}

      {/* Caso 2: É um LINK (tem buttonHref, mas NÃO onButtonClick) */}
      {buttonLabel && buttonHref && !onButtonClick && (
        <a 
          href={buttonHref}
          className={buttonClasses}
        >
          <Plus size={18} />
          <span>{buttonLabel}</span>
        </a>
      )}
    </div>
  );
}