// app/atendente/layout.tsx (exemplo - repita para adm e médico)
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
import TopBar from '@/components/Sidebars/TopBarDashboard';

export default function AtendenteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu Atendente</SidebarGroupLabel>
            <AtendenteSidebarButtons />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="bg-white overflow-y-auto">
        {/* TopBar com sticky e sombra apenas */}
        <TopBar />
        
        {/* Conteúdo com padding ajustado */}
        <div className="p-8">
          <SidebarTrigger />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}