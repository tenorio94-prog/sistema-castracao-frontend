import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { 
  LayoutDashboardIcon, 
  Calendar,
  HeartIcon,
  DogIcon
} from "lucide-react";

const atendenteLinks = [
  { href: "/atendente", icon: <LayoutDashboardIcon/>, label: "Dashboard" },
  { href: "/atendente/agendamentos", icon: <Calendar/>, label: "Agendamentos" },
  { href: "/atendente/responsaveis", icon: <HeartIcon/>, label: "Responsáveis" },
  { href: "/atendente/animais", icon: <DogIcon/>, label: "Animais" },
];

export default function AtendenteSidebarButtons() {
  return (
    <SidebarMenu>
      {atendenteLinks.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton asChild>
            
            {/* MUDANÇA: Classes de cor removidas. 
                Tamanho da fonte 'text-base' mantido. */}
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