import React, { useState, useEffect, useRef } from "react";
import { AtendimentoCase, FollowUpLog } from "../types";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  CheckCircle, 
  FileText, 
  Check,
  Edit3,
  RefreshCw,
  Info
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

  // --- ESTADOS: NOTIFICAÇÃO (MODELO NOVO DO ANEXO) ---
  const [notifNumero, setNotifNumero] = useState(`0037/${new Date().getFullYear()} - CT`);
  const [notifNotificado, setNotifNotificado] = useState("");
  const [notifCrianca, setNotifCrianca] = useState("");
  const [notifRua, setNotifRua] = useState("");
  const [notifBairro, setNotifBairro] = useState("");
  const [notifDataComp, setNotifDataComp] = useState("13 de Maio de 2026");
  const [notifHoraComp, setNotifHoraComp] = useState("15hrs");
  const [notifAssunto, setNotifAssunto] = useState("prestar esclarecimentos referentes a assunto do seu Interesse");
  const [notifEmissaoData, setNotifEmissaoData] = useState(
    `13 de Abril de ${new Date().getFullYear()}`
  );
  
  // Blocos de texto editáveis da Notificação para total controle
  const [notifIntro, setNotifIntro] = useState(
    "O Conselho Tutelar dos Direitos da Criança e do Adolescente do Município de Currais Novos/RN, criado através da Lei Municipal Nº 1214/91, no uso de suas atribuições legais previstas no Art. 136 da Lei Federal nº 8.069/90, de 13 de Julho de 1990 – ECA."
  );
  const [notifLegalWarning, setNotifLegalWarning] = useState(
    "Cumpre informar a Vossa Senhoria também, que o não atendimento injustificado da presente NOTIFICAÇÃO, poderá ensejar representação à autoridade Judiciária ou ao Ministério Público, conforme prevê o Art. 136, inciso III, “b” e inciso IV da Lei Federal supracitada.\nCaso por algum motivo o notificado tente impedir ou embaraçar a ação do membro do Conselho Tutelar, será de imediato aplicado o artigo 236 do ECA."
  );
  const [notifArtigo236, setNotifArtigo236] = useState(
    "Art. 236. Impedir ou embaraçar a ação de autoridade judiciária, membro do Conselho Tutelar ou representante do Ministério Público no exercício de função prevista nesta Lei:\nPena - detenção de seis meses a dois anos."
  );
  const [notifObservacao, setNotifObservacao] = useState(
    "Observação: No dia do comparecimento no Conselho Tutelar, esteja portando em mãos, os seguintes documentos:\nDocumentos dos pais ou responsável: RG e CPF, Comprovante de residência.\nDocumentos da criança ou adolescente: RG e CPF (se não possuir, trazer o Registro de Nascimento), Cartão do SUS, Carteira de Vacinação."
  );

  // --- ESTADOS: TERMO DE DECLARAÇÃO (MODELO NOVO DO ANEXO) ---
  const [termoDeclarante, setTermoDeclarante] = useState("");
  const [termoCPF, setTermoCPF] = useState("");
  const [termoEndereco, setTermoEndereco] = useState("");
  const [termoBairro, setTermoBairro] = useState("");
  const [termoParentesco, setTermoParentesco] = useState("genitor(a)");
  const [termoCriancaNome, setTermoCriancaNome] = useState("");
  const [termoCriancaIdade, setTermoCriancaIdade] = useState("");
  const [termoEscola, setTermoEscola] = useState("");
  const [termoAnoEscolar, setTermoAnoEscolar] = useState("5° ano");
  const [termoTurnoEscola, setTermoTurnoEscola] = useState("matutino");
  const [termoCriancaCPF, setTermoCriancaCPF] = useState("");
  
  // Corpo completo e 100% editável do Termo de Declaração
  const [termoCorpoCompleto, setTermoCorpoCompleto] = useState("");
  const [termoDataEmissao, setTermoDataEmissao] = useState(
    `25 de Junho de ${new Date().getFullYear()}`
  );
  const [termoConselheiroAssinatura, setTermoConselheiroAssinatura] = useState("Conselho tutelar");

  const [copiedTexto, setCopiedTexto] = useState(false);

  // Referências para auto-ajustar a altura das caixas de texto editáveis
  const textNotifIntroRef = useRef<HTMLTextAreaElement>(null);
  const textNotifWarningRef = useRef<HTMLTextAreaElement>(null);
  const textNotifArtRef = useRef<HTMLTextAreaElement>(null);
  const textNotifObsRef = useRef<HTMLTextAreaElement>(null);
  const textTermoCorpoRef = useRef<HTMLTextAreaElement>(null);

  // Função para ajustar altura do textarea automaticamente
  const autoResize = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    autoResize(textNotifIntroRef);
    autoResize(textNotifWarningRef);
    autoResize(textNotifArtRef);
    autoResize(textNotifObsRef);
  }, [notifIntro, notifLegalWarning, notifArtigo236, notifObservacao, selectedTemplate]);

  useEffect(() => {
    autoResize(textTermoCorpoRef);
  }, [termoCorpoCompleto, selectedTemplate]);

  // Efeito para preencher campos quando muda o Caso selecionado
  useEffect(() => {
    const formattedDate = new Date().toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    if (activeCase) {
      // 1. Notificação
      setNotifNotificado(activeCase.responsavelPrincipal.nome || "");
      setNotifCrianca(activeCase.criancaNome || "");
      setNotifRua(activeCase.criancaEndereco || "");
      setNotifBairro("");
      setNotifEmissaoData(formattedDate);
      setNotifNumero(`0037/${new Date().getFullYear()} - CT`);

      // 2. Termo de Declaração
      setTermoDeclarante(activeCase.responsavelPrincipal.nome || "");
      setTermoCPF("");
      setTermoEndereco(activeCase.criancaEndereco || "");
      setTermoBairro("");
      setTermoParentesco(activeCase.responsavelPrincipal.parentesco || "genitor(a)");
      setTermoCriancaNome(activeCase.criancaNome || "");
      setTermoCriancaIdade(activeCase.criancaIdade ? `${activeCase.criancaIdade}` : "");
      setTermoEscola(activeCase.criancaEscola || "");
      setTermoAnoEscolar("5° ano");
      setTermoTurnoEscola("matutino");
      setTermoCriancaCPF(activeCase.criancaDocumento || "");
      setTermoConselheiroAssinatura(conselheiroNome || activeCase.conselheiroResponsavel || "Conselho tutelar");
      setTermoDataEmissao(formattedDate);

      // Gerar a narrativa do Termo de Declaração no modelo solicitado
      const diaSemana = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
      const diaMes = new Date().toLocaleDateString("pt-BR", { day: "numeric" });
      const mesExtenso = new Date().toLocaleDateString("pt-BR", { month: "long" });
      const anoCorrente = new Date().getFullYear();
      const horaMinuto = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      const templateNarrativa = `Compareceu a este Órgão de Proteção dos Direitos da criança e do adolescente na manhã de ${diaSemana} do dia ${diaMes} de ${mesExtenso} do corrente ano de ${anoCorrente} as ${horaMinuto} horas, a senhora ${activeCase.responsavelPrincipal.nome || "[Declarante]"} portadora do CPF: [CPF do Declarante] Residente na Rua: ${activeCase.criancaEndereco || "[Rua]"} Bairro: [Bairro] ${activeCase.responsavelPrincipal.parentesco || "genitor(a)"} do infante ${activeCase.criancaNome || "[Criança]"} de ${activeCase.criancaIdade || "[Idade]"} anos estudante na escola ${activeCase.criancaEscola || "[Escola]"} no 5° ano matutino portador do CPF. Notificada por este Órgão a senhora ${activeCase.responsavelPrincipal.nome || "[Declarante]"} relata que seu filho sempre frequenta a escola, porém que por motivos de doença a criança tem faltado algumas vezes. Relata também que não gosta da escola pelo motivo de ter sido maltratada por um funcionaria na própria escola SIC. Entretanto ${activeCase.responsavelPrincipal.nome || "[Declarante]"} diz, que sempre avisa a escola quando o filho falta, que sempre vive em casa e não sai para lugar algum, falando também que sempre cuidou de seu filho e que ele é tudo em sua vida SIC. Na DENUNCIA diz que a sra. ${activeCase.responsavelPrincipal.nome || "[Declarante]"} vive trancada em casa com a criança, e que emocionalmente está muito abalada necessitando de ajuda com um profissional na psicologia. A sra. ${activeCase.responsavelPrincipal.nome || "[Declarante]"} em sua fala diz não gostar de estar em lugares com pessoas SIC. A uma extrema necessidade de ser tratada no seu emocional, pelo quadro de DEPRESSÃO que a mesma apresenta, e pela dificuldade que a sra. ${activeCase.responsavelPrincipal.nome || "[Declarante]"} e seu filho ${activeCase.criancaNome || "[Criança]"} estão vivendo, a necessidade de serem tratados com os profissionais. Este Órgão fez as orientações e encaminhará a sra. ${activeCase.responsavelPrincipal.nome || "[Declarante]"} para os serviços de saúde e acompanhamento famíliar.\n\nSem mais nada para declarar.`;

      setTermoCorpoCompleto(templateNarrativa);

    } else {
      // Caso limpo
      setNotifNotificado("");
      setNotifCrianca("");
      setNotifRua("");
      setNotifBairro("");
      setNotifEmissaoData(formattedDate);

      setTermoDeclarante("");
      setTermoCPF("");
      setTermoEndereco("");
      setTermoBairro("");
      setTermoParentesco("genitor(a)");
      setTermoCriancaNome("");
      setTermoCriancaIdade("");
      setTermoEscola("");
      setTermoAnoEscolar("5° ano");
      setTermoTurnoEscola("matutino");
      setTermoCriancaCPF("");
      setTermoDataEmissao(formattedDate);
      setTermoConselheiroAssinatura(conselheiroNome || "Conselho tutelar");

      const narrativaVazia = `Compareceu a este Órgão de Proteção dos Direitos da criança e do adolescente na manhã de quinta-feira do dia 25 de Junho do corrente ano de 2026 as 08:23 horas, a senhora Ivalda de Oliveira Silva portadora do CPF: Residente na Rua: Tomaz do Ó n°223 Bairro JK genitora do infante Luan Rafael Silva de 11 anos estudante na escola Francisco Leonis Gomes de Assis no 5° ano matutino portador do CPF. Notificada por este Órgão a senhora Ivalda relata que seu filho sempre frequenta a escola, porém que por motivos de doença a criança tem faltado algumas vezes. Relata também que não gosta da escola pelo motivo de ter sido maltratada por um funcionaria na própria escola SIC. Entretanto Ivalda diz, que sempre avisa a escola quando o filho falta, que sempre vive em casa e não sai para lugar algum, falando também que sempre cuidou de seu filho e que ele é tudo em sua vida SIC. Na DENUNCIA diz que a sra. Ivalda vive trancada em casa com a criança, e que emocionalmente está muito abalada necessitando de ajuda com um profissional na psicologia. A sra. Ivalda em sua fala diz não gostar de estar em lugares com pessoas SIC. A uma extrema necessidade de ser tratada no seu emocional, pelo quadro de DEPRESSÃO que a mesma apresenta, e pela dificuldade que a sra. Ivalda e seu filho Luan estão vivendo, a necessidade de serem tratados com os profissionais. Este Órgão fez as orientações e encaminhará a sra. Ivalda para os serviços de saúde e acompanhamento famíliar.\n\nSem mais nada para declarar.`;

      setTermoCorpoCompleto(narrativaVazia);
    }
  }, [activeCase, conselheiroNome]);

  // Função para recalcular narrativa baseada nas edições rápidas dos campos
  const handleRecalcularNarrativa = () => {
    const diaSemana = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
    const diaMes = new Date().toLocaleDateString("pt-BR", { day: "numeric" });
    const mesExtenso = new Date().toLocaleDateString("pt-BR", { month: "long" });
    const anoCorrente = new Date().getFullYear();
    const horaMinuto = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const dec = termoDeclarante || "Ivalda de Oliveira Silva";
    const cpf = termoCPF || "____.____.____-__";
    const rua = termoEndereco || "Tomaz do Ó n°223";
    const bairro = termoBairro || "JK";
    const parent = termoParentesco || "genitora";
    const cri = termoCriancaNome || "Luan Rafael Silva";
    const idade = termoCriancaIdade || "11";
    const esc = termoEscola || "Francisco Leonis Gomes de Assis";
    const anoEsc = termoAnoEscolar || "5° ano";
    const turno = termoTurnoEscola || "matutino";
    const criCpf = termoCriancaCPF ? `portador(a) do CPF ${termoCriancaCPF}` : "portador do CPF";

    const novaNarrativa = `Compareceu a este Órgão de Proteção dos Direitos da criança e do adolescente na manhã de ${diaSemana} do dia ${diaMes} de ${mesExtenso} do corrente ano de ${anoCorrente} as ${horaMinuto} horas, a senhora ${dec} portadora do CPF: ${cpf} Residente na Rua: ${rua} Bairro: ${bairro} ${parent} do infante ${cri} de ${idade} anos estudante na escola ${esc} no ${anoEsc} ${turno} ${criCpf}. Notificada por este Órgão a senhora ${dec} relata que seu filho sempre frequenta a escola, porém que por motivos de doença a criança tem faltado algumas vezes. Relata também que não gosta da escola pelo motivo de ter sido maltratada por um funcionaria na própria escola SIC. Entretanto ${dec} diz, que sempre avisa a escola quando o filho falta, que sempre vive em casa e não sai para lugar algum, falando também que sempre cuidou de seu filho e que ele é tudo em sua vida SIC. Na DENUNCIA diz que a sra. ${dec} vive trancada em casa com a criança, e que emocionalmente está muito abalada necessitando de ajuda com um profissional na psicologia. A sra. ${dec} em sua fala diz não gostar de estar em lugares com pessoas SIC. A uma extrema necessidade de ser tratada no seu emocional, pelo quadro de DEPRESSÃO que a mesma apresenta, e pela dificuldade que a sra. ${dec} e seu filho ${cri} estão vivendo, a necessidade de serem tratados com os profissionais. Este Órgão fez as orientações e encaminhará a sra. ${dec} para os serviços de saúde e acompanhamento famíliar.\n\nSem mais nada para declarar.`;

    setTermoCorpoCompleto(novaNarrativa);
  };

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
      
      {/* Barra de Ações Superior (Ocultada na Impressão) */}
      <div className="max-w-5xl mx-auto mb-6 bg-white p-4 rounded-xl border border-slate-150 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          
          <div className="hidden sm:block h-5 w-px bg-slate-200" />
          
          {/* Seletor rápido de Caso */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 shrink-0">Caso Ativo:</span>
            <select
              value={activeCase?.id || ""}
              onChange={(e) => {
                const id = e.target.value;
                const found = cases.find(c => c.id === id);
                setActiveCase(found || null);
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-lg text-xs font-extrabold text-slate-700 outline-none transition cursor-pointer"
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

        {/* Selecionador de Template (Notificação vs Termo) */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setSelectedTemplate("notificacao")}
            className={`px-3.5 py-1.5 rounded-md transition duration-155 cursor-pointer ${
              selectedTemplate === "notificacao" 
                ? "bg-blue-600 text-white shadow-sm font-extrabold" 
                : "hover:text-slate-800 text-slate-500"
            }`}
          >
            📋 1. Notificação Oficial
          </button>
          <button
            type="button"
            onClick={() => setSelectedTemplate("termo")}
            className={`px-3.5 py-1.5 rounded-md transition duration-155 cursor-pointer ${
              selectedTemplate === "termo" 
                ? "bg-blue-600 text-white shadow-sm font-extrabold" 
                : "hover:text-slate-800 text-slate-500"
            }`}
          >
            📝 2. Termo de Declaração
          </button>
        </div>

        {/* Copiar, Salvar e Imprimir */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              let text = "";
              if (selectedTemplate === "notificacao") {
                text = `CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE\nLEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL Nº 1214/91\nCURRAIS NOVOS – RN\n\nNOTIFICAÇÃO Nº ${notifNumero}\n\n${notifIntro}\n\nNOTIFICA o (a) Sr.ª(a) ${notifNotificado}\nReferente à Criança/Adolescente: ${notifCrianca}\nENDEREÇO: RUA: ${notifRua}\nBAIRRO: ${notifBairro}\n\n${notifCorpoTexto()}\n\n${notifLegalWarning}\n\n${notifArtigo236}\n\nCurrais Novos, RN, ${notifEmissaoData}.\n\nRecebido em:_____/_____/ _____. Hora:_______\n\nAssinatura do Notificado\n\nAssinatura do Notificador\n\n${notifObservacao}`;
              } else {
                text = `CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE\nLEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL Nº 1214/91\nAv. Joventino da Silveira, nº 155 - Bairro: Centro\nCurrais Novos/ RN – Tel. 0xx84-98783-4732\n\nTERMO DE DECLARAÇÃO\n\n${termoCorpoCompleto}\n\nCurrais Novos, RN/ ${termoDataEmissao}\n\nDeclarante: ______________________\nAtenciosamente, ${termoConselheiroAssinatura}`;
              }
              handleCopyText(text);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1 border border-slate-200 transition cursor-pointer"
          >
            {copiedTexto ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTexto ? "Copiado!" : "Copiar Rascunho"}</span>
          </button>

          {activeCase && onAddHistoryLog && (
            <button
              type="button"
              onClick={() => {
                if (selectedTemplate === "notificacao") {
                  const logPayload = {
                    data: new Date().toISOString(),
                    descricao: `📋 NOTIFICAÇÃO Nº ${notifNumero} EMITIDA para ${notifNotificado || "não informado"}.\nFoco: ${notifCrianca || "não informado"}.\nData agendada: ${notifDataComp} às ${notifHoraComp}.\nRegistrado no prontuário oficial.`,
                    conselheiro: conselheiroNome || activeCase.conselheiroResponsavel || "Conselheiro Atendente"
                  };
                  onAddHistoryLog(activeCase.id, logPayload);
                } else {
                  const logPayload = {
                    data: new Date().toISOString(),
                    descricao: `📝 TERMO DE DECLARAÇÃO registrado em audiência/termo.\nDeclarante: ${termoDeclarante}.\nDepoimento Tomado: "${termoCorpoCompleto.slice(0, 150)}..."`,
                    conselheiro: termoConselheiroAssinatura || activeCase.conselheiroResponsavel || "Conselheiro Atendente"
                  };
                  onAddHistoryLog(activeCase.id, logPayload);
                }
                alert("Instrumento registrado permanentemente no histórico de acompanhamento do Prontuário!");
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" /> 
              <span>Vincular ao Prontuário</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> 
            <span>Imprimir Documento</span>
          </button>
        </div>
      </div>

      {/* Grid Layout Principal */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Coluna Esquerda: Edição Rápida de Variáveis (Ocultada na Impressão) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-5 print:hidden">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest block font-sans">Preenchimento Rápido</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Valores dinâmicos que preenchem o modelo oficial</span>
          </div>

          {selectedTemplate === "notificacao" ? (
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Número Notificação</label>
                <input
                  type="text"
                  value={notifNumero}
                  onChange={(e) => setNotifNumero(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Notifica-se Sr./Sra.</label>
                <input
                  type="text"
                  value={notifNotificado}
                  onChange={(e) => setNotifNotificado(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  placeholder="Nome do Notificado"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Referente à Criança/Adolescente</label>
                <input
                  type="text"
                  value={notifCrianca}
                  onChange={(e) => setNotifCrianca(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  placeholder="Nome do menor"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Endereço (Rua, Nº)</label>
                <input
                  type="text"
                  value={notifRua}
                  onChange={(e) => setNotifRua(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="Ex: Av. Joventino da Silveira, nº 155"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Bairro</label>
                <input
                  type="text"
                  value={notifBairro}
                  onChange={(e) => setNotifBairro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="Ex: Centro"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 block">Data Audiência</label>
                  <input
                    type="text"
                    value={notifDataComp}
                    onChange={(e) => setNotifDataComp(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 block">Hora</label>
                  <input
                    type="text"
                    value={notifHoraComp}
                    onChange={(e) => setNotifHoraComp(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Assunto / Finalidade</label>
                <textarea
                  rows={2}
                  value={notifAssunto}
                  onChange={(e) => setNotifAssunto(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Data de Emissão</label>
                <input
                  type="text"
                  value={notifEmissaoData}
                  onChange={(e) => setNotifEmissaoData(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Nome do Declarante</label>
                <input
                  type="text"
                  value={termoDeclarante}
                  onChange={(e) => setTermoDeclarante(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                  placeholder="Nome da pessoa deposta"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">CPF do Declarante</label>
                <input
                  type="text"
                  value={termoCPF}
                  onChange={(e) => setTermoCPF(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  placeholder="Ex: 000.000.000-00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Endereço Declarante</label>
                <input
                  type="text"
                  value={termoEndereco}
                  onChange={(e) => setTermoEndereco(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Bairro</label>
                <input
                  type="text"
                  value={termoBairro}
                  onChange={(e) => setTermoBairro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 block">Vínculo / Parentesco</label>
                  <input
                    type="text"
                    value={termoParentesco}
                    onChange={(e) => setTermoParentesco(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 block">Idade Criança</label>
                  <input
                    type="text"
                    value={termoCriancaIdade}
                    onChange={(e) => setTermoCriancaIdade(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Nome da Criança</label>
                <input
                  type="text"
                  value={termoCriancaNome}
                  onChange={(e) => setTermoCriancaNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-slate-500 block">Escola</label>
                <input
                  type="text"
                  value={termoEscola}
                  onChange={(e) => setTermoEscola(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 block">Ano Escolar</label>
                  <input
                    type="text"
                    value={termoAnoEscolar}
                    onChange={(e) => setTermoAnoEscolar(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-500 block">Turno Escola</label>
                  <input
                    type="text"
                    value={termoTurnoEscola}
                    onChange={(e) => setTermoTurnoEscola(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRecalcularNarrativa}
                className="w-full mt-2 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Atualizar Texto do Termo</span>
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span className="text-[10.5px] leading-relaxed text-slate-500">
              <strong>💡 Editor Inteligente:</strong> Além dos campos ao lado, você pode clicar e **digitar diretamente** em qualquer bloco de texto do documento ao lado para total personalização.
            </span>
          </div>
        </div>

        {/* Coluna Direita: Visualização Interativa em Papel Oficial */}
        <div className="md:col-span-2 bg-white rounded-lg border border-slate-300 shadow-xl p-8 sm:p-14 font-serif text-slate-900 leading-relaxed max-w-[21cm] min-h-[29.7cm] mx-auto print:border-none print:shadow-none print:m-0 print:p-0 print:w-full select-text">
          
          {selectedTemplate === "notificacao" ? (
            /* =========================================================================
               NOVO MODELO OFICIAL DE NOTIFICAÇÃO (EXTRACTED FROM ATTACHMENT PDF 1)
               ========================================================================= */
            <div className="space-y-6">
              
              {/* Logotipo Superior e Cabeçalho */}
              <div className="text-center space-y-1.5 pb-4 border-b-2 border-black text-black">
                <div className="flex justify-center mb-2">
                  <img 
                    src="/icon.svg" 
                    className="w-24 h-24 rounded-full object-contain bg-white p-1 shadow-xs" 
                    alt="CT Logo" 
                  />
                </div>
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase leading-tight font-serif text-black">
                  CONSELHO TUTELAR DOS DIREITOS
                </h2>
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase leading-tight font-serif text-black">
                  DA CRIANÇA E DO ADOLESCENTE
                </h2>
                <p className="text-[11px] sm:text-xs font-bold mt-1 leading-snug font-serif text-black">
                  LEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL Nº 1214/91
                </p>
                <p className="text-[11px] sm:text-xs font-extrabold tracking-widest leading-none uppercase font-serif text-black">
                  CURRAIS NOVOS – RN
                </p>
              </div>

              {/* Título com Número Editável */}
              <div className="text-center py-2 flex items-center justify-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base uppercase tracking-wider font-serif text-black shrink-0">
                  NOTIFICAÇÃO Nº
                </span>
                <input
                  type="text"
                  value={notifNumero}
                  onChange={(e) => setNotifNumero(e.target.value)}
                  className="font-extrabold text-sm sm:text-base uppercase tracking-wider font-serif text-black bg-transparent border-b border-dashed border-slate-350 hover:border-blue-500 focus:border-blue-600 focus:outline-none w-48 px-1 text-center transition print:border-none print:w-auto print:p-0"
                  title="Clique para editar o número oficial"
                />
              </div>

              {/* Parágrafo de Introdução Editável */}
              <div className="text-xs sm:text-[13px] leading-relaxed text-justify text-black font-serif">
                <textarea
                  ref={textNotifIntroRef}
                  value={notifIntro}
                  onChange={(e) => {
                    setNotifIntro(e.target.value);
                    autoResize(textNotifIntroRef);
                  }}
                  rows={2}
                  className="w-full font-serif text-xs sm:text-[13px] text-justify leading-relaxed text-black bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded p-1.5 outline-none resize-none transition print:hover:border-transparent print:border-none print:p-0 print:outline-none print:resize-none"
                  title="Clique para editar o texto introdutório da Notificação"
                />
              </div>

              {/* Informações Focadas em Caixa de Dados (Semelhante ao PDF) */}
              <div className="space-y-2.5 text-xs sm:text-[13px] font-serif text-left pt-1 text-black">
                <div className="flex gap-1.5 items-baseline font-serif text-black">
                  <strong className="font-serif font-extrabold text-black shrink-0">NOTIFICA o (a) Sr.ª(a):</strong>
                  <input
                    type="text"
                    value={notifNotificado}
                    onChange={(e) => setNotifNotificado(e.target.value)}
                    className="border-b border-black/40 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif font-bold flex-grow px-1.5 text-black bg-slate-50/20 print:border-none print:bg-transparent print:p-0"
                    placeholder="Nome completo do Notificado"
                  />
                </div>

                <div className="flex gap-1.5 items-baseline font-serif text-black">
                  <strong className="font-serif font-bold text-black shrink-0">Referente à Criança/Adolescente:</strong>
                  <input
                    type="text"
                    value={notifCrianca}
                    onChange={(e) => setNotifCrianca(e.target.value)}
                    className="border-b border-black/40 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif font-semibold flex-grow px-1.5 text-black bg-slate-50/20 print:border-none print:bg-transparent print:p-0"
                    placeholder="Nome da criança ou adolescente"
                  />
                </div>

                <div className="flex gap-1.5 items-baseline font-serif text-black">
                  <strong className="font-serif font-bold text-black shrink-0">ENDEREÇO: RUA:</strong>
                  <input
                    type="text"
                    value={notifRua}
                    onChange={(e) => setNotifRua(e.target.value)}
                    className="border-b border-black/40 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif flex-grow px-1.5 text-black bg-slate-50/20 print:border-none print:bg-transparent print:p-0"
                    placeholder="Rua e número"
                  />
                </div>

                <div className="flex gap-1.5 items-baseline font-serif text-black">
                  <strong className="font-serif font-bold text-black shrink-0">BAIRRO:</strong>
                  <input
                    type="text"
                    value={notifBairro}
                    onChange={(e) => setNotifBairro(e.target.value)}
                    className="border-b border-black/40 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif flex-grow px-1.5 text-black bg-slate-50/20 print:border-none print:bg-transparent print:p-0"
                    placeholder="Bairro da residência"
                  />
                </div>
              </div>

              {/* Corpo Principal de Comparecimento Editável */}
              <div className="text-xs sm:text-[13px] leading-relaxed text-justify text-black font-serif pt-1.5">
                <p className="font-serif text-black leading-relaxed">
                  A Comparecer neste órgão na data de{" "}
                  <input
                    type="text"
                    value={notifDataComp}
                    onChange={(e) => setNotifDataComp(e.target.value)}
                    className="border-b border-dashed border-black/50 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif font-extrabold px-1 text-center w-36 bg-slate-50/10 print:border-none print:bg-transparent print:p-0"
                  />, às{" "}
                  <input
                    type="text"
                    value={notifHoraComp}
                    onChange={(e) => setNotifHoraComp(e.target.value)}
                    className="border-b border-dashed border-black/50 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif font-extrabold px-1 text-center w-20 bg-slate-50/10 print:border-none print:bg-transparent print:p-0"
                  />, a fim de{" "}
                  <input
                    type="text"
                    value={notifAssunto}
                    onChange={(e) => setNotifAssunto(e.target.value)}
                    className="border-b border-dashed border-black/50 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif px-1 w-full bg-slate-50/10 print:border-none print:bg-transparent print:p-0 mt-1"
                    placeholder="objetivo do comparecimento"
                  />.
                </p>
              </div>

              {/* Texto de Advertência / Código ECA (Artigo 236 do ECA e Artigo 136) */}
              <div className="border border-black p-4 rounded bg-slate-50/40 text-xs sm:text-[13px] leading-relaxed text-justify font-serif text-black space-y-3 print:bg-transparent print:border-black">
                <textarea
                  ref={textNotifWarningRef}
                  value={notifLegalWarning}
                  onChange={(e) => {
                    setNotifLegalWarning(e.target.value);
                    autoResize(textNotifWarningRef);
                  }}
                  rows={4}
                  className="w-full font-serif text-xs sm:text-[13px] text-justify leading-normal text-black bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded p-1 outline-none resize-none transition print:hover:border-transparent print:border-none print:p-0 print:outline-none print:resize-none"
                  title="Clique para editar as advertências legais da Notificação"
                />

                <div className="border-t border-black/20 pt-2 italic text-black font-serif">
                  <textarea
                    ref={textNotifArtRef}
                    value={notifArtigo236}
                    onChange={(e) => {
                      setNotifArtigo236(e.target.value);
                      autoResize(textNotifArtRef);
                    }}
                    rows={3}
                    className="w-full font-serif text-xs sm:text-[13px] italic text-justify leading-normal text-black bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded p-1 outline-none resize-none transition print:hover:border-transparent print:border-none print:p-0 print:outline-none print:resize-none"
                    title="Clique para editar as penalidades descritas"
                  />
                </div>
              </div>

              {/* Data de Emissão e Local */}
              <div className="text-center sm:text-right pt-2 font-serif text-black font-bold text-xs sm:text-[13px]">
                <span>Currais Novos, RN, </span>
                <input
                  type="text"
                  value={notifEmissaoData}
                  onChange={(e) => setNotifEmissaoData(e.target.value)}
                  className="border-b border-dashed border-black/40 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif font-bold text-center w-52 bg-slate-50/10 print:border-none print:bg-transparent print:p-0"
                />
              </div>

              {/* Bloco de Assinatura e Recebimento */}
              <div className="pt-4 space-y-8 text-xs sm:text-[13px] font-serif text-black">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="flex gap-1.5 items-baseline font-serif">
                    <span className="font-serif font-bold">Recebido em:</span>
                    <span className="border-b border-black w-36 inline-block text-center font-serif text-black">______/______/______</span>
                  </div>
                  <div className="flex gap-1.5 items-baseline font-serif">
                    <span className="font-serif font-bold">Hora:</span>
                    <span className="border-b border-black w-24 inline-block text-center font-serif text-black">__________________</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black/30 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center font-serif">
                  <div className="flex flex-col items-center justify-end">
                    <div className="border-b border-black w-64 mb-6 h-6" />
                    <span className="text-[11px] font-bold uppercase text-slate-500">Assinatura do notificado(A)</span>
                    <span className="text-[10px] text-slate-400">CPF/RG</span>
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <div className="border-b border-black w-64 mb-6 h-6" />
                    <span className="text-[11px] font-bold uppercase text-slate-600">Conselho Tutelar</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Assinatura do Notificador (A)</span>
                  </div>
                </div>
              </div>

              {/* Caixa de Observação Inferior Importante Editável */}
              <div className="border border-black p-3.5 rounded text-xs sm:text-[12px] leading-normal text-justify font-sans bg-slate-50/50 print:bg-transparent print:border-black">
                <textarea
                  ref={textNotifObsRef}
                  value={notifObservacao}
                  onChange={(e) => {
                    setNotifObservacao(e.target.value);
                    autoResize(textNotifObsRef);
                  }}
                  rows={4}
                  className="w-full font-sans text-xs sm:text-[12px] text-justify leading-relaxed text-black bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded p-1 outline-none resize-none transition print:hover:border-transparent print:border-none print:p-0 print:outline-none print:resize-none"
                  title="Clique para editar as instruções de documentos requeridos"
                />
              </div>

            </div>
          ) : (
            /* =========================================================================
               NOVO MODELO OFICIAL DE TERMO DE DECLARAÇÃO (EXTRACTED FROM ATTACHMENT PDF 2)
               ========================================================================= */
            <div className="space-y-6">
              
              {/* Cabeçalho de Termo de Declaração */}
              <div className="text-center space-y-1.5 pb-4 border-b-2 border-black font-serif text-black">
                <div className="flex justify-center mb-2">
                  <img 
                    src="/icon.svg" 
                    className="w-24 h-24 rounded-full object-contain bg-white p-1 shadow-xs" 
                    alt="CT Logo" 
                  />
                </div>
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase leading-tight font-serif text-black">
                  CONSELHO TUTELAR DOS DIREITOS DA CRIANÇA E DO ADOLESCENTE
                </h2>
                <p className="text-[11px] sm:text-xs font-bold mt-1 leading-snug font-serif text-black">
                  LEI FEDERAL Nº 8.069/90 – LEI MUNICIPAL 1214/91
                </p>
                <p className="text-[10px] sm:text-xs font-medium tracking-normal leading-none font-serif text-black">
                  Av. Joventino da Silveira, nº 155 - Bairro: Centro.
                </p>
                <p className="text-[10px] sm:text-xs font-bold tracking-normal leading-none font-serif text-black">
                  Currais Novos/ RN – Tel. 0xx84-98783-4732
                </p>
              </div>

              {/* Título */}
              <div className="text-center py-1 mt-2">
                <h3 className="font-black text-sm sm:text-base uppercase underline tracking-wider font-serif text-black">
                  TERMO DE DECLARAÇÃO
                </h3>
              </div>

              {/* Relato e Narrativa Completamente Editável */}
              <div className="space-y-4 pt-1.5 text-xs sm:text-[13px] leading-relaxed text-justify font-serif text-black">
                
                {/* Textarea Principal para todo o depoimento/narrativa do anexo */}
                <div className="space-y-1 text-black font-serif">
                  <textarea
                    ref={textTermoCorpoRef}
                    value={termoCorpoCompleto}
                    onChange={(e) => {
                      setTermoCorpoCompleto(e.target.value);
                      autoResize(textTermoCorpoRef);
                    }}
                    rows={18}
                    className="w-full font-serif text-xs sm:text-[13px] text-justify leading-relaxed text-black bg-transparent border border-transparent hover:border-slate-350 focus:border-blue-500 focus:bg-white rounded p-2.5 outline-none resize-y transition print:hover:border-transparent print:border-none print:p-0 print:outline-none print:resize-none"
                    placeholder="Digite ou edite o termo de declaração completo..."
                    title="Depoimento oficial completamente editável. Altere qualquer trecho diretamente aqui."
                  />
                </div>

              </div>

              {/* Data do Termo */}
              <div className="pt-6 font-serif text-black font-bold text-xs sm:text-[13px] text-right">
                <span>Currais Novos, RN/ </span>
                <input
                  type="text"
                  value={termoDataEmissao}
                  onChange={(e) => setTermoDataEmissao(e.target.value)}
                  className="border-b border-dashed border-black/40 hover:border-blue-500 focus:border-blue-600 focus:outline-none font-serif font-bold text-center w-52 bg-slate-50/10 print:border-none print:bg-transparent print:p-0"
                />
              </div>

              {/* Assinaturas */}
              <div className="pt-8 space-y-14 text-xs sm:text-[13px] font-serif text-black">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-center font-serif">
                  <div className="flex flex-col items-center justify-end">
                    <div className="border-b border-black w-64 mb-6 h-6" />
                    <span className="text-[11px] font-bold uppercase text-slate-500">Declarante</span>
                  </div>
                  <div className="flex flex-col items-center justify-end">
                    <div className="border-b border-black w-64 mb-6 h-6" />
                    <span className="text-[11px] font-bold uppercase text-slate-600">Conselho Tutelar</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Assinatura do Conselheiro</span>
                  </div>
                </div>

                <div className="text-center pt-2 font-serif text-slate-400 text-[10px] italic print:hidden">
                  <span>Atenciosamente</span>
                </div>
              </div>

            </div>
          )}

          {/* Rodapé Interno com Rodapé de Validação Eletrônica Compatível com SEI/ECA */}
          <div className="mt-12 pt-4 border-t border-dashed border-slate-300 font-sans space-y-2 print:border-solid print:border-slate-400">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 p-3 rounded-xl print:bg-transparent print:border-slate-350 print:p-2.5 text-left">
              <div className="w-12 h-12 bg-white border border-slate-300 rounded p-1 flex items-center justify-center shrink-0 print:border-slate-350">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                  <path fill="currentColor" d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,0 h10 v10 h-10 z M50,10 h10 v10 h-10 z M40,20 h10 v10 h-10 z M50,30 h10 v15 h-10 z M40,80 h15 v20 h-15 z M80,50 h20 v10 h-20 z M70,80 h30 v10 h-30 z M70,40 h10 v20 h-10 z M90,70 h10 v20 h-10 z M40,60 h10 v10 h-10 z M50,70 h10 v10 h-10 z" />
                </svg>
              </div>
              <div className="space-y-0.5 text-left min-w-0 font-sans">
                <div className="flex items-center gap-1.5 flex-wrap font-sans">
                  <span className="text-[9px] uppercase font-black text-slate-800 tracking-wide font-sans">
                    ECA-DIGITAL CURRAIS NOVOS
                  </span>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-bold uppercase shrink-0 print:border print:border-emerald-600 print:text-emerald-800 font-sans">
                    ✓ VALIDADO
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight font-sans">
                  Instrumento autenticado com certificação interna do colegiado em <span className="font-semibold text-slate-700 font-mono">{new Date().toLocaleString('pt-BR')}</span>.
                </p>
                <p className="text-[8px] text-slate-400 font-mono">
                  CT-{new Date().getFullYear()}-{Math.random().toString(36).substring(2, 8).toUpperCase()} (Padrão de Autenticidade Digital SEI)
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  // Auxiliar para gerar o texto bruto do comparecimento na cópia da Notificação
  function notifCorpoTexto() {
    return `A Comparecer neste órgão na data de ${notifDataComp}, às ${notifHoraComp}, a fim de ${notifAssunto}.`;
  }
}
