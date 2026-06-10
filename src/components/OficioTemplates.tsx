import React, { useState, useEffect } from "react";
import { AtendimentoCase, FollowUpLog } from "../types";
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  CheckCircle, 
  FileText, 
  ChevronDown, 
  Search,
  Check
} from "lucide-react";

interface OficioTemplatesProps {
  initialCase?: AtendimentoCase | null;
  cases: AtendimentoCase[];
  onBack: () => void;
  onAddHistoryLog?: (caseId: string, log: Omit<FollowUpLog, "id">) => void;
  conselheiroNome?: string;
}

export default function OficioTemplates({
  initialCase = null,
  cases = [],
  onBack,
  onAddHistoryLog,
  conselheiroNome = ""
}: OficioTemplatesProps) {
  // Caso Selecionado Ativo
  const [activeCase, setActiveCase] = useState<AtendimentoCase | null>(initialCase);
  const [selectedTemplate, setSelectedTemplate] = useState<"notificacao" | "termo">("notificacao");

  // Campos - Notificação
  const [notifNumero, setNotifNumero] = useState(`28/${new Date().getFullYear()}`);
  const [notifNotificado, setNotifNotificado] = useState("");
  const [notifRua, setNotifRua] = useState("");
  const [notifBairro, setNotifBairro] = useState("");
  const [notifDataComp, setNotifDataComp] = useState("07 de abril");
  const [notifHoraComp, setNotifHoraComp] = useState("15:00");
  const [notifTurnoComp, setNotifTurnoComp] = useState("manhã");
  const [notifDocData, setNotifDocData] = useState(
    new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
  );
  const [notifCorpoAdicional, setNotifCorpoAdicional] = useState("");

  // Campos - Termo de Declaração
  const [termoDeclarante, setTermoDeclarante] = useState("");
  const [termoIdentificacao, setTermoIdentificacao] = useState("");
  const [termoDocData, setTermoDocData] = useState(
    new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
  );
  const [termoCorpo, setTermoCorpo] = useState("");
  const [termoConselheiro, setTermoConselheiro] = useState("Conselheiro Tutelar");

  const [copiedTexto, setCopiedTexto] = useState(false);

  // Efeito para preencher campos quando muda o Caso selecionado
  useEffect(() => {
    if (activeCase) {
      setNotifNotificado(activeCase.responsavelPrincipal.nome || "");
      setNotifRua(activeCase.criancaEndereco || "");
      setNotifBairro("");
      
      setTermoDeclarante(activeCase.responsavelPrincipal.nome || "");
      setTermoIdentificacao(
        `Nacionalidade brasileira, portador(a) do telefone ${activeCase.responsavelPrincipal.telefone || "não informado"}, na qualidade de ${activeCase.responsavelPrincipal.parentesco} do(a) menor ${activeCase.criancaNome}.`
      );
      setTermoCorpo(
        `O(A) declarante acima qualificado(a) comparece perante este Colegiado do Conselho Tutelar de Currais Novos/RN de livre e espontânea vontade, prestando depoimento oficial sobre o caso registrado no Prontuário Digital sob nº ${activeCase.numeroRegistro}. Declares que: `
      );
      setTermoConselheiro(conselheiroNome || activeCase.conselheiroResponsavel || "Conselheiro Tutelar");
    } else {
      // Limpar campos ou preencher com placeholders gerais
      setNotifNotificado("");
      setNotifRua("");
      setNotifBairro("");
      
      setTermoDeclarante("");
      setTermoIdentificacao("Nacionalidade brasileira, portador(a) do telefone [telefone], na qualidade de [parentesco] do(a) menor [Criança].");
      setTermoCorpo("O(A) declarante acima qualificado(a) comparece perante este Colegiado do Conselho Tutelar de Currais Novos/RN de livre e espontânea vontade, prestando depoimento oficial. Declara que: ");
      setTermoConselheiro(conselheiroNome || "Conselheiro Tutelar");
    }
  }, [activeCase, conselheiroNome]);

  const handleCopyText = (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        setCopiedTexto(true);
        setTimeout(() => setCopiedTexto(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedTexto(true);
        setTimeout(() => setCopiedTexto(false), 2000);
      }
    } catch (err) {
      console.error("Erro ao copiar texto: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-6 print:bg-white print:p-0 print:m-0 print:text-black font-sans">
      
      {/* Barra de Ações (Ocultada na Impressão) */}
      <div className="max-w-5xl mx-auto mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-705 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          
          <div className="hidden sm:block h-5 w-px bg-slate-200" />
          
          {/* Caixa de Seleção rápida de Caso */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 shrink-0">Caso:</span>
            <select
              value={activeCase?.id || ""}
              onChange={(e) => {
                const id = e.target.value;
                const found = cases.find(c => c.id === id);
                setActiveCase(found || null);
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-lg text-xs font-extrabold text-slate-700 outline-none transition cursor-pointer appearance-none pr-8 relative"
            >
              <option value="">📝 -- Documento em Branco --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  📁 {c.numeroRegistro} - {c.criancaNome.slice(0, 20)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selecionador de Template (Abas) */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setSelectedTemplate("notificacao")}
            className={`px-3 py-1.5 rounded-md transition duration-155 cursor-pointer ${
              selectedTemplate === "notificacao" 
                ? "bg-blue-600 text-white shadow-xs font-extrabold" 
                : "hover:text-slate-800 text-slate-500"
            }`}
          >
            📋 Notificação Oficial
          </button>
          <button
            type="button"
            onClick={() => setSelectedTemplate("termo")}
            className={`px-3 py-1.5 rounded-md transition duration-155 cursor-pointer ${
              selectedTemplate === "termo" 
                ? "bg-blue-600 text-white shadow-xs font-extrabold" 
                : "hover:text-slate-800 text-slate-500"
            }`}
          >
            📝 Termo de Declaração
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              const text = selectedTemplate === "notificacao" 
                ? `CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE\nLEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL Nº 1214/91\nCURRAIS NOVOS – RN\n\nNOTIFICAÇÃO Nº ${notifNumero}\n\nNotifica-se (a)Sra. ${notifNotificado}\nRua: ${notifRua}\nBairro: ${notifBairro}\n\nSolicito o comparecimento de Vossa Senhoria a este Conselho Tutelar localizado a Rua Juventino da Silveira, 155, centro, na data do Dia ${notifDataComp} as ${notifHoraComp}hs da ${notifTurnoComp}, e de suma importância sua vinda a este órgão.\n\nCumpre informar a Vossa Senhoria também que, o não atendimento injustificado da Requisição, poderá ensejar representação à Autoridade Judiciária ou ao Ministério Público, conforme prevê o Art. 136, inciso III, “b” e inciso IV da Lei Federal supracitada.\n\nCurrais Novos, ${notifDocData}.\n\n_______________________\nAssinatura do Recebedor`
                : `CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE\nLEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL Nº 1214/91\nCURRAIS NOVOS – RN\n\nTermo de declaração\n\nDeclarante: ${termoDeclarante}\nQualificação: ${termoIdentificacao}\n\nDeclaração:\n"${termoCorpo}"\n\nCurrais Novos/RN, ${termoDocData}.\n\n_______________________\nDeclarante\n\n_______________________\nConselheiro Tutelar: ${termoConselheiro}`;
              
              handleCopyText(text);
              alert("O rascunho do documento foi copiado para sua área de transferência!");
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 border border-slate-200 transition font-sans cursor-pointer"
          >
            {copiedTexto ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTexto ? "Copiado!" : "Copiar Texto"}</span>
          </button>

          {activeCase && onAddHistoryLog && (
            <button
              type="button"
              onClick={() => {
                if (selectedTemplate === "notificacao") {
                  const logPayload = {
                    data: new Date().toISOString(),
                    descricao: `📋 NOTIFICAÇÃO Nº ${notifNumero} EMITIDA para ${notifNotificado}.\nComparecimento agendado para Dia ${notifDataComp} às ${notifHoraComp}hs (turno da ${notifTurnoComp}).\nEndereço: Rua ${notifRua}, Bairro ${notifBairro}.\nEmissão de documento impresso formalizada no prontuário.`,
                    conselheiro: conselheiroNome || activeCase.conselheiroResponsavel || "Conselheiro Atendente"
                  };
                  onAddHistoryLog(activeCase.id, logPayload);
                } else {
                  const logPayload = {
                    data: new Date().toISOString(),
                    descricao: `📝 TERMO DE DECLARAÇÃO tomado de ${termoDeclarante}.\nIdentificação: ${termoIdentificacao}.\nDepoimento Oficial tomado: "${termoCorpo}"\nAssinado fisicamente e arquivado digitalmente.`,
                    conselheiro: termoConselheiro || activeCase.conselheiroResponsavel || "Conselheiro Atendente"
                  };
                  onAddHistoryLog(activeCase.id, logPayload);
                }
                alert("Sucesso! Este instrumento oficial foi registrado permanentemente no histórico de acompanhamento do Prontuário.");
              }}
              className="px-3.5 py-1.5 bg-emerald-605 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" /> 
              <span>Inserir no Histórico</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> 
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Grid Layout Duas Colunas */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Coluna Esquerda: Edição dos Campos (Ocultada na Impressão) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4 print:hidden">
          <div className="border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest block font-sans">Campos do Documento</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 font-sans">Preencha os campos para alterar o papel em tempo real</span>
          </div>

          {selectedTemplate === "notificacao" ? (
            <div className="space-y-3.5 text-xs font-sans">
              {/* Número Notificação */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Número da Notificação</label>
                <input
                  type="text"
                  value={notifNumero}
                  onChange={(e) => setNotifNumero(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 font-bold text-slate-800 font-sans"
                />
              </div>

              {/* Notificado */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Notifica-se (a)Sra./Sr.</label>
                <input
                  type="text"
                  value={notifNotificado}
                  onChange={(e) => setNotifNotificado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 font-sans"
                  placeholder="Nome do Notificado"
                />
              </div>

              {/* Rua */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Rua / Logradouro</label>
                <input
                  type="text"
                  value={notifRua}
                  onChange={(e) => setNotifRua(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 font-sans"
                  placeholder="Endereço"
                />
              </div>

              {/* Bairro */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Bairro de Residência</label>
                <input
                  type="text"
                  value={notifBairro}
                  onChange={(e) => setNotifBairro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100 font-sans"
                  placeholder="Bairro"
                />
              </div>

              {/* Data Comparecimento */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Dia Comparecimento</label>
                  <input
                    type="text"
                    value={notifDataComp}
                    onChange={(e) => setNotifDataComp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-sans"
                    placeholder="Ex: 07 de abril"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block">Horário</label>
                  <input
                    type="text"
                    value={notifHoraComp}
                    onChange={(e) => setNotifHoraComp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-sans"
                    placeholder="Ex: 15:00"
                  />
                </div>
              </div>

              {/* Turno */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Período / Turno</label>
                <select
                  value={notifTurnoComp}
                  onChange={(e) => setNotifTurnoComp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer focus:outline-none font-sans"
                >
                  <option value="manhã">Manhã</option>
                  <option value="tarde">Tarde</option>
                </select>
              </div>

              {/* Data Emissão */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Data de Emissão (Ofício)</label>
                <input
                  type="text"
                  value={notifDocData}
                  onChange={(e) => setNotifDocData(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 font-sans"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-xs font-sans">
              {/* Declarante */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Nome do Declarante</label>
                <input
                  type="text"
                  value={termoDeclarante}
                  onChange={(e) => setTermoDeclarante(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-bold text-slate-800 font-sans"
                  placeholder="Nome completo do declarante"
                />
              </div>

              {/* Qualificação */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Qualificação Nacional / Vínculos</label>
                <textarea
                  rows={4}
                  value={termoIdentificacao}
                  onChange={(e) => setTermoIdentificacao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-sans text-xs leading-normal"
                />
              </div>

              {/* Data Emissão */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Data do Termo</label>
                <input
                  type="text"
                  value={termoDocData}
                  onChange={(e) => setTermoDocData(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-sans"
                />
              </div>

              {/* Conselheiro */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Conselheiro Tutelar Subscritor</label>
                <input
                  type="text"
                  value={termoConselheiro}
                  onChange={(e) => setTermoConselheiro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-sans"
                />
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-400 leading-normal font-sans">
            <span>⚠️</span>
            <span><strong>Dica de Impressão:</strong> Marque "Sem margens" ou desmarque "Cabeçalhos e rodapés" no menu de impressão do navegador Chrome/Edge para perfeito alinhamento de papel timbrado oficial.</span>
          </div>
        </div>

        {/* Coluna Direita: Visualização em Papel Timbrado Real */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-300 shadow-xl p-8 sm:p-14 font-serif text-slate-900 leading-relaxed max-w-[21cm] min-h-[29.7cm] mx-auto print:border-none print:shadow-none print:m-0 print:p-0 print:w-full select-text">
          
          {selectedTemplate === "notificacao" ? (
            /* TEMPLATE DE NOTIFICAÇÃO OFICIAL */
            <div className="space-y-7">
              
              {/* Cabeçalho Oficial */}
              <div className="text-center space-y-1 pb-4 border-b border-black text-black">
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase leading-tight font-serif text-black">
                  CONSELHO TUTELAR DOS DIREITOS
                </h2>
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase leading-tight font-serif text-black">
                  DA CRIANÇA E DO ADOLESCENTE
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold mt-1 leading-snug font-serif text-black">
                  LEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL Nº 1214/91
                </p>
                <p className="text-[11px] sm:text-xs font-extrabold tracking-normal leading-none uppercase font-serif text-black">
                  CURRAIS NOVOS – RN
                </p>
              </div>

              {/* Título Notificação */}
              <div className="text-center py-1 flex items-center justify-center gap-1">
                <span className="font-bold text-base sm:text-lg uppercase tracking-wider font-serif text-black shrink-0">
                  NOTIFICAÇÃO Nº
                </span>
                <input
                  type="text"
                  value={notifNumero}
                  onChange={(e) => setNotifNumero(e.target.value)}
                  className="font-bold text-base sm:text-lg uppercase tracking-wider font-serif text-black bg-transparent border-b border-dashed border-slate-300 hover:border-blue-500 focus:border-blue-600 focus:outline-none w-32 px-1 text-center transition print:border-none print:w-auto print:p-0"
                  title="Clique para editar o número da notificação"
                />
              </div>

              {/* Informações de Endereço */}
              <div className="space-y-3 text-xs sm:text-sm font-serif text-left pt-2 text-black">
                <div className="flex gap-1.5 items-baseline font-serif text-black">
                  <strong className="font-serif font-bold text-black shrink-0">Notifica-se (a)Sra.</strong>
                  <span className="border-b border-black/40 font-serif font-semibold flex-grow px-1 text-black bg-slate-50/20">
                    {notifNotificado || "______________________________________________________"}
                  </span>
                </div>
                <div className="flex gap-1.5 items-baseline font-serif text-black">
                  <strong className="font-serif font-bold text-black shrink-0">Rua:</strong>
                  <span className="border-b border-black/40 font-serif flex-grow px-1 text-black bg-slate-50/20">
                    {notifRua || "______________________________________________________"}
                  </span>
                </div>
                <div className="flex gap-1.5 items-baseline font-serif text-black">
                  <strong className="font-serif font-bold text-black shrink-0">Bairro:</strong>
                  <span className="border-b border-black/40 font-serif flex-grow px-1 text-black bg-slate-50/20">
                    {notifBairro || "______________________________________________________"}
                  </span>
                </div>
              </div>

              {/* Corpo da Notificação */}
              <div className="text-xs sm:text-sm leading-relaxed text-justify space-y-4 pt-4 text-black font-serif">
                <p className="font-serif leading-relaxed text-black/90 text-justify">
                  Solicito o comparecimento de Vossa Senhoria a este Conselho Tutelar localizado a Rua Juventino da Silveira, 155, centro, na data do Dia{" "}
                  <strong className="border-b border-black/50 px-1 font-serif text-black">{notifDataComp}</strong> as{" "}
                  <strong className="border-b border-black/50 px-1 font-serif text-black">{notifHoraComp}hs</strong> da{" "}
                  <strong className="border-b border-black/50 px-1 font-serif text-black">{notifTurnoComp}</strong>, sendo de suma importância sua vinda a este órgão.
                </p>

                {/* Área de Nota Adicional na edição */}
                <div className="print:hidden bg-blue-50/40 p-3 rounded-lg border border-blue-100/70 space-y-1.5 my-3 font-sans">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block font-sans">⚠️ Observação Adicional Opcional (Edite Livremente)</span>
                  <textarea
                    rows={2}
                    value={notifCorpoAdicional}
                    onChange={(e) => setNotifCorpoAdicional(e.target.value)}
                    placeholder="Ex: Trazer Documentos Pessoais, RG e CPF da criança, Cartão de Vacina, etc."
                    className="w-full text-xs font-serif bg-white p-2 border border-slate-250 rounded focus:outline-none"
                  />
                </div>

                {notifCorpoAdicional && (
                  <div className="bg-slate-50 p-3 border-l-3 border-black text-xs sm:text-sm my-2 text-justify italic font-serif text-black">
                    <strong>Observações Especiais para Atendimento:</strong> {notifCorpoAdicional}
                  </div>
                )}

                <p className="font-serif leading-relaxed font-bold text-black text-justify">
                  Cumpre informar a Vossa Senhoria também que, o não atendimento injustificado da Requisição, poderá ensejar representação à Autoridade Judiciária ou ao Ministério Público, conforme prevê o Art. 136, inciso III, “b” e inciso IV da Lei Federal supracitada.
                </p>
              </div>

              {/* Data e Assinaturas */}
              <div className="pt-10 space-y-10 text-xs sm:text-sm font-serif text-black">
                <div className="flex justify-between items-baseline gap-4 font-serif text-black">
                  <div className="flex gap-1.5 items-baseline font-serif text-black">
                    <span className="font-serif font-bold text-black">Recebido em:</span>
                    <span className="border-b border-black w-36 inline-block text-center font-serif text-black">______/______/2026</span>
                  </div>
                </div>

                <div className="font-serif">
                  <div className="w-64 border-b border-black mb-1 font-serif text-black" />
                  <span className="font-serif text-xs text-slate-500">Assinatura do Recebedor Notificado</span>
                </div>

                <div className="text-right pt-4 font-serif text-black text-sm">
                  <span className="font-serif font-bold text-black">Currais Novos, {notifDocData}.</span>
                </div>
              </div>

            </div>
          ) : (
            /* TEMPLATE DE TERMO DE DECLARAÇÃO */
            <div className="space-y-6">
              
              {/* Cabeçalho */}
              <div className="text-center space-y-1 pb-4 border-b border-black font-serif text-black">
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase leading-tight font-serif text-black">
                  CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold mt-1 leading-snug font-serif text-black">
                  LEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL Nº 1214/91
                </p>
                <p className="text-[11px] sm:text-xs font-extrabold tracking-normal leading-none uppercase font-serif text-black">
                  CURRAIS NOVOS – RN
                </p>
              </div>

              {/* Título */}
              <div className="text-center py-1 mt-2">
                <h3 className="font-extrabold text-base sm:text-lg uppercase underline tracking-wider font-serif text-black">
                  Termo de declaração
                </h3>
              </div>

              {/* Corpo e Qualificação */}
              <div className="space-y-4 pt-3 text-xs sm:text-sm leading-relaxed text-justify font-serif text-black">
                <p className="font-serif text-black">
                  Aos <strong className="font-serif text-black">{new Date().toLocaleDateString('pt-BR')}</strong>, neste município de Currais Novos/RN, perante o Colegiado de Membros do Conselho Tutelar, compareceu por livre provocação voluntária o(a) declarante qualificado(a) a seguir:
                </p>

                <div className="p-3.5 bg-slate-50/70 border border-slate-350 rounded-lg space-y-1.5 font-serif text-xs sm:text-sm leading-relaxed text-black">
                   <div><strong>Nome do Declarante:</strong> <span className="font-semibold text-black">{termoDeclarante || "___________________________________________"}</span></div>
                   <div><strong>Qualificação de Vínculo:</strong> <span className="text-black">{termoIdentificacao || "__________________________________________________________________________________________________"}</span></div>
                </div>

                {/* Depoimento Completo */}
                <div className="space-y-1.5 pt-2 font-serif text-black">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block print:hidden font-sans">
                    Depoimento Oficial (Clique em qualquer parte do texto abaixo para editar livremente):
                  </span>
                  <textarea
                    rows={14}
                    value={termoCorpo}
                    onChange={(e) => setTermoCorpo(e.target.value)}
                    className="w-full text-xs sm:text-sm font-serif border border-transparent hover:border-slate-300 focus:border-blue-500 rounded p-2 leading-relaxed bg-transparent resize-y print:hover:border-transparent print:border-none print:p-0 print:outline-none print:resize-none text-justify text-black"
                  />
                </div>
              </div>

              {/* Assinaturas */}
              <div className="pt-8 space-y-12 text-xs sm:text-sm font-serif text-black">
                <div className="font-serif text-black">
                  <span className="font-serif font-bold text-black">Currais Novos/RN, {termoDocData}</span>
                </div>

                <div className="grid grid-cols-2 gap-10 pt-4 font-serif text-black">
                  <div className="font-serif text-black">
                    <div className="border-b border-black w-full mb-1 text-black" />
                    <span className="font-serif text-[11px] block text-center text-slate-400 uppercase leading-normal">Declarante</span>
                  </div>
                  <div className="font-serif text-black">
                    <div className="border-b border-black w-full mb-1 text-center font-bold text-black">{termoConselheiro}</div>
                    <span className="font-serif text-[11px] block text-center text-slate-400 uppercase leading-normal">Conselheiro Tutelar</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
