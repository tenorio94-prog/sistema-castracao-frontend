import ResponsibleNavBar from "@/components/ResponsavelComponents/ResponsavelNavBar";

export default function ResponsavelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* TopBar fixa no topo */}
      <ResponsibleNavBar />
      
      {/* Conteúdo com padding para respirar */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}