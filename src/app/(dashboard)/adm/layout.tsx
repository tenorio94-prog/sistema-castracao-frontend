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
import Image from 'next/image';
import AdmSidebarButtons from "@/components/Sidebars/AdmSidebarButtons";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Role } from "@/types/auth.types";
import TopBar from '@/components/Sidebars/TopBarDashboard';

export default function AdmLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[Role.administrator]}>
      <SidebarProvider className="!h-screen !max-h-screen !overflow-hidden bg-sidebar">
        <Sidebar variant="inset" collapsible="icon">
          
          {/* Header com Logo */}
          <SidebarHeader className="group-data-[collapsible=icon]:hidden">
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-6">
              <div className="flex gap-4 items-center justify-center">
                <div className="relative flex aspect-square size-20 items-center justify-center rounded-full overflow-hidden bg-white shadow-md border-2 border-green-100">
                  <Image
                    src="/unipet.png"
                    alt="Logo UNIPET"
                    width={80}
                    height={80}
                    className="object-contain p-2"
                    priority
                  />
                </div>
                <div className="flex justify-center">
                  <div className="relative w-full aspect-square bg-white rounded-full p-3 shadow-sm size-20">
                    <Image
                      src="/hospital.png"
                      alt="UFRPE - Departamento de Medicina Veterinária"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <span className="block text-sm font-bold text-white">Módulo Administrador</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <AdmSidebarButtons />
          </SidebarContent>

          {/* Footer com Logos Governamentais */}
          <SidebarFooter className="border-t border-green-700/30 py-4 px-3 group-data-[collapsible=icon]:hidden">
            <div className="space-y-4">
              {/* Logo Governo de Pernambuco */}
              <div className="flex justify-center">
                <div className="relative w-full h-14 bg-white rounded-lg p-2.5 shadow-sm">
                  <Image
                    src="/semas.png"
                    alt="Governo de Pernambuco"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </SidebarFooter>
          
          <SidebarRail />
        </Sidebar>

        {/* Área de Conteúdo Principal - com margem para mostrar fundo verde */}
        <SidebarInset className="bg-gray-50 flex flex-col h-[calc(100vh-16px)] overflow-hidden my-2 mr-2 rounded-xl shadow-sm">
          <TopBar />
          
          {/* Main com scroll interno */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}