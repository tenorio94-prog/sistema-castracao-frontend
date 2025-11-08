import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel 
} from "@/components/ui/sidebar";
import AdmSidebarButtons from "@/components/Sidebars/AdmSidebarButtons";

export default function AdmLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        
        {/* A cor verde já vem do globals.css */}
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

        {/* Conteúdo da página (com w-full) */}
        <main className="flex-1 w-full bg-white p-8 overflow-y-auto">
          <SidebarTrigger />
          {children}
        </main>

      </div>
    </SidebarProvider>
  );
}