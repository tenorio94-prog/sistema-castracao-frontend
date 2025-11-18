"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  CalendarDays,
  HeartHandshake,
  Dog,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function AtendenteSidebarButtons() {
  const pathname = usePathname();

  // Normaliza o pathname removendo a barra final se houver, para garantir comparação exata
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;

  // Grupo 1: Principal
  const menuPrincipal = [
    { 
      href: "/atendente", 
      icon: LayoutDashboard, 
      label: "Dashboard",
      // Lógica corrigida: Verifica exatidão para a raiz
      active: normalizedPath === "/atendente" 
    },
  ];

  // Grupo 2: Gestão Operacional
  const menuGestao = [
    { 
      href: "/atendente/agendamentos", 
      icon: CalendarDays, 
      label: "Agendamentos",
      active: normalizedPath.startsWith("/atendente/agendamentos")
    },
    { 
      href: "/atendente/animais", 
      icon: Dog, 
      label: "Animais",
      active: normalizedPath.startsWith("/atendente/animais")
    },
    { 
      href: "/atendente/responsaveis", 
      icon: HeartHandshake, 
      label: "Responsáveis",
      active: normalizedPath.startsWith("/atendente/responsaveis")
    },
  ];

  return (
    <>
      {/* Grupo VISÃO GERAL */}
      <SidebarGroup className="group-data-[collapsible=icon]:py-0">
        {/* CORREÇÃO CRÍTICA: 'hidden' quando fechado evita que o label bloqueie o clique no botão */}
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
          Visão Geral
        </SidebarGroupLabel>
        <SidebarMenu>
          {menuPrincipal.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={item.active} 
                tooltip={item.label}
                className="w-full" // Garante área de clique total
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

      {/* Grupo GESTÃO */}
      <SidebarGroup className="group-data-[collapsible=icon]:py-0">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
          Gestão
        </SidebarGroupLabel>
        <SidebarMenu>
          {menuGestao.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={item.active}
                tooltip={item.label}
                className="w-full"
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