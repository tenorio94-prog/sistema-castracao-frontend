// app/components/CrudDisplay.tsx
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import React from 'react';

// 1. Definição do Tipo para as Colunas
export type ColumnDefinition<T> = {
  header: string; 
  cell: (item: T) => React.ReactNode; 
};

// 2. Props do Componente
interface CrudDisplayProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  searchPlaceholder: string;
  emptyMessage?: string; // Mensagem customizada quando não há dados
  isLoading?: boolean; // Estado de carregamento
  
  // Funções de Ação (OPCIONAIS)
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

// 3. O Componente Genérico
export default function CrudDisplay<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder,
  emptyMessage = 'Nenhum registro encontrado.',
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: CrudDisplayProps<T>) {

  const hasActions = onView || onEdit || onDelete;

  return (
    // Container principal (AGORA SEM BORDA VERDE E COM SOMBRA)
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden w-full"> 
      
      {/* Barra de Busca (com padding e borda inferior) */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
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
      </div>

      {/* Tabela (com overflow) */}
      <div className="overflow-x-auto">
        <table className="w-full">
          
          {/* Cabeçalho (MANTIDO bg-gray-50 para a coloração mais cinza) */}
          <thead className="bg-gray-50"> 
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.header} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              {hasActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>

          {/* Corpo da Tabela (MANTIDO divide-y divide-gray-200 para separação clara) */}
          <tbody className="divide-y divide-gray-200"> 
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <p className="text-gray-500 text-sm">Carregando...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                    <p className="text-gray-400 text-sm">Clique em "Cadastrar" para adicionar um novo registro.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  
                  {/* Células de Dados Dinâmicas */}
                  {columns.map((col) => (
                    <td key={col.header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {col.cell(item)}
                    </td>
                  ))}

                  {/* Células de Ações */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-3">
                      {onView && (
                        <button onClick={() => onView(item)} title="Ver" className="text-gray-500 hover:text-blue-600">
                          <Eye size={20} />
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(item)} title="Editar" className="text-gray-500 hover:text-green-600">
                          <Edit size={20} />
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item)} title="Deletar" className="text-gray-500 hover:text-red-600">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}