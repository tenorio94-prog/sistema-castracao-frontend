import SidebarButton from "@/components/Buttons/SidebarButton";
import { Home, Calendar, PawPrint, UserPlus } from "lucide-react";

export default function AtendenteSidebar() {
  return (
    <nav className="gap-2 flex flex-col mt-4">
      <SidebarButton 
        href="/atendente" 
        icon={<Home size={18} />} 
        label="Início" 
      />

      <SidebarButton
        href="/atendente/agendamentos"
        icon={<Calendar size={18} />}
        label="Agendamentos"
      />

      <SidebarButton
        href="/atendente/animais"
        icon={<PawPrint size={18} />}
        label="Animais"
      />

      <SidebarButton
        href="/atendente/cadastro"
        icon={<UserPlus size={18} />}
        label="Cadastro"
      />
    </nav>
  );
}