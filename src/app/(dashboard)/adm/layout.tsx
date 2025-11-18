// app/admin/layout.tsx  ← ou app/adm/layout.tsx, use o caminho real do seu projeto
"use client";

import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel,
  SidebarInset 
} from "@/components/ui/sidebar";
import AdmSidebarButtons from "@/components/Sidebars/AdmSidebarButtons";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Role } from "@/types/auth.types";
import TopBar from '@/components/Sidebars/TopBarDashboard';

export default function AdmLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[Role.administrator]}>
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Admin</SidebarGroupLabel>
              <AdmSidebarButtons />
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-white overflow-y-auto">
          {/* TopBar fixa + sombra */}
          <TopBar />
          {/* conteúdo com padding corrigido */}
          <div className="p-8">
            <SidebarTrigger />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}