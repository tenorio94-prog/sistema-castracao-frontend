import CardBaseDash from "@/components/CardBaseDash"; 
import AgendamentoCard
 from "@/components/public/AgendamentoCard";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    // 1. Container Principal
    <div className="flex h-screen">
      
      {/* 2. A BARRA LATERAL (Sidebar Verde) */}
      <aside className="w-64 bg-green-700 p-4">
        <h2 className="text-white text-lg">Meu Painel</h2>
        {/* links */}
      </aside>

      {/* 3. A ÁREA DE CONTEÚDO (Branca) */}
      <main className="flex-1 bg-white p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}