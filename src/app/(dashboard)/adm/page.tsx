"use client";

import React, { useEffect, useState } from "react";
import { toast } from 'sonner';
import CardBaseDash from "@/components/Dashboard/CardBaseDash";
import PageHeader from '@/components/AtendenteComponents/PageHeader';
import CargaTrabalhoChart from "@/components/Dashboard/CargaTrabalhoGrafico";
import { Calendar, Dog, Users, Activity, Stethoscope, Loader2 } from "lucide-react";

import { AppointmentService, Appointment, AppointmentStatus, ServiceType } from '@/services/appointment.service';
import { AnimalService, Animal } from '@/services/animal.service';
import { PetOwnerService } from '@/services/petowner.service';
import { VeterinarianService, Veterinarian } from '@/services/veterinarian.service';
import { ClinicalRecordService, ClinicalRecord, ClinicalRecordType } from '@/services/medical-record.service';

// --- TIPOS ---
type DashboardStats = {
  agendamentosHoje: number;
  cirurgiasMes: number;
  novosAnimaisMes: number;
  totalTutores: number;
  totalCirurgiasAno: number;
  cirurgiasConcluidasMes: number;
  totalAnimais: number;
};

type VetChartData = {
  name: string;
  Consultas: number;
  Cirurgias: number;
};

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    agendamentosHoje: 0,
    cirurgiasMes: 0,
    novosAnimaisMes: 0,
    totalTutores: 0,
    totalCirurgiasAno: 0,
    cirurgiasConcluidasMes: 0,
    totalAnimais: 0,
  });
  
  const [chartData, setChartData] = useState<VetChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- CARREGAMENTO DE DADOS ---
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados em paralelo para máxima performance
      const [agendamentos, animais, tutores, veterinarios] = await Promise.all([
        AppointmentService.getAll(),
        AnimalService.getAll(),
        PetOwnerService.getAll(),
        VeterinarianService.getAll(),
      ]);

      // Tentar buscar clinical records (pode falhar se endpoint não existir)
      let clinicalRecords: ClinicalRecord[] = [];
      try {
        clinicalRecords = await ClinicalRecordService.getAll();
      } catch (err) {
        console.warn('⚠️ Não foi possível buscar clinical records:', err);
      }

      console.log('📊 Dados recebidos:', {
        agendamentos: agendamentos.length,
        animais: animais.length,
        tutores: tutores.length,
        veterinarios: veterinarios.length,
        clinicalRecords: clinicalRecords.length
      });

      // --- CALCULAR MÉTRICAS ---
      
      // Data atual
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      // Primeiro dia do mês atual
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      inicioMes.setHours(0, 0, 0, 0);
      
      // Primeiro dia do ano atual
      const inicioAno = new Date(hoje.getFullYear(), 0, 1);
      inicioAno.setHours(0, 0, 0, 0);

      // 1. Agendamentos de HOJE (qualquer status, exceto cancelado/ausente)
      const agendamentosHoje = agendamentos.filter(apt => {
        const dataAgendamento = new Date(apt.startTime);
        return dataAgendamento >= hoje && 
               dataAgendamento < amanha &&
               apt.status !== AppointmentStatus.canceled &&
               apt.status !== AppointmentStatus.absent;
      }).length;

      // 2. Cirurgias do MÊS (serviceType = castrationSurgery)
      const cirurgiasMes = agendamentos.filter(apt => {
        const dataAgendamento = new Date(apt.startTime);
        return apt.serviceType === ServiceType.castrationSurgery &&
               dataAgendamento >= inicioMes;
      }).length;

      // 3. Cirurgias CONCLUÍDAS do mês
      const cirurgiasConcluidasMes = agendamentos.filter(apt => {
        const dataAgendamento = new Date(apt.startTime);
        return apt.serviceType === ServiceType.castrationSurgery &&
               apt.status === AppointmentStatus.completed &&
               dataAgendamento >= inicioMes;
      }).length;

      // 4. Novos animais cadastrados no MÊS
      // Verificar se o animal tem createdAt, updatedAt ou usar fallback
      const novosAnimaisMes = animais.filter((animal: Animal) => {
        // Tentar usar createdAt primeiro
        const dataCadastroStr = animal.createdAt || animal.updatedAt;
        
        if (!dataCadastroStr) {
          // Se não tem data, assume que foi criado recentemente (fallback)
          return false;
        }
        
        const dataCadastro = new Date(dataCadastroStr);
        
        // Verificar se a data é válida
        if (isNaN(dataCadastro.getTime())) {
          console.warn('⚠️ Data inválida para animal:', animal.id, dataCadastroStr);
          return false;
        }
        
        return dataCadastro >= inicioMes;
      }).length;

      // 5. Total de tutores cadastrados
      const totalTutores = tutores.length;
      
      // 6. Total de animais cadastrados
      const totalAnimais = animais.length;

      // 7. Total de cirurgias do ANO
      const totalCirurgiasAno = agendamentos.filter(apt => {
        const dataAgendamento = new Date(apt.startTime);
        return apt.serviceType === ServiceType.castrationSurgery &&
               dataAgendamento >= inicioAno;
      }).length;

      // 8. Dados do gráfico de veterinários
      // Usar clinical records se disponível, senão estimar pelos agendamentos
      const chartDataCalculado: VetChartData[] = veterinarios
        .filter((vet: Veterinarian) => vet.active && vet.user?.completeName)
        .slice(0, 6) // Limitar a 6 veterinários
        .map((vet: Veterinarian) => {
          // Contar registros clínicos deste veterinário
          const registrosDoVet = clinicalRecords.filter(
            (cr: ClinicalRecord) => cr.veterinarianId === vet.id
          );
          
          // Separar por tipo
          const consultas = registrosDoVet.filter(
            (cr: ClinicalRecord) => cr.type === ClinicalRecordType.triage || cr.type === ClinicalRecordType.followUp
          ).length;
          
          const cirurgias = registrosDoVet.filter(
            (cr: ClinicalRecord) => cr.type === ClinicalRecordType.surgery
          ).length;
          
          // Extrair primeiro e segundo nome
          const nomes = vet.user?.completeName.split(' ') || ['Veterinário'];
          const nomeExibicao = nomes.length > 1 
            ? `${nomes[0]} ${nomes[1].charAt(0)}.` 
            : nomes[0];
          
          return {
            name: nomeExibicao,
            Consultas: consultas,
            Cirurgias: cirurgias
          };
        });
      
      // Se não houver veterinários ou registros clínicos, criar dados de resumo
      let chartDataFinal: VetChartData[];
      
      if (chartDataCalculado.length === 0) {
        // Não há veterinários ativos - gráfico mostrará estado vazio
        chartDataFinal = [];
      } else if (!clinicalRecords.length) {
        // Há veterinários mas não há registros clínicos - usar dados gerais dos agendamentos
        const totalConsultas = agendamentos.filter(
          (a: Appointment) => a.serviceType === ServiceType.triage || a.serviceType === ServiceType.postOperative
        ).length;
        
        const totalCirurgias = agendamentos.filter(
          (a: Appointment) => a.serviceType === ServiceType.castrationSurgery
        ).length;
        
        // Só mostrar dados gerais se houver pelo menos algum atendimento
        if (totalConsultas > 0 || totalCirurgias > 0) {
          chartDataFinal = [{
            name: 'Equipe Geral',
            Consultas: totalConsultas,
            Cirurgias: totalCirurgias
          }];
        } else {
          chartDataFinal = [];
        }
      } else {
        // Filtrar veterinários que têm pelo menos algum atendimento
        chartDataFinal = chartDataCalculado.filter(
          (v: VetChartData) => v.Consultas > 0 || v.Cirurgias > 0
        );
        
        // Se todos os veterinários têm 0, mostrar estado vazio
        if (chartDataFinal.length === 0) {
          chartDataFinal = [];
        }
      }

      setChartData(chartDataFinal);
      setStats({
        agendamentosHoje,
        cirurgiasMes,
        novosAnimaisMes,
        totalTutores,
        totalCirurgiasAno,
        cirurgiasConcluidasMes,
        totalAnimais,
      });

      console.log('📊 Dashboard Stats calculadas:', {
        agendamentosHoje,
        cirurgiasMes,
        cirurgiasConcluidasMes,
        novosAnimaisMes,
        totalTutores,
        totalAnimais,
        totalCirurgiasAno,
        chartData: chartDataFinal
      });

    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err);
      const msg = err.message || 'Erro ao carregar dados do dashboard';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // --- CALCULAR TENDÊNCIAS ---
  const getMesAtual = () => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[new Date().getMonth()];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Dashboard Administrativo"
          description="Visão geral de desempenho e métricas da clínica."
        />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Dashboard Administrativo"
          description="Visão geral de desempenho e métricas da clínica."
        />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <PageHeader 
        title="Dashboard Administrativo"
        description="Visão geral de desempenho e métricas da clínica."
      />

      {/* Grid de Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <CardBaseDash
          title="Agendamentos Hoje"
          value={stats.agendamentosHoje}
          subtitle={`Agendados para ${new Date().toLocaleDateString('pt-BR')}`}
          icon={Calendar}
          color="blue"
        />

        <CardBaseDash
          title="Cirurgias (Mês)"
          value={stats.cirurgiasMes}
          subtitle={`Agendadas em ${getMesAtual()}`}
          icon={Activity}
          color="purple"
          trend={stats.cirurgiasConcluidasMes > 0 ? `${stats.cirurgiasConcluidasMes} concluídas` : undefined}
        />

        <CardBaseDash
          title="Animais Cadastrados"
          value={stats.totalAnimais}
          subtitle={stats.novosAnimaisMes > 0 ? `+${stats.novosAnimaisMes} em ${getMesAtual()}` : 'Total no sistema'}
          icon={Dog}
          color="green"
        />

        <CardBaseDash
          title="Total de Cirurgias"
          value={stats.totalCirurgiasAno}
          subtitle={`Acumulado em ${new Date().getFullYear()}`}
          icon={Stethoscope}
          color="purple"
        />

        <CardBaseDash
          title="Base de Tutores"
          value={stats.totalTutores}
          subtitle="Responsáveis cadastrados"
          icon={Users}
          color="blue"
        />

        <CardBaseDash
          title="Taxa de Realização"
          value={stats.cirurgiasMes > 0 ? Math.round((stats.cirurgiasConcluidasMes / stats.cirurgiasMes) * 100) : 0}
          subtitle="Cirurgias concluídas no mês"
          icon={Activity}
          color="green"
          trend={stats.cirurgiasMes > 0 ? `${stats.cirurgiasConcluidasMes}/${stats.cirurgiasMes}` : '0/0'}
        />
      </section>

      {/* Seção do Gráfico com estilo unificado */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Produtividade da Equipe</h3>
          <p className="text-sm text-gray-500">Comparativo de consultas e procedimentos por profissional.</p>
        </div>
        
        {/* Altura fixa para o gráfico renderizar corretamente */}
        <div className="w-full h-[350px]">
          <CargaTrabalhoChart data={chartData} />
        </div>
      </section>  
    </div>
  );
}