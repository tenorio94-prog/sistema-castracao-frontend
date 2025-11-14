import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  LayoutDashboardIcon,
  CrossIcon,
  Users,
  GraduationCapIcon,
  HeartIcon,
  DogIcon,
  BoxIcon,
  Calendar,
  SettingsIcon,
} from "lucide-react";

const admLinks = [
  { href: "/adm", icon: <LayoutDashboardIcon />, label: "Dashboard" },
  { href: "/adm/medicos", icon: <CrossIcon />, label: "Médicos" },
  { href: "/adm/atendentes", icon: <Users />, label: "Atendentes" },
  { href: "/adm/estudantes", icon: <GraduationCapIcon />, label: "Estudantes" },
  { href: "/adm/responsaveis", icon: <HeartIcon />, label: "Responsáveis" },
  { href: "/adm/animais", icon: <DogIcon />, label: "Animais" },
  { href: "/adm/estoque", icon: <BoxIcon />, label: "Estoque" },
  { href: "/adm/agendamentos", icon: <Calendar />, label: "Agendamentos" },
  { href: "/adm/usuarios", icon: <SettingsIcon />, label: "Usuários" },
];

export default function AdmSidebarButtons() {
  return (
    <SidebarMenu>
      {admLinks.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton asChild>
            
            {/* MUDANÇA: Classes de cor removidas. 
                Tamanho da fonte 'text-base' mantido. 
                (Troque para 'text-lg' se quiser maior) */}
            <Link
              href={link.href}
              className="text-base"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}