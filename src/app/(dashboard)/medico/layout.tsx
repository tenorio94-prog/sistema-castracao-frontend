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

export default function MedicoLayout({
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
  );
}