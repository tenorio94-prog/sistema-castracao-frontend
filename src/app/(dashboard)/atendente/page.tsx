import AgendamentoCard from "@/components/public/AgendamentoCard";  
import CardBaseDash from "@/components/Dashboard/CardBaseDash"; 
import { Calendar, CheckCircle, Dog } from "lucide-react";


export default function AtendentePage() {
  return (
    <>
    
    {/*Cabeçalho*/}
      <div className= "ml-6">
        <h1 className="text-2xl font-bold text-green-700">Dashboard do(a) Atendente</h1>
        <p className="text-green-800">Bem vindo(a) ao sistema de gestão hospitalar</p>
      </div>


    {/* div dos indicadores do dia com uso de flexbox*/}
      <div className="gap-4 flex-wrap mt-6">

      <div>
       <h1 className= "font-bold ml-6 text-green-800">Incicadores de Hoje</h1> 
      </div>

{/* Cards de Resumo*/}
  <div className= " flex flex-wrap">
    
    <CardBaseDash
      title="Atendimentos Pendentes do Dia"
      value={12}
      subtitle="Agendamentos para hoje"
      icon={<Calendar />} // Ícone de Calendário
    />

    <CardBaseDash
      title="Agendamentos Concluídos"
      value={12}
      subtitle="Concluídos hoje"
      icon={<CheckCircle />} // Ícone de Check (usei CheckCircle para "concluído")
    />

    <CardBaseDash
      title="Pets Atendidos"
      value={12}
      subtitle="Total de atendimentos de hoje"
      icon={<Dog />} // Ícone de Cachorro
    />
    
  
  </div>
      </div>

{/* Seção de Agendamentos do Dia */}
      <div className= "ml-6"> 
        <h1 className="mt-10 text-green-800 text-2xl">Atendimentos de Hoje</h1>
        <p className= "mb-5 mt-2 text-green-700">Sua agenda de consultas, cirurgias e retornos programados</p>
      </div>

        <div className=" ml-6 flex flex-col gap-3">
          
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
            descricao="Castração programada"
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