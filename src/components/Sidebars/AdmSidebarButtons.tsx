import SidebarButton from "@/components/Buttons/SidebarButton";
import { 
  LayoutDashboardIcon, 
  Heart,
  CrossIcon, 
  Users, 
  GraduationCapIcon, 
  HeartIcon, 
  DogIcon, 
  BoxIcon, 
  Calendar, 
  SettingsIcon 
} from "lucide-react";

export default function AdmSidebarButtons() {
  return (

<nav className = "gap-2 flex flex-col">
<SidebarButton
href= "/adm"
icon = {<LayoutDashboardIcon/>}
label= "Dashboard"
/>

<SidebarButton 
href= "/adm/medicos"
icon = {<CrossIcon/>}
label= "Médicos"
/>

<SidebarButton 
href= "/adm/atendentes"
icon = {<Users/>}
label= "Atendentes"
/>

<SidebarButton 
href= "/adm/estudantes"
icon = {<Heart/>}
label= "Estudantes"
/>

<SidebarButton 
href= "/adm/responsaveis"
icon = {<HeartIcon/>}
label= "Responsáveis"
/>

<SidebarButton 
href= "/adm/animais"
icon = {<DogIcon/>}
label= "Animais"
/>

<SidebarButton 
href= "/adm/estoque"
icon = {<BoxIcon/>}
label= "Estoque"
/>

<SidebarButton 
href= "/adm/agendamentos"
icon = {<Calendar/>}
label= "Agendamentos"
/>

<SidebarButton 
href= "/adm/usuarios"
icon = {<SettingsIcon/>}
label= "Usuários"
/>

</nav>
  );
}