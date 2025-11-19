// app/adm/layout.tsx (Verifique se sua pasta é 'adm' ou 'admin')
"use client";

import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader,
  SidebarContent, 
  SidebarFooter,
  SidebarRail,
  SidebarInset 
} from "@/components/ui/sidebar";
import { Command } from "lucide-react";
import AdmSidebarButtons from "@/components/Sidebars/AdmSidebarButtons";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Role } from "@/types/auth.types";
import TopBar from '@/components/Sidebars/TopBarDashboard'; // Caminho corrigido para Layout/TopBar

export default function AdmLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[Role.administrator]}>
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          
          {/* Header com Logo */}
          <SidebarHeader className="group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                <Command className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-gray-900">Sistema Veterinário</span>
                <span className="truncate text-xs font-medium text-gray-700">Módulo Administrador</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <AdmSidebarButtons />
          </SidebarContent>

          <SidebarFooter>
            <div className="px-4 py-2 text-xs text-gray-400 text-center opacity-50 hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden">
              v1.0.0
            </div>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-gray-50 flex flex-col h-screen overflow-hidden">
          <TopBar />
          
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}