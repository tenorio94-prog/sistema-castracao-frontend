import AgendamentoCard from '@/components/public/AgendamentoCard';  
import CardBaseDash from '@/components/CardBaseDash';
import Link from 'next/link';
import { Calendar, Dog, CrossIcon } from 'lucide-react';

export default function MedicoPage() {

return (
  <>
    {/* Cabeçalho*/}
    <div className="ml-6">
      <h1 className="text-2xl font-bold text-green-700">Dashboard do(a) Médico(a)</h1>
      <p className="text-green-800">Bem vindo(a) ao sistema de gestão hospitalar</p>
    </div>

    {/* div dos indicadores do dia com uso de flexbox*/}
    <div className="gap-4 flex-wrap mt-6">
      <div>
        <h1 className="font-bold ml-6 text-green-800">Incicadores de Hoje</h1>
      </div>

{/* Cards de Resumo*/}
      <div className="flex flex-wrap">
        <CardBaseDash
          title="Consultas do Dia"
          value={12}
          subtitle="A serem realizadas hoje"
          icon= {<Calendar/>}
        />

        <CardBaseDash
          title="Castrações do Dia"
          value={12}
          subtitle="Cirurgias para hoje"
          icon= {<CrossIcon/>}
        />

        <CardBaseDash
          title="Pets Atendidos"
          value={12}
          subtitle="Consultas realizadas hoje"
          icon= {<Dog/>}
        />
        
      </div>
    </div>

    {/* Seção de Agendamentos do Dia */}
          <div className= "ml-6"> 
            <h1 className="mt-10 text-green-800 text-2xl">Atendimentos de Hoje</h1>
            <p className= "mb-5 mt-2 text-green-700">Sua agenda de consultas, cirurgias e retornos programados</p>
          </div>
    
            <div className="ml-6 flex flex-col gap-3">
              
              <AgendamentoCard
                horario="08:00"
                nomePet="Rex"
                tipoServico="Consulta"
                descricao="Consulta de rotina"
              />

              <AgendamentoCard
                horario="09:30"
                nomePet="Mimi"
                tipoServico="Castração"
                descricao="Cirurgia de castração"
              />
              
              <AgendamentoCard
                horario="11:00"
                nomePet="Bolt"
                tipoServico="Retorno"
                descricao="Retorno pós-operatório"
              />
            
            </div>
  </>
);
}