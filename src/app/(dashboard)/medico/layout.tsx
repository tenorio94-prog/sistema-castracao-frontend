import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel 
} from "@/components/ui/sidebar";
import MedicoSidebarButtons from "@/components/Sidebars/MedicoSidebarButtons";

export default function MedicoLayout({
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
                Menu Médico
              </SidebarGroupLabel>
              <MedicoSidebarButtons />
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