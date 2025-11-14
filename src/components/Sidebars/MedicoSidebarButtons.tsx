import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { 
  LayoutDashboardIcon, 
  Calendar,
  DogIcon,
  SheetIcon
} from "lucide-react";

const medicoLinks = [
  { href: "/medico", icon: <LayoutDashboardIcon/>, label: "Dashboard" },
  { href: "/medico/agenda", icon: <Calendar/>, label: "Minha Agenda" },
  { href: "/medico/pacientes", icon: <DogIcon/>, label: "Pacientes" },
  { href: "/medico/prontuarios", icon: <SheetIcon/>, label: "Prontuários" },
];

export default function MedicoSidebarButtons() {
  return (
    <SidebarMenu>
      {medicoLinks.map((link) => (
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