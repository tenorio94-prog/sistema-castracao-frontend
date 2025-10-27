import SidebarButton from "@/components/Buttons/SidebarButton";
import { LayoutDashboardIcon, CrossIcon, Users, GraduationCapIcon, HeartIcon, DogIcon, BoxIcon, Calendar, SettingsIcon } from "lucide-react";

export default function AdmSidebarButtons() {
  return (

<nav className = "gap-2 flex flex-col">
<SidebarButton 
href= "adm"
icon = {<LayoutDashboardIcon/>}
label= "Dashboard"
/>

<SidebarButton 
href= "adm/admMedicos"
icon = {<CrossIcon/>}
label= "Médicos"
/>

<SidebarButton 
href= "adm/admAtendentes"
icon = {<Users/>}
label= "Atendentes"
/>

<SidebarButton 
href= "adm/admEstudantes"
icon = {<GraduationCapIcon/>}
label= "Estudantes"
/>

<SidebarButton 
href= "adm/admResponsaveis"
icon = {<HeartIcon/>}
label= "Responsáveis"
/>

<SidebarButton 
href= "adm/admAnimais"
icon = {<DogIcon/>}
label= "Animais"
/>

<SidebarButton 
href= "adm/admEstoque"
icon = {<BoxIcon/>}
label= "Estoque"
/>

<SidebarButton 
href= "adm/admAgendamentos"
icon = {<Calendar/>}
label= "Agendamentos"
/>

<SidebarButton 
href= "adm/admUsuarios"
icon = {<SettingsIcon/>}
label= "Usuários"
/>

</nav>
  );
}