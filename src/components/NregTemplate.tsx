import React, { useState, useEffect, useRef } from "react";
import { AtendimentoCase } from "../types";
import { motion } from "motion/react";
import { 
  Printer, 
  Search, 
  FileText, 
  Sparkles, 
  Save, 
  RotateCcw,
  Check,
  AlertCircle
} from "lucide-react";

interface NregTemplateProps {
  cases: AtendimentoCase[];
  conselheiroNome?: string;
  onBack?: () => void;
}

interface NregData {
  nreg: string;
  ncad: string;
  corpo: string;
  aberturaDia: string;
  aberturaMes: string;
  aberturaCidade: string;
}

export default function NregTemplate({ cases, conselheiroNome = "Conselho Tutelar" }: NregTemplateProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Estado para armazenar dados NREG editáveis
  const [nreg, setNreg] = useState("");
  const [ncad, setNcad] = useState("");
  const [corpo, setCorpo] = useState("");
  const [aberturaDia, setAberturaDia] = useState("");
  const [aberturaMes, setAberturaMes] = useState("");
  const [aberturaCidade, setAberturaCidade] = useState("Currais Novos-RN");
  
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  
  const textCorpoRef = useRef<HTMLTextAreaElement>(null);

  // Filtrar casos para listagem na lateral esquerda
  const filteredCases = cases.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.criancaNome.toLowerCase().includes(q) ||
      c.numeroRegistro.toLowerCase().includes(q) ||
      c.tipoOcorrencia.toLowerCase().includes(q)
    );
  });

  // Obter caso ativo
  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Auto-ajustar altura do textarea
  const autoResize = () => {
    if (textCorpoRef.current) {
      textCorpoRef.current.style.height = "auto";
      textCorpoRef.current.style.height = `${textCorpoRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (activeCase) {
      setSelectedCaseId(activeCase.id);
    }
  }, [cases]);

  // Carregar ou gerar dados do caso selecionado
  useEffect(() => {
    if (!activeCase) return;

    // Verificar se já existe registro salvo no localStorage
    const savedMapRaw = localStorage.getItem("conselho_tutelar_nreg_store");
    let savedMap: Record<string, NregData> = {};
    if (savedMapRaw) {
      try {
        savedMap = JSON.parse(savedMapRaw);
      } catch (e) {
        console.error("Erro ao ler banco de dados NREG", e);
      }
    }

    const caseId = activeCase.id;
    if (savedMap[caseId]) {
      // Carregar os dados existentes
      const data = savedMap[caseId];
      setNreg(data.nreg || "");
      setNcad(data.ncad || "");
      setCorpo(data.corpo || "");
      setAberturaDia(data.aberturaDia || "");
      setAberturaMes(data.aberturaMes || "");
      setAberturaCidade(data.aberturaCidade || "Currais Novos-RN");
    } else {
      // Gerar dados novos automáticos baseado no prontuário do conselheiro
      const serialPart = activeCase.numeroRegistro.split("-").pop() || "001";
      const yearPart = new Date(activeCase.dataHora).getFullYear() || new Date().getFullYear();
      
      setNreg(`${serialPart}/${yearPart}`);
      setNcad(`CAD-${serialPart}`);
      
      // Data de Abertura
      const dateObj = new Date(activeCase.dataHora);
      setAberturaDia(String(dateObj.getDate()));
      const mesesExtenso = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      setAberturaMes(`${mesesExtenso[dateObj.getMonth()]} de ${dateObj.getFullYear()}`);
      setAberturaCidade("Currais Novos-RN");

      // Gerar corpo do texto lindamente estruturado do NREG
      const formattedDate = new Date(activeCase.dataHora).toLocaleDateString("pt-BR");
      const formattedTime = new Date(activeCase.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      
      let relatoAutomatico = `Aos ${formattedDate} às ${formattedTime} horas, perante este Conselho Tutelar do Município de Currais Novos-RN, registrou-se o caso da criança/adolescente ${activeCase.criancaNome}, com idade de ${activeCase.criancaIdade} anos, nascido(a) em ${new Date(activeCase.criancaDataNascimento).toLocaleDateString("pt-BR")}, portador(a) de ${activeCase.criancaDocumento || "certidão de nascimento"}, residente em ${activeCase.criancaEndereco}.\n\n`;
      
      relatoAutomatico += `A situação foi levada a este Órgão por intermédio de denúncia referente a: ${activeCase.tipoOcorrencia}.\n\n`;
      
      relatoAutomatico += `FATOS CONSTATADOS:\n${activeCase.descricaoOcorrencia}\n\n`;
      
      if (activeCase.medidasCrianca.length > 0 || activeCase.medidasPais.length > 0 || activeCase.outrasProvidencias) {
        relatoAutomatico += `MEDIDAS E PROVIDÊNCIAS ADOTADAS PELO COLEGIADO:\n`;
        if (activeCase.medidasCrianca.length > 0) {
          relatoAutomatico += `- Medidas de Proteção Aplicadas à Criança/Adolescente:\n`;
          activeCase.medidasCrianca.forEach(m => {
            relatoAutomatico += `  * ${m}\n`;
          });
        }
        if (activeCase.medidasPais.length > 0) {
          relatoAutomatico += `- Medidas Aplicadas aos Pais ou Responsável:\n`;
          activeCase.medidasPais.forEach(m => {
            relatoAutomatico += `  * ${m}\n`;
          });
        }
        if (activeCase.outrasProvidencias) {
          relatoAutomatico += `- Outras Providências:\n  ${activeCase.outrasProvidencias}\n`;
        }
        relatoAutomatico += `\n`;
      }
      
      relatoAutomatico += `E, para constar, lavrou-se este Termo de Registro e Abertura de NREG, que serve como salvaguarda dos fatos apurados e providências adotadas pelo Conselho Tutelar para a proteção integral garantida pelo ECA.`;

      setCorpo(relatoAutomatico);
    }
  }, [selectedCaseId, activeCase]);

  // Re-ajustar altura do textarea sempre que o corpo carregar
  useEffect(() => {
    setTimeout(autoResize, 50);
  }, [corpo]);

  // Função para salvar no localStorage
  const handleSaveNreg = () => {
    if (!activeCase) return;
    
    const savedMapRaw = localStorage.getItem("conselho_tutelar_nreg_store");
    let savedMap: Record<string, NregData> = {};
    if (savedMapRaw) {
      try {
        savedMap = JSON.parse(savedMapRaw);
      } catch (e) {}
    }

    savedMap[activeCase.id] = {
      nreg,
      ncad,
      corpo,
      aberturaDia,
      aberturaMes,
      aberturaCidade
    };

    localStorage.setItem("conselho_tutelar_nreg_store", JSON.stringify(savedMap));
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  // Forçar recálculo/reset do NREG para o padrão do prontuário
  const handleResetToDefault = () => {
    if (!window.confirm("Deseja realmente redefinir o NREG para o texto gerado do prontuário? Quaisquer alterações feitas manualmente neste caso serão descartadas.")) return;
    
    const caseId = activeCase.id;
    const savedMapRaw = localStorage.getItem("conselho_tutelar_nreg_store");
    if (savedMapRaw) {
      try {
        const savedMap = JSON.parse(savedMapRaw);
        delete savedMap[caseId];
        localStorage.setItem("conselho_tutelar_nreg_store", JSON.stringify(savedMap));
      } catch (e) {}
    }
    
    // Força trigger do useEffect de carregamento
    setSelectedCaseId("");
    setTimeout(() => setSelectedCaseId(caseId), 10);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
      
      {/* HEADER DE CONTROLE (Ocultado na impressão) */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 shadow-xs print:hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Ficha Cadastral e Registro NREG</h1>
            <p className="text-[10px] text-slate-400 font-bold block mt-0.5">Sincronização automática com prontuários ativos</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {showSavedFeedback && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg"
            >
              <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
            </motion.div>
          )}

          <button
            onClick={handleResetToDefault}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            title="Recalcular texto original baseado no prontuário"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recalcular</span>
          </button>

          <button
            onClick={handleSaveNreg}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Modificações</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir NREG</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        
        {/* SELETOR LATERAL ESQUERDA (Ocultado na impressão) */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 print:hidden">
          
          {/* Caixa de Busca e Status de Integridade */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Vincular Prontuário</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar prontuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
              />
            </div>

            <div className="text-[10px] bg-blue-50/50 border border-blue-100 text-blue-700 p-2.5 rounded-xl flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-normal font-bold">
                Ao cadastrar um prontuário na aba principal, ele aparecerá aqui automaticamente.
              </p>
            </div>
          </div>

          {/* Lista de Casos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 max-h-[450px] lg:max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
            {filteredCases.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-bold space-y-1">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Nenhum prontuário encontrado.</p>
              </div>
            ) : (
              filteredCases.map(c => {
                const isSelected = c.id === selectedCaseId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 cursor-pointer border-l-4 ${
                      isSelected 
                        ? "bg-blue-50/70 border-blue-600" 
                        : "border-transparent hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="text-[9px] font-mono font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.numeroRegistro}
                      </span>
                      <span className="text-[8px] uppercase font-black text-slate-400">
                        {new Date(c.dataHora).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-800 truncate block">
                      {c.criancaNome}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {c.tipoOcorrencia}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Dados Auxiliares de Preenchimento Rápido */}
          {activeCase && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">Campos do Documento</h2>
              
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">NREG Número</label>
                  <input
                    type="text"
                    value={nreg}
                    onChange={(e) => setNreg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                    placeholder="Ex: 125/2026"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">NCAD Número</label>
                  <input
                    type="text"
                    value={ncad}
                    onChange={(e) => setNcad(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-bold"
                    placeholder="Ex: CAD-125"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Abertura Dia</label>
                    <input
                      type="text"
                      value={aberturaDia}
                      onChange={(e) => setAberturaDia(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mês de Abertura</label>
                    <input
                      type="text"
                      value={aberturaMes}
                      onChange={(e) => setAberturaMes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cidade / Estado</label>
                  <input
                    type="text"
                    value={aberturaCidade}
                    onChange={(e) => setAberturaCidade(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-bold"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* PRÉ-VISUALIZAÇÃO FISICA DO DOCUMENTO A4 */}
        <div className="flex-1 flex justify-center">
          
          {activeCase ? (
            <div 
              id="nreg-print-sheet"
              className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-[21cm] p-[2cm] font-serif text-black min-h-[29.7cm] flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none relative select-text"
            >
              
              {/* CORPO DO DOCUMENTO */}
              <div className="space-y-6">
                
                {/* Cabeçalho */}
                <div className="text-center space-y-1 pb-4 border-b-2 border-black text-black">
                  <h1 className="font-bold text-lg sm:text-2xl leading-tight uppercase font-serif tracking-tight text-black">
                    Conselho Tutelar da Criança e do Adolescente
                  </h1>
                  <p className="text-xs sm:text-sm font-bold uppercase font-serif text-black leading-snug">
                    Lei Federal 8.069 - Lei Municipal 1214
                  </p>
                  <p className="text-xs sm:text-sm font-medium font-serif text-black leading-snug">
                    {aberturaCidade}
                  </p>
                </div>

                {/* Campos Principais NREG / NCAD */}
                <div className="grid grid-cols-2 gap-4 py-3 text-sm sm:text-base font-serif text-black font-bold">
                  <div className="flex items-center gap-1">
                    <span>NREG:</span>
                    <input 
                      type="text"
                      value={nreg}
                      onChange={(e) => setNreg(e.target.value)}
                      className="border-b border-black font-serif font-bold text-black focus:outline-none focus:bg-yellow-50/50 flex-1 px-1 py-0.5 print:border-none print:p-0 print:bg-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>NCAD:</span>
                    <input 
                      type="text"
                      value={ncad}
                      onChange={(e) => setNcad(e.target.value)}
                      className="border-b border-black font-serif font-bold text-black focus:outline-none focus:bg-yellow-50/50 flex-1 px-1 py-0.5 print:border-none print:p-0 print:bg-transparent"
                    />
                  </div>
                </div>

                {/* Linha Divisória */}
                <div className="border-t border-black w-full my-2" />

                {/* Campo Editável com Linhas de Caderno Físico (Efeito Ruled Paper) */}
                <div className="relative py-2 select-text font-serif">
                  <textarea
                    ref={textCorpoRef}
                    value={corpo}
                    onChange={(e) => {
                      setCorpo(e.target.value);
                      autoResize();
                    }}
                    rows={18}
                    className="w-full font-serif text-xs sm:text-sm leading-[32px] text-justify text-black bg-transparent border border-transparent rounded p-2 outline-none resize-none transition print:border-none print:p-0 print:outline-none select-text focus:bg-slate-50/10 hover:border-slate-300"
                    style={{
                      backgroundImage: "linear-gradient(transparent, transparent 31px, rgba(0,0,0,0.2) 31px, rgba(0,0,0,0.2) 32px)",
                      backgroundSize: "100% 32px",
                      lineHeight: "32px",
                    }}
                    placeholder="Escreva ou edite o termo de registro completo..."
                    title="Conteúdo completo do prontuário formatado em linhas de caderno. Edite à vontade."
                  />
                </div>

              </div>

              {/* RODAPÉ DO DOCUMENTO (Assinatura e Abertura) */}
              <div className="space-y-8 pt-8 font-serif text-black text-xs sm:text-sm">
                
                {/* Data de Abertura do NREG */}
                <div className="space-y-2 font-serif text-black">
                  <div className="font-bold flex flex-wrap items-center gap-1 uppercase tracking-wide text-xs">
                    <span>Abertura do NREG:</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-1.5 leading-relaxed font-serif text-black">
                    <span>Aos</span>
                    <input 
                      type="text"
                      value={aberturaDia}
                      onChange={(e) => setAberturaDia(e.target.value)}
                      className="border-b border-black text-center font-bold font-serif w-12 focus:outline-none bg-slate-50/50 print:border-none print:bg-transparent"
                    />
                    <span>dias do Mês de</span>
                    <input 
                      type="text"
                      value={aberturaMes}
                      onChange={(e) => setAberturaMes(e.target.value)}
                      className="border-b border-black font-bold font-serif w-64 focus:outline-none bg-slate-50/50 print:border-none print:bg-transparent"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-1.5 leading-relaxed font-serif text-black">
                    <span>nesta cidade de</span>
                    <input 
                      type="text"
                      value={aberturaCidade}
                      onChange={(e) => setAberturaCidade(e.target.value)}
                      className="border-b border-black font-bold font-serif w-56 focus:outline-none bg-slate-50/50 print:border-none print:bg-transparent"
                    />
                  </div>
                </div>

                {/* Assinaturas em Branco para Assinar a Punho */}
                <div className="pt-4 flex flex-col items-center justify-end text-center font-serif text-black">
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800 mb-8 block">
                    Conselheiros Tutelares
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 w-full max-w-lg mx-auto">
                    <div className="flex flex-col items-center">
                      <div className="border-b border-black w-full h-8" />
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1.5">Conselheiro(a) Relator(a)</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="border-b border-black w-full h-8" />
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1.5">Conselheiro(a) Testemunha/Colegiado</span>
                    </div>
                  </div>
                </div>

                {/* Selo Digital de Autenticidade */}
                <div className="pt-2 border-t border-dashed border-slate-350 text-[10px] text-slate-400 font-sans flex items-center justify-between">
                  <span>Prontuário Administrativo • ECA Digital</span>
                  <span className="font-mono text-[8px] uppercase font-bold">Autenticação: NREG-{selectedCaseId.substring(5,11).toUpperCase() || "NEW"}</span>
                </div>

              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3 h-80 flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-slate-300 animate-pulse" />
              <p className="text-xs font-bold">Nenhum prontuário registrado para carregar o NREG.</p>
              <p className="text-[10px] text-slate-400">Por favor, registre um caso na aba "Prontuários" primeiro.</p>
            </div>
          )}

        </div>

      </div>

      {/* CSS específico de impressão para a página A4 de NREG */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background-color: white !important;
            color: black !important;
          }
          #nreg-print-sheet, #nreg-print-sheet * {
            visibility: visible;
          }
          #nreg-print-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          input, textarea {
            border-bottom: none !important;
            background: transparent !important;
            box-shadow: none !important;
            pointer-events: none !important;
          }
        }
      `}</style>

    </div>
  );
}
