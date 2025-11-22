// @/components/CRUD/CrudDisplayAdm.tsx
import React, { useState } from 'react';
import { Search, Eye, Edit2, Trash2, LayoutList, LayoutGrid } from 'lucide-react';

export type ColumnDefinition<T> = {
  header: string; 
  cell: (item: T) => React.ReactNode; 
  className?: string;
};

interface CrudDisplayProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  searchPlaceholder: string;
  emptyMessage?: string;
  isLoading?: boolean;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  // --- NOVAS PROPS ---
  extraFilters?: React.ReactNode; // Botões de filtro injetados pelo pai
  renderGrid?: (items: T[]) => React.ReactNode; // Função para desenhar o Grid
}

export default function CrudDisplayAdm<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder,
  emptyMessage = 'Nenhum registro encontrado.',
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  extraFilters,
  renderGrid,
}: CrudDisplayProps<T>) {

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  const hasActions = onView || onEdit || onDelete;

  // Lógica de Busca por Texto (No Front-end)
  // Filtra os dados que JÁ vieram filtrados por categoria do pai
  const filteredData = data.filter(item => 
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Barra de Ferramentas */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
        
        {/* Busca Texto */}
        <div className="relative w-full lg:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent shadow-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Área Direita: Filtros Extras + Toggle View */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          
          {/* Injeção dos Filtros (Cão, Gato...) */}
          {extraFilters && (
            <div className="flex items-center gap-2">
              {extraFilters}
            </div>
          )}

          {/* Divisória Visual */}
          {extraFilters && renderGrid && (
             <div className="h-8 w-px bg-gray-200 hidden sm:block mx-1"></div>
          )}

          {/* Botões de Alternar Visualização (Só aparecem se renderGrid existir) */}
          {renderGrid && (
            <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                title="Lista"
              >
                <LayoutList size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                title="Grade"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Área de Conteúdo */}
      <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${viewMode === 'grid' ? 'bg-transparent border-none shadow-none overflow-visible' : ''}`}>
        
        {isLoading ? (
           <div className="p-12 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-100">
             <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
             <p className="text-gray-500 text-sm font-medium">Carregando...</p>
           </div>
        ) : filteredData.length === 0 ? (
           <div className="p-16 text-center bg-white rounded-2xl border border-gray-100">
             <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 mx-auto">
               <Search className="text-gray-400" size={20}/>
             </div>
             <p className="text-gray-900 font-medium">{emptyMessage}</p>
             <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros.</p>
           </div>
        ) : (
          <>
            {/* MODO LISTA */}
            {viewMode === 'list' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100"> 
                    <tr>
                      {columns.map((col) => (
                        <th key={col.header} className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                          {col.header}
                        </th>
                      ))}
                      {hasActions && <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100"> 
                    {filteredData.map((item) => (
                      <tr key={item.id} className="group hover:bg-gray-50/80 transition-colors">
                        {columns.map((col) => (
                          <td key={col.header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {col.cell(item)}
                          </td>
                        ))}

                        {hasActions && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              {onView && (
                                <button onClick={() => onView(item)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver">
                                  <Eye size={18} />
                                </button>
                              )}
                              {onEdit && (
                                <button onClick={() => onEdit(item)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                                  <Edit2 size={18} />
                                </button>
                              )}
                              {onDelete && (
                                <button onClick={() => onDelete(item)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* MODO GRADE (Injeta o Grid Renderizado) */}
          {viewMode === 'grid' && renderGrid && (
            <div>
              {renderGrid(filteredData)}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}