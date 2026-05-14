"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LogIn, 
  Heart, 
  ShieldCheck, 
  Stethoscope, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Syringe, 
  Activity,
  PawPrint
} from 'lucide-react';

export default function LandingPage() {

  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselData = [
    {
      title: "Jejum Pré-Cirúrgico",
      desc: "É essencial que o animal faça jejum alimentar de 8 a 12 horas e hídrico de 4 horas antes do procedimento para garantir uma anestesia segura.",
      icon: Clock,
      bg: "bg-blue-50",
      text: "text-blue-700"
    },
    {
      title: "Medicação Rigorosa",
      desc: "Siga estritamente a prescrição médica para antibióticos e anti-inflamatórios no pós-operatório. Nunca medique por conta própria.",
      icon: Syringe,
      bg: "bg-purple-50",
      text: "text-purple-700"
    },
    {
      title: "Repouso Absoluto",
      desc: "Mantenha o animal em local limpo, tranquilo e restrito. Evite corridas, pulos ou brincadeiras bruscas até a retirada dos pontos.",
      icon: Activity,
      bg: "bg-green-50",
      text: "text-green-700"
    },
    {
      title: "Uso do Colar Elizabetano",
      desc: "O uso do colar ou roupa cirúrgica é obrigatório para impedir que o animal lamba ou arranque os pontos, evitando infecções.",
      icon: ShieldCheck,
      bg: "bg-orange-50",
      text: "text-orange-700"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  // Autoplay do carrossel
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (

<div className="h-screen w-full overflow-y-auto bg-white font-sans text-gray-900 selection:bg-green-100 scroll-smooth">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-24 md:h-20 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          
          <div className="flex items-center gap-4 md:gap-6">
           
            <div className="relative h-16 w-16 rounded-full border-2 border-green-50 p-1 bg-white shadow-sm shrink-0">
              <Image 
                src="/unipet.png" 
                alt="Logo UniPet" 
                fill 
                className="object-contain p-1"
              />
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            {/* Logos Secundários */}
            <div className="flex items-center gap-3 md:gap-4">
               <div className="relative h-10 w-20 md:h-12 md:w-24 opacity-90 hover:opacity-100 transition-opacity">
                  <Image src="/hospital.png" alt="UFRPE Hospital" fill className="object-contain" />
               </div>
               <div className="relative h-10 w-16 md:h-12 md:w-20 opacity-90 hover:opacity-100 transition-opacity">
                  <Image src="/semas.png" alt="Semas" fill className="object-contain" />
               </div>
            </div>
          </div>

          <Link 
            href="/login"
            className="group flex shrink-0 items-center gap-2 px-4 md:px-6 py-2.5 bg-green-700 text-white rounded-full font-bold text-sm hover:bg-green-800 transition-all shadow-lg shadow-green-200 active:scale-95 ml-4"
          >
            <span>Log in</span>
            <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>

        </div>
      </header>

      {/* --- HERO SECTION COM BACKGROUND E GRADIENTE INFERIOR --- */}
      <section className="relative pt-40 pb-32 md:pt-48 md:pb-48 overflow-hidden">
        
        {/* 1. Imagem de Fundo (LP.jpg) - Cobrindo toda a área */}
        <div className="absolute inset-0 z-0">
            <Image 
                src="/LP.jpg" 
                alt="Fundo Veterinária" 
                fill 
                className="object-cover object-center"
                priority
            />
        </div>

        {/* 2. Camada de Gradiente (Apenas na parte inferior) 
            bg-gradient-to-t: Gradiente de baixo para cima.
            Começa branco sólido embaixo e vai ficando transparente para cima.
        */}
        <div className="absolute inset-0 z-10 bg-linear-to-t from-transparent via-transparent/30 to-full-white"></div>

        {/* 3. Conteúdo de Texto (Alinhado à Esquerda) */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 h-full">
          <div className="max-w-2xl py-8 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
            
            {/* Badge aligned left */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-green-800 text-sm font-bold uppercase tracking-wide border border-green-200 shadow-sm">
              <PawPrint size={16} /> Uma parceria entre o Hospital Veterinário da UFRPE e a SEMAS
            </div>
            
            {/* Title aligned left */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight drop-shadow-sm">
              Gestão Eficiente para<br className="hidden md:block"/> <span className="text-green-700 px-2 rounded-lg box-decoration-clone">o Bem-Estar do Seu Animal</span>
            </h1>
            
            {/* Paragraph aligned left */}
            <p className="text-xl text-gray-800 leading-relaxed font-medium bg-white/60 p-4 rounded-2xl backdrop-blur-sm lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
              Sistema integrado para agendamento, triagem e acompanhamento de castrações. 
              Promovendo cuidado animal com tecnologia e responsabilidade.
            </p>
            
            {/* Buttons aligned left */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/login"
                className="px-8 py-4 rounded-full bg-green-700 text-white font-bold text-lg hover:bg-green-800 transition-all shadow-xl shadow-green-200/50 active:scale-95 hover:-translate-y-1"
              >
                Agendar Agora
              </Link>
              <button 
                onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 rounded-full bg-white/90 backdrop-blur-md border-2 border-green-100 text-green-800 font-bold text-lg hover:bg-green-50 transition-all active:scale-95 hover:-translate-y-1"
              >
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- SESSÃO NOSSA MISSÃO (Margem negativa para subir sobre o gradiente) --- */}
      <section id="mission" className="py-20 bg-white relative z-20 -mt-20 md:-mt-32"> 
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-green-900 rounded-3xl p-8 md:p-16 text-white relative overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Nossa Missão</h2>
                <p className="text-green-100 text-lg leading-relaxed mb-6">
                  Nosso objetivo é promover o controle ético e sustentável da população de cães e gatos através da esterilização cirúrgica no estado de Pernambuco. 
                  Acreditamos que a castração é um ato de amor e responsabilidade social, prevenindo o abandono e doenças.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-700 rounded-full"><Heart size={16} /></div>
                    <span>Redução do abandono</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-700 rounded-full"><ShieldCheck size={16} /></div>
                    <span>Prevenção de zoonoses</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-700 rounded-full"><Stethoscope size={16} /></div>
                    <span>Atendimento veterinário de qualidade</span>
                  </li>
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                  <span className="block text-4xl font-bold mb-1">+2K</span>
                  <span className="text-sm text-green-200">Animais Castrados</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 mt-8 hover:bg-white/20 transition-colors">
                  <span className="block text-4xl font-bold mb-1">100%</span>
                  <span className="text-sm text-green-200">Gratuito</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                  <span className="block text-4xl font-bold mb-1">24h</span>
                  <span className="text-sm text-green-200">Suporte Online</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 mt-8 hover:bg-white/20 transition-colors">
                  <span className="block text-3xl font-bold mb-1">A Melhor</span>
                  <span className="text-sm text-green-200">Equipe de PE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SESSÃO NOSSO SERVIÇO --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nossos Serviços</h2>
            <p className="text-gray-500">
              Oferecemos um ciclo completo de atendimento para garantir a segurança e o bem-estar do seu animal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Triagem Clínica</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Avaliação completa do estado de saúde do animal, incluindo exames físicos e laboratoriais para garantir a aptidão cirúrgica.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                <Syringe size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cirurgia de Castração</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Procedimento realizado por cirurgiões experientes, utilizando técnicas minimamente invasivas e protocolos anestésicos seguros.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Acompanhamento</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Suporte pós-operatório completo, com orientações, retirada de pontos e monitoramento da recuperação do paciente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CARROSSEL CUIDADOS --- */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Cuidados Essenciais</h2>
              <p className="text-gray-500">
                Informações importantes para garantir o sucesso do procedimento e a rápida recuperação do seu pet.
              </p>
            </div>
            
            {/* Controles */}
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="p-3 rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextSlide}
                className="p-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors active:scale-95"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carouselData.map((item, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2 md:px-4">
                  <div className={`h-full p-8 md:p-12 rounded-3xl ${item.bg} border-2 border-transparent hover:border-black/5 transition-all`}>
                    <div className={`w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center ${item.text} mb-6`}>
                      <item.icon size={32} />
                    </div>
                    <h3 className={`text-2xl font-bold ${item.text} mb-4`}>{item.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-8">
            {carouselData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-gray-900' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            
            {/* Coluna 1: Logo e Sobre */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative h-14 w-14 bg-white rounded-full p-1 border border-gray-700">
                  <Image src="/unipet.png" alt="UniPet" fill className="object-contain p-1"/>
                </div>
                <span className="font-bold text-xl tracking-tight">Sistema Castração</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Uma iniciativa conjunta para promover o bem-estar animal e a saúde pública através de serviços de castração acessíveis e de qualidade.
              </p>
            </div>

            {/* Coluna 2: Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Acesso Rápido</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-green-400 transition-colors">Área do Tutor</Link></li>
                <li><Link href="/login" className="hover:text-green-400 transition-colors">Área Administrativa</Link></li>
                <li><Link href="/login" className="hover:text-green-400 transition-colors">Portal do Médico</Link></li>
              </ul>
            </div>

            {/* Coluna 3: Parceiros */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Parceiros</h4>
              <div className="flex gap-4">
                <div className="bg-white p-2 rounded-lg h-14 w-28 relative opacity-80 hover:opacity-100 transition-opacity">
                   <Image src="/hospital.png" alt="UFRPE" fill className="object-contain p-1" />
                </div>
                <div className="bg-white p-2 rounded-lg h-14 w-28 relative opacity-80 hover:opacity-100 transition-opacity">
                   <Image src="/semas.png" alt="Semas" fill className="object-contain p-1" />
                </div>
                <div className="bg-white p-2 rounded-lg h-14 w-28 relative opacity-80 hover:opacity-100 transition-opacity">
                   <Image src="/ufrpe.png" alt="UFRPE" fill className="object-contain p-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>&copy; 2025 Mymba Softwares. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}