import CardBaseDash from "@/components/Dashboard/CardBaseDash"; 
import AgendamentoCard from "@/components/public/AgendamentoCard";

export default function DashboardLayout({
  children,
  sidebar, // Aceita a prop da rota paralela @sidebar
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode; // Faz a tipagem da prop
}) {

  return (
    <div className="flex h-screen">
      
      {/* BARRA LATERAL (Sidebar Verde) */}
      <aside className="w-64 bg-green-700 p-4">
        <h2 className="text-white text-lg">Meu Painel</h2>
        
        {/* Onde é renderizado o conteúdo dinâmico do slot */}
        {sidebar} 
      
      </aside>

      {/* A ÁREA DO CONTEÚDO (Branca) */}
      <main className="flex-1 bg-white p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}