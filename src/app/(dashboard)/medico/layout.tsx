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
import MedicoSidebarButtons from "@/components/Sidebars/MedicoSidebarButtons";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Role } from "@/types/auth.types";

export default function MedicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute allowedRoles={[Role.veterinarian, Role.student]}>
      <SidebarProvider>
      
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Menu Médico
            </SidebarGroupLabel>
            <MedicoSidebarButtons />
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