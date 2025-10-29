// Localização: components/Sidebars/AtendenteSidebarButtons.tsx

import SidebarButton from "@/components/Buttons/SidebarButton";
import { 
  LayoutDashboardIcon, 
  Calendar,
  HeartIcon,
  DogIcon
  // Adicione outros ícones necessários da 'lucide-react'
} from "lucide-react";

export default function AtendenteSidebarButtons() {
  return (
    <nav className = "gap-2 flex flex-col">
      {/* Exemplo de botões para o Atendente */}

      <SidebarButton
        href= "/atendente"
        icon = {<LayoutDashboardIcon/>}
        label= "Dashboard"
      />

      <SidebarButton 
        href= "/atendente/agendamentos"
        icon = {<Calendar/>}
        label= "Agendamentos"
      />

      <SidebarButton 
        href= "/atendente/responsaveis"
        icon = {<HeartIcon/>}
        label= "Responsáveis"
      />

      <SidebarButton 
        href= "/atendente/animais"
        icon = {<DogIcon/>}
        label= "Animais"
      />

      {/* Adicione mais botões aqui */}
    </nav>
  );
}