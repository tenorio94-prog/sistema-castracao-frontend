import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,         
  SidebarGroupLabel,    
} from "@/components/ui/sidebar";
// import Link from "next/link"; 
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
// Alinhado com a hierarquia da imagem: Início é o primeiro botão após o Dashboard
const menuPrincipalLinks = [
  // Assumimos que /medico é a rota da Dashboard
  { href: "/medico", icon: <LayoutDashboardIcon/>, label: "Dashboard" }, 
  
  // Mapeamos para a pasta 'atendimentos' (sua pasta de destino)
  { href: "/medico/atendimentos", icon: <Calendar/>, label: "Atendimentos" }, 
  
  // Mapeamos para a pasta 'prontuarios'
  { href: "/medico/prontuarios", icon: <SearchIcon/>, label: "Buscar Prontuários" },
];

// --- Seção 2: Fichas e Registros ---
// Alinhado com as pastas do seu sistema:
const fichasLinks = [
  { href: "/medico/fichas-clinicas", icon: <StethoscopeIcon/>, label: "Fichas Clínicas" },
  { href: "/medico/fichas-cirurgicas", icon: <SyringeIcon/>, label: "Fichas Cirúrgicas" },
  { href: "/medico/fichas-anestesicas", icon: <ClipboardListIcon/>, label: "Fichas Anestésicas" },
  { href: "/medico/exames", icon: <BeakerIcon/>, label: "Exames" }, // Assumimos que a pasta 'exames' existe
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
                <a 
                  href={link.href}
                  className="text-base" 
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
                <a 
                  href={link.href}
                  className="text-base" 
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