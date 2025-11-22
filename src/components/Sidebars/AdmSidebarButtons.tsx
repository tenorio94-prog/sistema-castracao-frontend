"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Stethoscope, // Mais adequado para Médicos/Vet
  Users,
  GraduationCap,
  HeartHandshake,
  Dog,
  Package, // BoxIcon -> Package
  CalendarDays,
  Settings,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function AdmSidebarButtons() {
  const pathname = usePathname();
  
  // Normaliza a rota para evitar erros com barra no final
  const normalizedPath = pathname.endsWith('/') && pathname.length > 1 
    ? pathname.slice(0, -1) 
    : pathname;

  // Grupo 1: Visão Geral
  const menuGeral = [
    { href: "/adm", icon: LayoutDashboard, label: "Dashboard", active: normalizedPath === "/adm" },
  ];

  // Grupo 2: Cadastros (Pessoas e Animais)
  const menuCadastros = [
    { href: "/adm/medicos", icon: Stethoscope, label: "Médicos", active: normalizedPath.startsWith("/adm/medicos") },
    { href: "/adm/atendentes", icon: Users, label: "Atendentes", active: normalizedPath.startsWith("/adm/atendentes") },
    { href: "/adm/estudantes", icon: GraduationCap, label: "Estudantes", active: normalizedPath.startsWith("/adm/estudantes") },
    { href: "/adm/responsaveis", icon: HeartHandshake, label: "Responsáveis", active: normalizedPath.startsWith("/adm/responsaveis") },
    { href: "/adm/animais", icon: Dog, label: "Animais", active: normalizedPath.startsWith("/adm/animais") },
  ];

  // Grupo 3: Gestão e Sistema
  const menuGestao = [
    { href: "/adm/agendamentos", icon: CalendarDays, label: "Agendamentos", active: normalizedPath.startsWith("/adm/agendamentos") },
    { href: "/adm/estoque", icon: Package, label: "Estoque", active: normalizedPath.startsWith("/adm/estoque") },
    { href: "/adm/usuarios", icon: Settings, label: "Usuários", active: normalizedPath.startsWith("/adm/usuarios") },
  ];

  return (
    <>
      {/* Visão Geral */}
      <SidebarGroup className="group-data-[collapsible=icon]:py-0">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Visão Geral</SidebarGroupLabel>
        <SidebarMenu>
          {menuGeral.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Cadastros */}
      <SidebarGroup className="group-data-[collapsible=icon]:py-0">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Cadastros</SidebarGroupLabel>
        <SidebarMenu>
          {menuCadastros.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* Sistema */}
      <SidebarGroup className="group-data-[collapsible=icon]:py-0">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Sistema</SidebarGroupLabel>
        <SidebarMenu>
          {menuGestao.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={item.active} tooltip={item.label}>
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