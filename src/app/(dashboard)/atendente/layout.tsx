// Localização: app/atendente/layout.tsx

// Importa o componente de botões do Atendente
import AtendenteSidebarButtons from "@/components/Sidebars/AtendenteSidebarButtons";

export default function AtendenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen">
      
      {/* BARRA LATERAL (Sidebar Verde) */}
      <aside className="w-64 bg-green-700 p-4">
        <h2 className="text-white text-lg">Meu Painel</h2>
        
        {/* Renderiza os botões do Atendente */}
        <AtendenteSidebarButtons /> 
      
      </aside>

      {/* A ÁREA DO CONTEÚDO (Branca) */}
      <main className="flex-1 bg-white p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}