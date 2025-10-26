export default function AgendamentoCard() {
  return (
   
    <div className="border border-green-700/30 rounded-xl p-4 bg-white shadow-sm">
      
     
      <div className="flex justify-between items-start">
        
        {/* BLOCO DE HORÁRIO E DETALHES DO AGENDAMENTO*/}
        <div className="flex items-start space-x-4">
          
          {/* Bloco de Horário */}
          <div className="flex flex-col items-center justify-center h-16 w-12 rounded-lg p-1 text-xs text-white
                        bg-gradient-to-b from-blue-300 to-green-300">
            {/* O horário do agendamento */}
            <span className="font-semibold text-sm">09:00</span>
          </div>

          {/* Detalhes do Agendamento */}
          <div className="pt-1">
            <p className="text-gray-900 font-semibold text-lg"> Luna </p>
            <p className="text-gray-700 text-sm mt-0.5"> Cirurgia - Felino </p>
            <p className="text-gray-500 text-xs mt-1"> Castração eletiva - Preparação pré-operatória completa </p>
          </div>
        </div>

        {/* Lado Direito: Onde os botões vão ficar */}
        <div>
          {/* <button>Ver Prontuário</button> */}
          {/* <button>Preencher Ficha</button> */}
        </div>

      </div>
    </div>
  );
}