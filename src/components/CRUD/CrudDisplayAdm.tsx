// app/components/CrudDisplay.tsx
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import React from 'react';

// 1. Definição do Tipo para as Colunas
// <T> é um genérico, significa que vai aceitar qualquer tipo de objeto (Medico, Animal, etc.)
export type ColumnDefinition<T> = {
  header: string; // O texto do cabeçalho (ex: "Nome")
  // A função que diz como renderizar a célula para este item
  cell: (item: T) => React.ReactNode; 
};

// 2. Props do Componente
interface CrudDisplayProps<T> {
  // Dados da API (ex: lista de médicos, lista de animais)
  data: T[];
  
  // A configuração das colunas que você quer exibir
  columns: ColumnDefinition<T>[];
  
  // Placeholder da barra de busca
  searchPlaceholder: string;

  // Funções de Ação (OPCIONAIS)
  // Se você não passar a função, o ícone não aparece.
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

// 3. O Componente Genérico
// Usamos <T extends { id: any }> para garantir que cada item tenha um 'id' para a key
export default function CrudDisplay<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder,
  onView,
  onEdit,
  onDelete,
}: CrudDisplayProps<T>) {

  // Checa se alguma ação foi fornecida para saber se renderiza a coluna
  const hasActions = onView || onEdit || onDelete;

  return (
    // Container principal com a borda verde
    <div className="border border-green-600 rounded-lg p-4 shadow-sm w-full">
      
      {/* Barra de Busca */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-500"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-left">
          
          {/* Cabeçalho */}
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th key={col.header} className="py-3 px-4 text-sm font-semibold text-gray-600">
                  {col.header}
                </th>
              ))}
              {hasActions && (
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Ações
                </th>
              )}
            </tr>
          </thead>

          {/* Corpo da Tabela */}
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                
                {/* Células de Dados Dinâmicas */}
                {columns.map((col) => (
                  <td key={col.header} className="py-3 px-4 text-sm text-gray-700">
                    {col.cell(item)} {/* AQUI A MÁGICA ACONTECE */}
                  </td>
                ))}

                {/* Células de Ações */}
                {hasActions && (
                  <td className="py-3 px-4 text-sm text-gray-700">
                    <div className="flex items-center gap-3">
                      {onView && (
                        <button onClick={() => onView(item)} className="text-gray-500 hover:text-blue-600">
                          <Eye size={18} />
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="text-gray-500 hover:text-green-600">
                          <Edit size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} className="text-gray-500 hover:text-red-600">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}