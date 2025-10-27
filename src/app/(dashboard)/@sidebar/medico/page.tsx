// app/(dashboard)/@sidebar/medico/page.tsx
import SidebarButton from "@/components/SidebarButton";
import { 
  Home, 
  Stethoscope, 
  FileSearch, 
  FileText, 
  Scissors, 
  TestTube, 
  Microscope 
} from "lucide-react";

export default function MedicoSidebar() {
  return (
    <div className="flex flex-col h-full">
      {/* 1. Logo (Substitua pelo seu componente de Logo) */}
      <div className="bg-gray-200 h-24 mb-6 flex items-center justify-center rounded">
        <span className="text-gray-600 font-bold">Logo</span>
      </div>

      {/* 2. Menu Principal */}
      <h3 className="text-white font-bold uppercase text-sm mb-2">
        Menu Principal
      </h3>
      <nav className="gap-2 flex flex-col">
        <SidebarButton 
          href="/medico" 
          icon={<Home size={18} />} 
          label="Início" 
        />
        <SidebarButton
          href="/medico/atendimentos"
          icon={<Stethoscope size={18} />}
          label="Atendimentos"
        />
        <SidebarButton
          href="/medico/buscar-prontuarios"
          icon={<FileSearch size={18} />}
          label="Buscar Prontuários"
        />
      </nav>

      {/* 3. Fichas e Registros */}
      <h3 className="text-white font-bold uppercase text-sm mt-6 mb-2">
        Fichas e Registros
      </h3>
      <nav className="gap-2 flex flex-col">
        <SidebarButton
          href="/medico/fichas-clinicas"
          icon={<FileText size={18} />}
          label="Fichas Clínicas"
        />
        <SidebarButton
          href="/medico/fichas-cirurgicas"
          icon={<Scissors size={18} />}
          label="Fichas Cirúrgicas"
        />
        <SidebarButton
          href="/medico/fichas-anestesicas"
          icon={<TestTube size={18} />}
          label="Fichas Anestésicas"
        />
        <SidebarButton
          href="/medico/exames"
          icon={<Microscope size={18} />}
          label="Exames"
        />
      </nav>
    </div>
  );
}