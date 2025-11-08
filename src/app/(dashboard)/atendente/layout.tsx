import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel 
} from "@/components/ui/sidebar";
import AtendenteSidebarButtons from "@/components/Sidebars/AtendenteSidebarButtons";

export default function AtendenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        
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

        <main className="flex-1 w-full bg-white p-8 overflow-y-auto">
          <SidebarTrigger />
          {children}
        </main>

      </div>
    </SidebarProvider>
  );
}