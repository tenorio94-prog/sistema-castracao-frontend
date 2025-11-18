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
import AtendenteSidebarButtons from "@/components/Sidebars/AtendenteSidebarButtons";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Role } from "@/types/auth.types";

export default function AtendenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute allowedRoles={[Role.receptionist, Role.semas]}>
      <SidebarProvider>
      
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Menu Atendente
            </SidebarGroupLabel>
            <AtendenteSidebarButtons />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-white p-8 overflow-y-auto">
        <SidebarTrigger />
        {children}
      </SidebarInset>

      </SidebarProvider>
    </ProtectedRoute>
  );
}