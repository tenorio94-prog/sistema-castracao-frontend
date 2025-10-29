import AdmSidebarButtons from "@/components/Sidebars/AdmSidebarButtons";


export default function AdmLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen">
      
      {/* BARRA LATERAL (Sidebar Verde) */}
      <aside className="w-64 bg-green-700 p-4">
        <h2 className="text-white text-lg">Meu Painel</h2>
        
        {/* 3. Renderiza diretamente os botões do ADM */}
        <AdmSidebarButtons /> 
      
      </aside>

      {/* A ÁREA DO CONTEÚDO (Branca) */}
      <main className="flex-1 bg-white p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}