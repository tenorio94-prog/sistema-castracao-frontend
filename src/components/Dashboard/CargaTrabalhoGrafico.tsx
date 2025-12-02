'use client'; 

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { BarChart3, AlertCircle } from 'lucide-react';

type ChartDataItem = {
  name: string;
  Consultas: number;
  Cirurgias: number;
};

type CargaTrabalhoChartProps = {
  data?: ChartDataItem[];
};

export default function CargaTrabalhoChart({ data = [] }: CargaTrabalhoChartProps) {
  // Garantir que data seja um array
  const safeData = Array.isArray(data) ? data : [];
  
  // Verificar se há dados válidos (array não vazio e com valores > 0)
  const hasValidData = safeData.length > 0 && safeData.some(item => 
    (item.Consultas || 0) > 0 || (item.Cirurgias || 0) > 0
  );

  // Estado vazio quando não há dados
  if (!hasValidData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-6">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <BarChart3 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sem dados de produtividade
        </h3>
        <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
          Ainda não há registros de consultas ou cirurgias para gerar o gráfico de produtividade da equipe.
        </p>
        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>Os dados aparecerão automaticamente conforme o uso.</span>
        </div>
      </div>
    );
  }

  // Gráfico normal quando há dados
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={safeData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12} 
            axisLine={false} 
            tickLine={false} 
          />
          
          <Tooltip
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />

          <Legend 
            verticalAlign="top" 
            align="right"
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          
          <Bar 
            dataKey="Consultas" 
            name="Consultas"
            fill="#6366f1" 
            radius={[4, 4, 0, 0]} 
            barSize={30}
          />
          <Bar 
            dataKey="Cirurgias" 
            name="Cirurgias"
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}