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
      <SidebarProvider className="h-screen! max-h-screen! overflow-hidden! bg-sidebar">
        <Sidebar variant="inset" collapsible="icon">
          
          {/* Header com Logo */}
          <SidebarHeader className="group-data-[collapsible=icon]:hidden">
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-6">
              <div className="flex gap-4 items-center justify-center">
                {/* Logo UNIPET (Mantida Original) */}
                <div className="relative flex aspect-square size-28 items-center justify-center rounded-full overflow-hidden bg-white shadow-md border-2 border-green-100">
                  <Image
                    src="/unipet.png"
                    alt="Logo UNIPET"
                    width={112}
                    height={112}
                    className="object-contain p-2"
                    priority
                  />
                </div>

                {/* Logo Hospital (Estilizada: Branca e Sem Fundo) */}
                <div className="flex justify-center items-center">
                  <div className="relative size-28">
                    <Image
                      src="/hospital.png"
                      alt="UFRPE - Departamento de Medicina Veterinária"
                      fill
                      className="object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
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

          {/* Footer com Logo SEMAS */}
          <SidebarFooter className="border-t border-green-700/30 py-6 px-4 group-data-[collapsible=icon]:hidden">
            <div className="space-y-4">
              {/* Logo Governo de Pernambuco (Estilizada: Branca, Maior e Sem Fundo) */}
              <div className="flex justify-center">
                <div className="relative w-full h-16">
                  <Image
                    src="/semas.png"
                    alt="Governo de Pernambuco"
                    fill
                    className="object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
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