// Localização: components/Sidebars/MedicoSidebarButtons.tsx

import SidebarButton from "@/components/Buttons/SidebarButton";
import {
  HomeIcon,
  Calendar,
  SearchIcon,
  StethoscopeIcon,
  SyringeIcon,
  ClipboardListIcon,
  BeakerIcon,
  LayoutDashboardIcon
} from "lucide-react";

export default function MedicoSidebarButtons() {
  return (
    <nav className="gap-2 flex flex-col">
      {/* --- Seção Menu Principal --- */}
      <span className="px-4 pt-2 pb-1 text-xs font-bold uppercase text-white tracking-wider">
        Menu Principal
      </span>

      <SidebarButton
        href="/medico/inicio"
        icon={<HomeIcon />}
        label="Início"
      />

        <SidebarButton
        href= "/medico"
        icon = {<LayoutDashboardIcon/>}
        label= "Dashboard"
      />



      <SidebarButton
        href="/medico/atendimentos"
        icon={<Calendar />}
        label="Atendimentos"
      />

      <SidebarButton
        href="/medico/prontuarios"
        icon={<SearchIcon />}
        label="Buscar Prontuários"
      />

      {/* --- Seção Fichas e Registros --- */}
      <span className="px-4 pt-4 pb-1 text-xs font-bold uppercase text-white tracking-wider">
        Fichas e Registros
      </span>

      <SidebarButton
        href="/medico/fichas-clinicas"
        icon={<StethoscopeIcon />}
        label="Fichas Clínicas"
      />

      <SidebarButton
        href="/medico/fichas-cirurgicas"
        icon={<SyringeIcon />}
        label="Fichas Cirúrgicas"
      />

      <SidebarButton
        href="/medico/fichas-anestesicas"
        icon={<ClipboardListIcon />}
        label="Fichas Anestésicas"
      />

      <SidebarButton
        href="/medico/exames"
        icon={<BeakerIcon />}
        label="Exames"
      />
    </nav>
  );
}