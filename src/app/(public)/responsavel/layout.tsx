import ResponsibleNavBar from "@/components/ResponsavelComponents/ResponsavelNavBar";

export default function ResponsavelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* TopBar fixa no topo */}
      <ResponsibleNavBar />
      
      {/* Conteúdo scrollável */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}