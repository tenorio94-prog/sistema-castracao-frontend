import Home from "@/app/page";
import Link from 'next/link';
import CardBaseDash from "@/components/Dashboard/CardBaseDash";
import { Calendar, Dog, Users, ArrowUp, BuildingIcon, CrossIcon } from "lucide-react";
import CargaTrabalhoChart from "@/components/Dashboard/CargaTrabalhoGrafico";
import AgendaDoDia from "@/components/Dashboard/AgendaDoDia";

export default function AdminPage(){



return (
  <>
  {/*Cabeçalho*/}
    <div>
      <h1 className="text-2xl font-bold mb-4 text-green-700">Dashboard ADM</h1>
      <p className= "text-green-800">Bem-vindo à seção de administração do painel.</p>
    </div>

{/* Cards de Resumo (CardBaseDash) */}
    <div className= "flex flex-wrap gap-3 mt-1">

      <CardBaseDash
        title="Consultas Hoje"
        value={150}
        subtitle="Agendadas para hoje"
        icon={<Calendar/>}
      />

      <CardBaseDash
        title="Animais Castrados"
        value={75}
        subtitle="Total desde o início"
        icon={<CrossIcon/>}
      />

      <CardBaseDash
        title="Animais Cadastrados"
        value={20}
        subtitle="Total desde o início"
        icon={<Dog/>}
      />

      <CardBaseDash
        title="ONG's Cadastradas"
        value={20}
        subtitle="Organizações parceiras"
        icon= {<BuildingIcon/>}
      />

      <CardBaseDash
        title="Este Mês"
        value={20}
        subtitle="Cirurgias Realizadas"
        icon= {<ArrowUp/>}
      />

      <CardBaseDash
        title="Responsáveis Cadastrados"
        value={20}
        subtitle="Total desde o início"
        icon= {<Users/>}
      />
        </div>

      {/* Gráfico de Carga de Trabalho */}
      <div className="mt-6">
        <CargaTrabalhoChart />
      </div>  

  </>
);

}