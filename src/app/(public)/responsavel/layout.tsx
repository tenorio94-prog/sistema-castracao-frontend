// app/responsavel/layout.tsx
"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
} from "@/components/ui/sidebar";
import TopBar from "@/components/ResponsavelComponents/TopBar";
import ResponsavelSidebarButtons from "@/components/Sidebars/ResponsavelSidebarButtons";
import { useRouter } from 'next/navigation';

export default function ResponsavelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm("Tem certeza que deseja sair?")) router.push("/login");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Responsável</SidebarGroupLabel>
            <ResponsavelSidebarButtons />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-white overflow-y-auto">
        {/* TopBar verde */}
        <div className="sticky top-0 z-40 bg-green-700 shadow-sm">
          <TopBar variant="green" onLogout={handleLogout} />
        </div>

        <div className="p-8">
          <SidebarTrigger />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}