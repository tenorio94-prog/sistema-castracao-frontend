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

const data = [
  { name: 'Dra. Cecília', Consultas: 45, Cirurgias: 25 },
  { name: 'Dr. Antônio', Consultas: 42, Cirurgias: 24 },
  { name: 'Dr. Carlos',  Consultas: 44, Cirurgias: 25 },
  { name: 'Dr. João',    Consultas: 46, Cirurgias: 26 },
];

export default function CargaTrabalhoChart() {
  return (
    // Removemos o container com bg-white e shadow daqui.
    // O gráfico agora ocupa 100% do espaço que o pai der a ele.
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