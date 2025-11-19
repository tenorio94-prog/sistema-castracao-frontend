// app/atendente/layout.tsx
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

import AtendenteSidebarButtons from "@/components/Sidebars/AtendenteSidebarButtons";
import TopBar from '@/components/Sidebars/TopBarDashboard'; 

export default function AtendenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        
        {/* ALTERAÇÃO AQUI: Adicionei 'group-data-[collapsible=icon]:hidden' 
            Isso remove o Header inteiro (e a logo) quando a sidebar fecha. */}
        <SidebarHeader className="group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
              <Command className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-bold text-gray-900">Sistema Veterinário</span>
              <span className="truncate text-xs font-medium text-gray-700">Módulo Atendente</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <AtendenteSidebarButtons />
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
  );
}