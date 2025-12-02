"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Search, 
  Stethoscope, 
  Syringe, 
  ClipboardList, 
  FlaskConical 
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function MedicoSidebarButtons() {
  const pathname = usePathname();

  // Normaliza a rota para comparação
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;

  // Grupo 1: Principal
  const menuPrincipal = [
    { 
      href: "/medico", 
      icon: LayoutDashboard, 
      label: "Dashboard",
      active: normalizedPath === "/medico" 
    },
    { 
      href: "/medico/atendimentos", 
      icon: CalendarDays, 
      label: "Meus Atendimentos",
      active: normalizedPath.startsWith("/medico/atendimentos")
    },
  ];

  // Grupo 2: Clínico
  const menuClinico = [
    { 
      href: "/medico/prontuarios", 
      icon: Search, 
      label: "Buscar Prontuário",
      active: normalizedPath.startsWith("/medico/prontuarios")
    },
    { 
      href: "/medico/fichas-clinicas", 
      icon: Stethoscope, 
      label: "Fichas Clínicas",
      active: normalizedPath.startsWith("/medico/fichas-clinicas")
    },
    { 
      href: "/medico/fichas-cirurgicas", 
      icon: Syringe, 
      label: "Fichas Cirúrgicas",
      active: normalizedPath.startsWith("/medico/fichas-cirurgicas")
    },
    { 
      href: "/medico/fichas-anestesicas", 
      icon: ClipboardList, 
      label: "Fichas Anestésicas",
      active: normalizedPath.startsWith("/medico/fichas-anestesicas")
    },
    { 
      href: "/medico/fichas-de-exames", 
      icon: FlaskConical, 
      label: "Exames",
      active: normalizedPath.startsWith("/medico/exames")
    },
  ];

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:py-0">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Menu Principal</SidebarGroupLabel>
        <SidebarMenu>
          {menuPrincipal.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={item.active}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:py-0">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Prontuários & Fichas</SidebarGroupLabel>
        <SidebarMenu>
          {menuClinico.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={item.active}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}