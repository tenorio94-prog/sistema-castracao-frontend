// Localização: components/Sidebars/MedicoSidebarButtons.tsx

import SidebarButton from "@/components/Buttons/SidebarButton";
import { 
  LayoutDashboardIcon, 
  Calendar,
  DogIcon,
  SheetIcon // Exemplo de ícone para prontuário
  // Adicione outros ícones necessários da 'lucide-react'
} from "lucide-react";

export default function MedicoSidebarButtons() {
  return (
    <nav className = "gap-2 flex flex-col">
      {/* Exemplo de botões para o Médico */}

      <SidebarButton
        href= "/medico"
        icon = {<LayoutDashboardIcon/>}
        label= "Dashboard"
      />

      <SidebarButton 
        href= "/medico/agenda"
        icon = {<Calendar/>}
        label= "Minha Agenda"
      />

      <SidebarButton 
        href= "/medico/pacientes"
        icon = {<DogIcon/>}
        label= "Pacientes"
      />

      <SidebarButton 
        href= "/medico/prontuarios"
        icon = {<SheetIcon/>}
        label= "Prontuários"
      />

      {/* Adicione mais botões aqui */}
    </nav>
  );
}