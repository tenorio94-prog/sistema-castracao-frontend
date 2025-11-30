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
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

// Dados padrão caso não sejam fornecidos
const defaultData = [
  { name: 'Dra. Cecília', Consultas: 45, Cirurgias: 25 },
  { name: 'Dr. Antônio', Consultas: 42, Cirurgias: 24 },
  { name: 'Dr. Carlos',  Consultas: 44, Cirurgias: 25 },
  { name: 'Dr. João',    Consultas: 46, Cirurgias: 26 },
];

type ChartDataItem = {
  name: string;
  Consultas: number;
  Cirurgias: number;
};

type CargaTrabalhoChartProps = {
  data?: ChartDataItem[];
};

export default function CargaTrabalhoChart({ data = defaultData }: CargaTrabalhoChartProps) {
  // Verificar se há dados válidos para exibir
  const hasValidData = data && data.length > 0 && data.some(item => item.Consultas > 0 || item.Cirurgias > 0);

  // Estado vazio quando não há dados
  if (!hasValidData) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 mb-4">
            <BarChart3 className="w-8 h-8 text-indigo-400" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Nenhum Dado Disponível
          </h3>
          
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Os dados de produtividade serão exibidos automaticamente após o cadastro de veterinários e o registro de atendimentos no sistema.
          </p>
          
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-900 mb-1">
                Como funciona?
              </p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Este gráfico compara consultas e cirurgias realizadas por cada veterinário. Cadastre profissionais e registre atendimentos para visualizar as estatísticas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gráfico normal quando há dados
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10} // Espaçamento texto x eixo
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
              borderRadius: '12px', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: '#374151'
            }}
          />

          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 500 }} 
          />
          
          {/* Barras com cores mais modernas (Indigo e Emerald) */}
          <Bar 
            dataKey="Consultas" 
            fill="#6366f1" // Indigo-500
            radius={[4, 4, 4, 4]} 
            barSize={32}
          />
          <Bar 
            dataKey="Cirurgias" 
            fill="#10b981" // Emerald-500
            radius={[4, 4, 4, 4]} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}