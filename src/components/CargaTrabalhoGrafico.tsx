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

// 1. Dados mocados baseados no nosso protótipo 
const data = [
  { name: 'Dra. Cecília', Consultas: 45, Cirurgias: 25 },
  { name: 'Dr. Antônio', Consultas: 42, Cirurgias: 24 },
  { name: 'Dr. Carlos',  Consultas: 44, Cirurgias: 25 },
  { name: 'Dr. João',    Consultas: 46, Cirurgias: 26 },
];

export default function CargaTrabalhoChart() {
  return (
    // Container com o título e subtítulo do Grafico
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      <h3 className="text-lg font-semibold text-gray-800">
        Distribuição de Carga de Trabalho
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Consultas e cirurgias por médico este mês
      </p>

      {/* O contâiner do gráfico precisa de uma altura definida */}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30, // Espaço para a legenda
              left: 0,
              bottom: 5,
            }}
          >
            {/* Grid e Eixos (para parecer limpo como na imagem) */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              fontSize={12} 
              tickLine={false} // Remove os "tracinhos" do eixo X
              axisLine={true}  // Mantém a linha do eixo X
            />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={12} 
              axisLine={false}  // Remove a linha do eixo Y
              tickLine={false}  // Remove os "tracinhos" do eixo Y
            />
            
            {/* Tooltip que aparece ao passar o mouse */}
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
              }}
            />

            {/* Legenda (configurada para ficar à direita, como na imagem) */}
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{ paddingLeft: '20px' }} 
            />
            
            {/* 4. As Barras de dados com as cores da sua imagem */}
            <Bar 
              dataKey="Consultas" 
              fill="#9DBFCE" // Cor azul-acinzentada da imagem
              radius={[4, 4, 0, 0]} // Arredonda os cantos superiores
            />
            <Bar 
              dataKey="Cirurgias" 
              fill="#4A7C59" // Cor verde-escura da imagem
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}