"use client";

import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarInset,
  SidebarRail 
} from "@/components/ui/sidebar";
import { Command } from "lucide-react";

import MedicoSidebarButtons from "@/components/Sidebars/MedicoSidebarButtons";
import TopBar from '@/components/Sidebars/TopBarDashboard'; 
import ProtectedRoute from "@/components/ProtectedRoute";
import { Role } from "@/types/auth.types";

export default function MedicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[Role.veterinarian, Role.student]}>
      <SidebarProvider className="!h-screen !max-h-screen !overflow-hidden bg-sidebar">
        <Sidebar variant="inset" collapsible="icon">
          
          {/* Header da Sidebar: Identidade Visual Azul para Médico */}
          <SidebarHeader className="group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-gray-900">Sistema Veterinário</span>
                <span className="truncate text-xs font-medium text-gray-700">Área Médica</span>
              </div>
            </div>
          </SidebarHeader>

          {/* Conteúdo dos Botões */}
          <SidebarContent>
            <MedicoSidebarButtons />
          </SidebarContent>

          {/* Rodapé (Opcional) */}
          <SidebarFooter>
             <div className="px-4 py-2 text-xs text-gray-400 text-center opacity-50 hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden">
               v1.0.0
             </div>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        {/* Área de Conteúdo Principal - com margem para mostrar fundo verde */}
        <SidebarInset className="bg-gray-50 flex flex-col h-[calc(100vh-16px)] overflow-hidden my-2 mr-2 rounded-xl shadow-sm">
          <TopBar />
          
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}