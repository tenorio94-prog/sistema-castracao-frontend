// ARQUIVO: src/components/Sidebars/MedicoSidebarButtons.tsx

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,         // Componente de grupo
  SidebarGroupLabel,    // Título do grupo
} from "@/components/ui/sidebar";
// import Link from "next/link"; // REMOVIDO para correção
import { 
  HomeIcon, 
  Calendar,
  SearchIcon,
  StethoscopeIcon,
  SyringeIcon,
  ClipboardListIcon,
  BeakerIcon,
  LayoutDashboardIcon
} from "lucide-react";

// --- Seção 1: Menu Principal ---
const menuPrincipalLinks = [
  { href: "/medico", icon: <LayoutDashboardIcon/>, label: "Dashboard" },
  { href: "/medico/inicio", icon: <HomeIcon/>, label: "Início" },
  { href: "/medico/atendimentos", icon: <Calendar/>, label: "Atendimentos" }, 
  { href: "/medico/prontuarios", icon: <SearchIcon/>, label: "Buscar Prontuários" },
];

// --- Seção 2: Fichas e Registros ---
const fichasLinks = [
  { href: "/medico/fichas-clinicas", icon: <StethoscopeIcon/>, label: "Fichas Clínicas" },
  { href: "/medico/fichas-cirurgicas", icon: <SyringeIcon/>, label: "Fichas Cirúrgicas" },
  { href: "/medico/fichas-anestesicas", icon: <ClipboardListIcon/>, label: "Fichas Anestésicas" },
  { href: "/medico/exames", icon: <BeakerIcon/>, label: "Exames" },
];

/**
 * Componente MedicoSidebarButtons Padronizado e com links completos.
 * CORREÇÃO: Usando <a> tag em vez de Next Link.
 */
export default function MedicoSidebarButtons() {
  return (
    <>
      {/* --- GRUPO: Menu Principal --- */}
      <SidebarGroup>
        <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
        <SidebarMenu>
          {menuPrincipalLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton asChild>
                <a // <-- CORREÇÃO: Usando <a>
                  href={link.href}
                  className="text-base" // Mantém o tamanho da fonte padrão
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {/* --- GRUPO: Fichas e Registros --- */}
      <SidebarGroup>
        <SidebarGroupLabel>Fichas e Registros</SidebarGroupLabel>
        <SidebarMenu>
          {fichasLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton asChild>
                <a // <-- CORREÇÃO: Usando <a>
                  href={link.href}
                  className="text-base" // Mantém o tamanho da fonte padrão
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}