// app/medico/layout.tsx
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
import TopBar from '@/components/Sidebars/TopBarDashboard';

export default function MedicoLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[Role.veterinarian, Role.student]}>
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Médico</SidebarGroupLabel>
              <MedicoSidebarButtons />
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-white overflow-y-auto">
          <TopBar />
          <div className="p-8">
            <SidebarTrigger />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}