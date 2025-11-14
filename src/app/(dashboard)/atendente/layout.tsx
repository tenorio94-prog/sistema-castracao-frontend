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

export default function AdmLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

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
  );
}