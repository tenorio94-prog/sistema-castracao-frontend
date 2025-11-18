import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardBaseDashProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon; // Tipagem correta para ícones do Lucide
  trend?: string;   // Novo: ex "+5% essa semana"
  color?: "blue" | "green" | "purple" | "indigo"; // Novo: Tema do card
}

export default function CardBaseDash({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = "blue" 
}: CardBaseDashProps) {

  // Mapa de estilos baseados na cor escolhida
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="flex-1 min-w-[240px] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
        </div>
        
        {/* Ícone com fundo colorido suave */}
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>

      {/* Rodapé do Card */}
      <div className="mt-4 flex items-center gap-2">
        {trend && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            {trend}
          </span>
        )}
        <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}