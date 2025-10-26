import AgendamentoCard from '@/components/public/AgendamentoCard';  
import Link from 'next/link';
export default function MedicoPage() {

return (
  <>
    {/* Cabeçalho da Página Dashboard do Atentende*/}
    <div className="ml-6">
      <h1 className="text-2xl font-bold text-green-700">Dashboard do(a) Médico(a)</h1>
      <p className="text-green-800">Bem vindo(a) ao sistema de gestão hospitalar</p>
    </div>

    {/* div dos indicadores do dia com uso de flexbox*/}
    <div className="gap-4 flex-wrap mt-6">
      <div>
        <h1 className="font-bold ml-6 text-green-800">Incicadores de Hoje</h1>
      </div>

      <div className="flex flex-wrap">
        {/* indicador 1*/}
        <div className="w-80 h-30 border border-green-600 rounded-lg p-4 m-4 shadow-sm">
          <p className="text-green-800 text-bold">Consultas de Hoje</p>
        </div>
        {/* indicador 2*/}
        <div className="w-80 h-30 border border-green-600 rounded-lg p-4 m-4 shadow-sm">
          <p className="text-green-800 text-bold">Cirurgias de Hoje</p>
        </div>
        {/* indicador 3*/}
        <div className="w-80 h-30 border border-green-600 rounded-lg p-4 m-4 shadow-sm">
          <p className="text-green-800 text-bold">Pets Atendidos</p>
        </div>
      </div>
    </div>

    {/* Seção de Agendamentos do Dia */}
          <div className= "ml-6"> 
            <h1 className="mt-10 text-green-800 text-2xl">Atendimentos de Hoje</h1>
            <p className= "mb-5 mt-2 text-green-700">Sua agenda de consultas, cirurgias e retornos programados</p>
          </div>
    
            <div className="flex flex-col gap-3">
              <AgendamentoCard />
              <AgendamentoCard />
              <AgendamentoCard />
            </div>
  </>
);
}