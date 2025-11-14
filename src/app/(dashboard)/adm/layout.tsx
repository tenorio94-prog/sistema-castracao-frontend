import { 
  SidebarProvider, 
  SidebarTrigger,
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel,
  SidebarInset 
} from "@/components/ui/sidebar";
import AdmSidebarButtons from "@/components/Sidebars/AdmSidebarButtons";

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
              Menu Admin
            </SidebarGroupLabel>
            <AdmSidebarButtons />
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