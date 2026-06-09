/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AtendimentoCase, FollowUpLog, StatusCase } from "../types";
import { 
  ArrowLeft, 
  Printer, 
  Edit, 
  Trash2, 
  Plus, 
  MessageSquare, 
  User, 
  MapPin, 
  GraduationCap, 
  FileText, 
  ShieldAlert, 
  Heart,
  CheckCircle,
  HelpCircle,
  Clock,
  Mail,
  Send,
  Building,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";

interface CaseDetailsProps {
  caseData: AtendimentoCase;
  onBack: () => void;
  onEdit: (caseData: AtendimentoCase) => void;
  onDelete: (caseId: string) => void;
  onUpdateStatus: (caseId: string, status: StatusCase) => void;
  onAddHistoryLog: (caseId: string, log: Omit<FollowUpLog, "id">) => void;
  privacyMode?: boolean;
}

export default function CaseDetails({
  caseData,
  onBack,
  onEdit,
  onDelete,
  onUpdateStatus,
  onAddHistoryLog,
  privacyMode = false,
}: CaseDetailsProps) {
  const [newLogDesc, setNewLogDesc] = useState("");
  const [conselheiroNome, setConselheiroNome] = useState(caseData.conselheiroResponsavel || "");
  const [isPrintingPreview, setIsPrintingPreview] = useState(false);

  // Função para mascarar dados quando o modo de privacidade estiver ativo
  const maskField = (text: string | undefined | null) => {
    if (!text) return "";
    if (!privacyMode) return text;
    const trimmed = text.trim();
    if (trimmed.length === 0) return "";
    const parts = trimmed.split(/\s+/);
    return parts.map((p, i) => {
      if (p.length === 0) return "";
      if (i === 0) {
        if (p.length <= 2) return p + "•";
        return p.slice(0, 2) + "•••" + p.slice(-1);
      }
      return p[0] + "•••";
    }).join(" ");
  };

  // Estados de Ofício Digital via E-mail
  const [showOficioModal, setShowOficioModal] = useState(false);
  const [selectedOrgao, setSelectedOrgao] = useState("mprn");
  const [destinatarioEmail, setDestinatarioEmail] = useState("promotoria.curraisnovos@mprn.mp.br");
  const [oficioAssunto, setOficioAssunto] = useState(`OFÍCIO REQUISITÓRIO CT - CASO Nº ${caseData.numeroRegistro}`);
  const [oficioTexto, setOficioTexto] = useState("");
  const [isSendingOficio, setIsSendingOficio] = useState(false);
  const [oficioEnviadoSucesso, setOficioEnviadoSucesso] = useState(false);

  // Estados de Cópia de informações
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedAssunto, setCopiedAssunto] = useState(false);
  const [copiedTexto, setCopiedTexto] = useState(false);

  const handleCopyText = (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      }
    } catch (err) {
      console.error("Falha ao copiar: ", err);
    }
  };

  const ORGAOS_COMPETENTES = [
    { id: "mprn", nome: "Ministério Público de Currais Novos", email: "promotoria.curraisnovos@mprn.mp.br", recomendacao: "Para casos graves de negligência reiterada, abuso, acolhimento institucional urgente ou destituição de tutela." },
    { id: "smas", nome: "S.E.M.T.H.A.S / CREAS e CRAS (Assistência Social)", email: "semthas@curraisnovos.rn.gov.br", recomendacao: "Para apoio psicossocial, inclusão em programas sociais de transferência de renda e acolhimento familiar." },
    { id: "pcrn", nome: "Delegacia de Polícia Civil de Currais Novos", email: "depol.curraisnovos@pcrn.gov.br", recomendacao: "Para notificação de agressões físicas, abuso sexual ou qualquer crime tipificado contra o infante." },
    { id: "educa", nome: "Secretaria Municipal de Educação de Currais Novos", email: "educacao@curraisnovos.rn.gov.br", recomendacao: "Para requisição de matrícula escolar, transferência compulsória, combate à evasão escolar ou apoio pedagógico especializado." },
    { id: "saude", nome: "Secretaria Municipal de Saúde (SUS)", email: "saude@curraisnovos.rn.gov.br", recomendacao: "Para requisição de exames, tratamento psicológico, psiquiátrico de urgência ou medicamentos receitados." },
    { id: "tjrn", nome: "Vara da Infância e Juventude / Judiciário de Currais Novos", email: "curraisnovos@tjrn.jus.br", recomendacao: "Para comunicação formal de medidas extremas de proteção ou crimes de desobediência a termos anteriores." },
    { id: "custom", nome: "Outro Órgão / E-mail Customizado", email: "", recomendacao: "Para envio de expediente para qualquer outra entidade governamental ou não governamental." }
  ];

  const gerarTextoPadraoOficio = (orgNome: string) => {
    const dataHojeStr = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const numeroOficio = `OFC-249-${caseData.numeroRegistro.split('-').pop()}`;
    
    return `OFÍCIO EXTRAORDINÁRIO REQUISITÓRIO Nº ${numeroOficio} / Conselho Tutelar

Currais Novos / RN, ${dataHojeStr}.

Ao(à) Ilmo(a). Sr(a). Diretor(a) / Coordenador(a) do(a)
${orgNome}
Currais Novos - RN

Assunto: REQUISIÇÃO DE PROVIDÊNCIAS E/OU ENCAMINHAMENTO DE INFANTE
Referente ao Prontuário Digital do Conselho: Registro Interno Nº ${caseData.numeroRegistro}

Prezado(a) Senhor(a),

O CONSELHO TUTELAR DE CURRAIS NOVOS, Rio Grande do Norte, no uso das prerrogativas que lhes foram estabelecidas na Lei Federal nº 8.069 de 13 de julho de 1990 (Estatuto da Criança e do Adolescente - ECA), em especial seus artigos 131 e 136, inciso III, alínea 'a', e inciso VII, vem perante este órgão competente REQUISITAR E ENCAMINHAR providências para o seguinte caso atendido:

1. DADOS DE IDENTIFICAÇÃO DO INFANTOJUVENIL PROTEGIDO:
   • Nome completo: ${caseData.criancaNome}
   • Idade: ${caseData.criancaIdade} anos
   • Data de Nascimento: ${caseData.criancaDataNascimento ? new Date(caseData.criancaDataNascimento).toLocaleDateString('pt-BR') : "Não informada"}
   • Endereço: ${caseData.criancaEndereco || "Não informado no sistema"}
   • Responsável legal: ${caseData.responsavelPrincipal.nome} (${caseData.responsavelPrincipal.parentesco})

2. DA INFRAÇÃO DE DIREITOS VERIFICADA DA OCORRÊNCIA:
Este conselho foi provocado referente à infração de direito do menor caracterizada como: [ ${caseData.tipoOcorrencia} ].
Súmula fática: "${caseData.descricaoOcorrencia}"

3. DAS PROVIDÊNCIAS E REQUISIÇÕES SOLICITADAS:
Diante do exposto, determinamos a aplicação emergencial de medidas de proteção, e REQUISITAMOS a esta secretaria/órgão que adote, em regime de prioridade absoluta, as devidas providências para amparo psicossocial, médico ou escolar do menor, informando os resultados das ações no prazo improrrogável de até 10 (dez) dias úteis a este Colegiado.

Atenciosamente,

___________________________________________________
Conselheiro(a) Responsável: ${conselheiroNome || caseData.conselheiroResponsavel || 'Membro do Colegiado'}
CONSELHO TUTELAR DE CURRAIS NOVOS
R. Juventino da Silveira, 155, Currais Novos - RN, 59380-000
ct.curraisnovos@rn.gov.br`;
  };

  // Sincronizar o texto padrão do Ofício com o órgão selecionado
  useEffect(() => {
    const org = ORGAOS_COMPETENTES.find(o => o.id === selectedOrgao);
    if (org) {
      if (selectedOrgao !== "custom") {
        setDestinatarioEmail(org.email);
      }
      setOficioTexto(gerarTextoPadraoOficio(org.nome));
    }
  }, [selectedOrgao]);

  const handleEnviarOficioEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinatarioEmail.trim() || !oficioTexto.trim()) {
      alert("Preencha o e-mail de destino e o corpo do ofício!");
      return;
    }

    setIsSendingOficio(true);

    // 1. Gerar e preencher link de e-mail native mailto com âncora invisível
    const mailtoSubject = encodeURIComponent(oficioAssunto);
    const mailtoBody = encodeURIComponent(oficioTexto);
    const mailtoUrl = `mailto:${destinatarioEmail.trim()}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setTimeout(() => {
      try {
        const tempLink = document.createElement("a");
        tempLink.href = mailtoUrl;
        tempLink.target = "_blank";
        tempLink.rel = "noopener noreferrer";
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      } catch (err) {
        console.error("Erro ao emitir mailto:", err);
      }

      // 2. Gravar no prontuário do menor de forma legítima
      const org = ORGAOS_COMPETENTES.find(o => o.id === selectedOrgao);
      const orgNome = org ? org.nome : "Órgão Externo";
      
      const logPayload = {
        data: new Date().toISOString(),
        descricao: `📤 OFÍCIO REQUISITÓRIO enviado para órgão [${orgNome}] (${destinatarioEmail.trim()}).\nAssunto: "${oficioAssunto}"\nO expediente foi expedido e arquivado digitalmente.`,
        conselheiro: conselheiroNome || "Conselheiro logado"
      };

      onAddHistoryLog(caseData.id, logPayload);
      setIsSendingOficio(false);
      setOficioEnviadoSucesso(true);
    }, 800);
  };

  const handleAddLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogDesc.trim()) return;

    const logPayload = {
      data: new Date().toISOString(),
      descricao: newLogDesc.trim(),
      conselheiro: conselheiroNome.trim() || "Conselheiro Atendente"
    };

    onAddHistoryLog(caseData.id, logPayload);
    setNewLogDesc("");
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Tem certeza absoluta de que deseja arquivar/excluir permanentemente o caso de ${caseData.criancaNome}?`)) {
      onDelete(caseData.id);
    }
  };

  const handlePrintTrigger = () => {
    // Definimos estilo temporário de impressão e disparamos window.print
    window.print();
  };

  // Renderizar o Termo Oficial de Medidas (Próprio para Impressão limpa)
  if (isPrintingPreview) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto rounded-xl border border-slate-300 shadow-lg space-y-6 text-slate-800 font-serif print:border-none print:shadow-none print:m-0 print:p-0">
        
        {/* Caixa de controles de impressão unicamente visível na tela */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between font-sans print:hidden">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-800 block">Modo de Visualização para Impressão</span>
            <p className="text-[11px] text-amber-700">O documento abaixo foi estruturado em formato retrato padrão de Ofício/Termo de Atendimento.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPrintingPreview(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 rounded border border-slate-200"
            >
              Fechar Visualização
            </button>
            <button 
              onClick={handlePrintTrigger}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Ofício
            </button>
          </div>
        </div>

        {/* Cabeçalho Oficial */}
        <div className="text-center space-y-2 border-b-2 border-slate-800 pb-5">
          <div className="mx-auto w-12 h-12 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center font-bold text-slate-700 text-xs">
            CT
          </div>
          <div className="uppercase font-bold tracking-wide text-xs sm:text-sm">
            República Federativa do Brasil <br />
            Estado de Direito Social • Conselho Tutelar Municipal<br />
            <span className="text-slate-500 font-normal lowercase italic">Criado conforme a Lei Federal nº 8.069/1990 (Art. 131)</span>
          </div>
          <h1 className="text-lg font-bold uppercase mt-4 underline decoration-1">
            TERMO OFICIAL DE ATENDIMENTO E APLICAÇÃO DE MEDIDAS PROTETIVAS
          </h1>
          <div className="text-right text-xs font-mono font-bold text-slate-600">
            Registro Interno: {caseData.numeroRegistro}
          </div>
        </div>

        {/* Corpo do Termo */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify">
          <p>
            Aos <strong>{new Date(caseData.dataHora).toLocaleDateString('pt-BR')}</strong>, na qualidade de comissão do Conselho Tutelar, atuando sob a titularidade de <strong>{caseData.conselheiroResponsavel}</strong>, com base nas atribuições legítimas descritas no Art. 136 da Lei nº 8.069/90 (Estatuto da Criança e do Adolescente - ECA), subscreve-se este assentamento para a proteção integral de:
          </p>

          {/* Dados da Criança */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded font-sans text-xs space-y-1">
            <h4 className="font-bold border-b border-slate-200 pb-1 mb-1">I - IDENTIFICAÇÃO DO INFANTOJUVENIL</h4>
            <div><strong>Criança/Adolescente:</strong> {caseData.criancaNome}</div>
            <div className="grid grid-cols-2 gap-2">
              <div><strong>Nascimento:</strong> {caseData.criancaDataNascimento ? new Date(caseData.criancaDataNascimento).toLocaleDateString('pt-BR') : "Não informada"}</div>
              <div><strong>Idade:</strong> {caseData.criancaIdade} anos</div>
            </div>
            <div><strong>Documento/Certidão:</strong> {caseData.criancaDocumento || "Não informado"}</div>
            <div><strong>Endereço de Residência:</strong> {caseData.criancaEndereco || "Não informado"}</div>
            <div><strong>Estabelecimento de Ensino:</strong> {caseData.criancaEscola || "Não informado"}</div>
          </div>

          {/* Dados dos Respossáveis */}
          <div className="p-3 bg-slate-50 border border-slate-300 rounded font-sans text-xs space-y-1">
            <h4 className="font-bold border-b border-slate-200 pb-1 mb-1">II - QUALIFICAÇÃO DA ENTIDADE FAMILIAR / RESPONSÁVEIS</h4>
            <div><strong>Responsável Principal:</strong> {caseData.responsavelPrincipal.nome} ({caseData.responsavelPrincipal.parentesco})</div>
            <div className="grid grid-cols-2 gap-2">
              <div><strong>Telefone:</strong> {caseData.responsavelPrincipal.telefone || "Não informado"}</div>
              <div><strong>Ocupação:</strong> {caseData.responsavelPrincipal.profissao || "Não declarada"}</div>
            </div>
            {caseData.outroResponsavel && (
              <>
                <div className="border-t border-slate-250 my-1 pt-1"><strong>Co-responsável:</strong> {caseData.outroResponsavel.nome} ({caseData.outroResponsavel.parentesco})</div>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Telefone:</strong> {caseData.outroResponsavel.telefone || "Não informado"}</div>
                  <div><strong>Ocupação:</strong> {caseData.outroResponsavel.profissao || "Não declarada"}</div>
                </div>
              </>
            )}
          </div>

          {/* Violação de Direito */}
          <div className="space-y-1">
            <h4 className="font-bold border-b border-slate-300 pb-1 uppercase text-xs">III - RELATO CIRCUNSTANCIADO DA VIOLAÇÃO DE DIREITOS</h4>
            <div className="font-bold text-slate-700 italic">Espécie de Infração: {caseData.tipoOcorrencia} {caseData.subTipoOcorrencia && ` - ${caseData.subTipoOcorrencia}`}</div>
            <p className="bg-slate-50/50 p-2 border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">{caseData.descricaoOcorrencia}</p>
          </div>

          {/* Medidas de Proteção Aplicadas */}
          <div className="space-y-2">
            <h4 className="font-bold border-b border-slate-300 pb-1 uppercase text-xs">IV - MEDIDAS DE ENQUADRAMENTO E PROTEÇÃO DETERMINADAS (ECA)</h4>
            
            {caseData.medidasCrianca.length === 0 ? (
              <p className="italic text-slate-500">Nenhuma medida específica aplicada diretamente ao menor até o momento.</p>
            ) : (
              <div className="space-y-1.5 pl-4">
                <span className="font-bold block text-xs">Aplicadas à Criança ou Adolescente (Art. 101 do ECA):</span>
                {caseData.medidasCrianca.map((medida, index) => (
                  <div key={index} className="text-xs flex gap-2">
                    <span>•</span> <span>{medida}</span>
                  </div>
                ))}
              </div>
            )}

            {caseData.medidasPais.length > 0 && (
              <div className="space-y-1.5 pl-4 pt-1">
                <span className="font-bold block text-xs">Aplicadas aos Pais ou Responsáveis Legais (Art. 129 do ECA):</span>
                {caseData.medidasPais.map((medida, index) => (
                  <div key={index} className="text-xs flex gap-2">
                    <span>•</span> <span>{medida}</span>
                  </div>
                ))}
              </div>
            )}

            {caseData.outrasProvidencias && (
              <div className="mt-2 text-xs">
                <strong>Encaminhamentos Diversos:</strong>
                <p className="bg-slate-50 p-2 border border-slate-200 mt-1">{caseData.outrasProvidencias}</p>
              </div>
            )}
          </div>

          {/* Encerramento */}
          <p className="pt-2">
            Pelo presente termo, os responsáveis qualificados tomam ciência oficial e formal de todas as medidas especificadas pelo Conselho Tutelar, ficando obrigados a cumprir as determinações sob pena de incorrer em infração administrativa (ECA Art. 249) ou crime de desobediência. Ficam advertidos dos canais de justificativa ou acompanhamento periódico do órgão.
          </p>

          <p className="text-right pt-6">
            ________________________, _____ de __________________ de 2026.
          </p>

          {/* Linhas de Assinaturas */}
          <div className="grid grid-cols-2 gap-10 pt-12 font-sans">
            <div className="text-center text-xs space-y-1">
              <div className="border-t border-slate-500 pt-1.5 font-bold">{caseData.conselheiroResponsavel}</div>
              <div className="text-slate-500 text-[10px]">Conselheiro Tutelar Presidente da Unidade</div>
            </div>
            <div className="text-center text-xs space-y-1">
              <div className="border-t border-slate-500 pt-1.5 font-bold">{caseData.responsavelPrincipal.nome}</div>
              <div className="text-slate-500 text-[10px]">Ciente do Responsável Legal</div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Barra superior de acoes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Prontuário
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor Rápido de Status */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs">
            <span className="font-bold text-slate-500">Status Atendimento:</span>
            <select 
              value={caseData.status}
              onChange={(e) => onUpdateStatus(caseData.id, e.target.value as StatusCase)}
              className="font-bold text-slate-800 outline-none bg-transparent cursor-pointer"
            >
              <option value="Aberto">🟢 Aberto (Novo)</option>
              <option value="Em Acompanhamento">🟡 Em Acompanhamento</option>
              <option value="Concluido">⚪ Concluído / Fechado</option>
            </select>
          </div>

          <button 
            onClick={() => setIsPrintingPreview(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" /> Termo Oficial
          </button>

          <button 
            onClick={() => {
              setOficioEnviadoSucesso(false);
              setShowOficioModal(true);
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            title="Enviar Ofício Formal de Atendimento via E-mail aos órgãos competentes"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-200" /> Enviar Ofício por E-mail
          </button>

          <button 
            onClick={() => onEdit(caseData)}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <Edit className="w-3.5 h-3.5" /> Editar Ficha
          </button>

          <button 
            onClick={handleDeleteClick}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Arquivar
          </button>
        </div>

      </div>

      {/* Grid de Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Painel Esquerdo: Ficha Clínica (Criança + Responsáveis) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cartao Dados da Criança */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Dados do Criança ou Adolescente
              </h3>
              <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                Nº {caseData.numeroRegistro}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Nome Completo</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  {maskField(caseData.criancaNome)}
                  {privacyMode && (
                    <span className="text-[9px] bg-amber-50 text-amber-700 px-1 py-0.5 rounded border border-amber-200/50 font-bold select-none">
                      🔒 LGPD Protegido
                    </span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">Idade</span>
                  <span className="font-semibold text-slate-700">{caseData.criancaIdade} anos</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Gênero</span>
                  <span className="font-semibold text-slate-700">{caseData.criancaGen}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 block mb-0.5">Data de Nascimento</span>
                <span className="font-semibold text-slate-700">
                  {privacyMode ? "••/••/••••" : (caseData.criancaDataNascimento ? new Date(caseData.criancaDataNascimento).toLocaleDateString('pt-BR') : "Não informada")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Documentação Civil</span>
                <span className="font-semibold text-slate-700">{maskField(caseData.criancaDocumento) || "Sem documento recolhido"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block mb-0.5">Endereço de Residência</span>
                  <span className="font-semibold text-slate-700 leading-normal">{maskField(caseData.criancaEndereco) || "Endereço não cadastrado"}</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block mb-0.5">Escola de Frequência</span>
                  <span className="font-semibold text-slate-700 leading-normal">{caseData.criancaEscola || "Não estuda / Evadido"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cartao Responsáveis */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Heart className="w-4 h-4 text-emerald-600" />
              Responsáveis e Vínculos Familiares
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Resp 1 */}
              <div className="space-y-2 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Responsável Principal</span>
                <div className="font-bold text-slate-800">{maskField(caseData.responsavelPrincipal.nome)}</div>
                <div className="grid grid-cols-2 gap-1 mt-1 text-[11px] text-slate-600">
                  <div><strong>Parentesco:</strong> {caseData.responsavelPrincipal.parentesco}</div>
                  <div><strong>Telefone:</strong> {maskField(caseData.responsavelPrincipal.telefone) || "Não cadastrado"}</div>
                </div>
                {caseData.responsavelPrincipal.profissao && (
                  <div className="text-[11px] text-slate-500 mt-1"><strong>Profissão:</strong> {caseData.responsavelPrincipal.profissao}</div>
                )}
              </div>

              {/* Resp 2 operacionel */}
              {caseData.outroResponsavel ? (
                <div className="space-y-2 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Coresponsável</span>
                  <div className="font-bold text-slate-800">{maskField(caseData.outroResponsavel.nome)}</div>
                  <div className="grid grid-cols-2 gap-1 mt-1 text-[11px] text-slate-600">
                    <div><strong>Parentesco:</strong> {caseData.outroResponsavel.parentesco}</div>
                    <div><strong>Telefone:</strong> {maskField(caseData.outroResponsavel.telefone) || "Não cadastrado"}</div>
                  </div>
                  {caseData.outroResponsavel.profissao && (
                    <div className="text-[11px] text-slate-500 mt-1"><strong>Profissão:</strong> {caseData.outroResponsavel.profissao}</div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed border-slate-200 rounded-xl p-4 text-center">
                  <p className="text-[11px] text-slate-400">Nenhum outro responsável financeiro ou paterno cadastrado no prontuário.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cartao Relato e Ocorrência */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-rose-500" />
              Súmula do Atendimento & Violação Identificada
            </h3>

            <div className="text-xs space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md font-semibold border border-rose-100">
                  {caseData.tipoOcorrencia}
                </span>
                {caseData.subTipoOcorrencia && (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold border border-slate-200">
                    {caseData.subTipoOcorrencia}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold block mb-1">Descrição do Fato Notificado:</span>
                <p className="bg-slate-50/50 p-4 border border-slate-150 rounded-xl text-slate-700 leading-relaxed font-sans whitespace-pre-wrap text-xs">
                  {caseData.descricaoOcorrencia}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-slate-650">
                <div>
                  <strong>Denunciante / Origem:</strong> <br />
                  {caseData.denuncianteSigilo ? (
                    <span className="text-rose-600 font-bold">🔒 Anônima (Sigilo protegido por Lei)</span>
                  ) : (
                    <span>{maskField(caseData.denuncianteNome) || "Comunicação de Ofício"} {caseData.denuncianteTelefone && ` - ${maskField(caseData.denuncianteTelefone)}`}</span>
                  )}
                </div>
                <div>
                  <strong>Data de Registro:</strong><br />
                  <span>{new Date(caseData.dataHora).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Medidas do ECA + Histórico de Acompanhamento */}
        <div className="space-y-6">
          
          {/* Cartao Medidas Aplicadas */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              Medidas de Proteção (ECA)
            </h3>

            <div className="text-xs space-y-3">
              {/* Medidos do Art 101 */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">Criança/Adolescente (Art. 101):</span>
                {caseData.medidasCrianca && caseData.medidasCrianca.length > 0 ? (
                  <div className="space-y-1">
                    {caseData.medidasCrianca.map((med, i) => (
                      <div key={i} className="bg-blue-50/40 text-blue-800 p-2 rounded border border-blue-100 leading-normal text-[11px]">
                        {med}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px] block">Nenhuma medida específica aplicada ao menor.</span>
                )}
              </div>

              {/* Medidas do Art 129 */}
              <div className="space-y-1.5 mt-2">
                <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">Pais/Responsável (Art. 129):</span>
                {caseData.medidasPais && caseData.medidasPais.length > 0 ? (
                  <div className="space-y-1">
                    {caseData.medidasPais.map((med, i) => (
                      <div key={i} className="bg-emerald-50/40 text-emerald-800 p-2 rounded border border-emerald-100 leading-normal text-[11px]">
                        {med}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px] block">Nenhuma medida aplicada para os responsáveis.</span>
                )}
              </div>

              {caseData.outrasProvidencias && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-600 block text-[11px]">Providências de Rede / Ofícios:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded text-[11px] leading-normal">{caseData.outrasProvidencias}</p>
                </div>
              )}
            </div>
          </div>

          {/* Seção Linha do Tempo / Histórico Completo */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                Histórico de Acompanhamento
              </span>
              <span className="px-2 py-0.5 text-[10px] bg-purple-50 text-purple-700 font-bold rounded-full">
                {caseData.historico.length} registros
              </span>
            </h3>

            {/* Linha vertical do tempo */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {caseData.historico.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">Nenhum evento registrado. Adicione um parecer abaixo.</p>
              ) : (
                <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-4 py-1">
                  {caseData.historico.map((log) => (
                    <div key={log.id} className="relative text-xs">
                      {/* Ponto na timeline */}
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-600 border border-white" />
                      
                      <div className="space-y-1 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between font-semibold text-[10px] text-slate-400">
                          <span>{new Date(log.data).toLocaleString('pt-BR')}</span>
                          <span className="text-purple-600 truncate max-w-[100px]">{log.conselheiro}</span>
                        </div>
                        <p className="text-slate-700 leading-normal text-[11px] font-sans text-justify">
                          {log.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form de Inclusão de Log */}
            <form onSubmit={handleAddLogSubmit} className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Registrar Novo Parecer / Ação</span>
              
              <textarea 
                rows={2}
                required
                value={newLogDesc}
                onChange={(e) => setNewLogDesc(e.target.value)}
                placeholder="Descreva nova visita, ofício encaminhado ou atendimento familiar..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-100 font-sans"
              />

              <div className="flex gap-2 justify-between">
                <input 
                  type="text" 
                  value={conselheiroNome}
                  onChange={(e) => setConselheiroNome(e.target.value)}
                  placeholder="Nome do conselheiro de plantão"
                  className="px-2 py-1.5 text-[11.5px] border border-slate-200 rounded-md bg-slate-50 w-2/3"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition shadow-xs whitespace-nowrap self-center"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>

      {/* MODAL DE ENVIO DE OFÍCIO POR E-MAIL */}
      {showOficioModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-all duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Mail className="w-5 h-5 text-indigo-200 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-none">Expedição Eletrônica de Ofício</h3>
                  <span className="text-[10px] opacity-80 font-semibold block mt-1 uppercase tracking-wider">
                    Conselho Tutelar • Currais Novos / RN
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowOficioModal(false)}
                className="text-white/70 hover:text-white bg-white/15 hover:bg-white/20 p-1.5 rounded-full text-xs font-bold transition w-7 h-7 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {oficioEnviadoSucesso ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-100">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h4 className="font-black text-slate-800 text-base">Ofício Registrado no Prontuário!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    O sistema de envio tentou acionar o seu cliente de e-mail padrão. Caso ele não tenha aberto ou o e-mail não tenha sido enviado devido a limites do seu navegador, use as opções rápidas abaixo para garantir a entrega segura:
                  </p>
                </div>

                {/* Copiar Campos Manualmente */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 text-left space-y-3 max-w-lg mx-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80 pb-1.5 flex items-center gap-1.5">
                    ⚙️ Copiar dados para preencher manualmente:
                  </p>
                  
                  {/* Destinatário */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-600 truncate"><strong>Para (Destinatário):</strong> {destinatarioEmail}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(destinatarioEmail, setCopiedEmail)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all shrink-0 cursor-pointer ${copiedEmail ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
                    >
                      {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedEmail ? "Copiado!" : "Copiar"}
                    </button>
                  </div>

                  {/* Assunto */}
                  <div className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-slate-600 truncate"><strong>Assunto:</strong> {oficioAssunto}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(oficioAssunto, setCopiedAssunto)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 transition-all shrink-0 cursor-pointer ${copiedAssunto ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
                    >
                      {copiedAssunto ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedAssunto ? "Copiado!" : "Copiar"}
                    </button>
                  </div>

                  {/* Conteúdo Completo */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-extrabold max-w-[280px]">Copiar o rascunho completo do ofício</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(oficioTexto, setCopiedTexto)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${copiedTexto ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                    >
                      {copiedTexto ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTexto ? "Texto Copiado!" : "Copiar Texto do Ofício"}
                    </button>
                  </div>
                </div>

                {/* Abrir em Webmails Populares */}
                <div className="space-y-3 max-w-sm mx-auto">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    🌐 Abrir rascunho no navegador:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinatarioEmail)}&su=${encodeURIComponent(oficioAssunto)}&body=${encodeURIComponent(oficioTexto)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 rounded-xl text-xs font-bold leading-none flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> Gmail Web
                    </a>
                    <a
                      href={`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(destinatarioEmail)}&subject=${encodeURIComponent(oficioAssunto)}&body=${encodeURIComponent(oficioTexto)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 rounded-xl text-xs font-bold leading-none flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> Outlook Web
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      const mailtoSubject = encodeURIComponent(oficioAssunto);
                      const mailtoBody = encodeURIComponent(oficioTexto);
                      window.location.href = `mailto:${destinatarioEmail.trim()}?subject=${mailtoSubject}&body=${mailtoBody}`;
                    }}
                    type="button"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                  <button
                    onClick={() => {
                      setShowOficioModal(false);
                      setOficioEnviadoSucesso(false);
                    }}
                    type="button"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Concluído
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnviarOficioEmail} className="flex-1 overflow-y-auto max-h-[80vh] p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  ⚠️ <strong>Aviso legal:</strong> Em conformidade com o Estatuto da Criança e do Adolescente (ECA) e com a LGPD, o envio eletrônico de ofícios deve ser direcionado exclusivamente aos e-mails oficiais dos órgãos competentes preservando o sigilo de dados sensíveis.
                </p>

                {/* Seletor do Órgão */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Órgão Destinatário Competente</label>
                  <select
                    value={selectedOrgao}
                    onChange={(e) => setSelectedOrgao(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-bold text-slate-700 pointer-events-auto cursor-pointer"
                  >
                    {ORGAOS_COMPETENTES.map((org) => (
                      <option key={org.id} value={org.id}>
                        🏢 {org.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recomendação de Envio baseada no Órgão */}
                {selectedOrgao && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-800 flex items-start gap-2">
                    <span className="text-base select-none">💡</span>
                    <div>
                      <strong>Foco Recomendado:</strong> {ORGAOS_COMPETENTES.find(o => o.id === selectedOrgao)?.recomendacao}
                    </div>
                  </div>
                )}

                {/* E-mail de Destino */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Endereço de E-mail Institucional</label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@orgao.gov.br"
                    value={destinatarioEmail}
                    onChange={(e) => setDestinatarioEmail(e.target.value)}
                    disabled={selectedOrgao !== "custom"}
                    className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-bold text-slate-700 outline-none ${selectedOrgao !== "custom" && "opacity-70 cursor-not-allowed"}`}
                  />
                  {selectedOrgao !== "custom" && (
                    <span className="text-[9px] text-slate-400 block font-medium">Este e-mail está previamente homologado pela central administrativa do conselho.</span>
                  )}
                </div>

                {/* Assunto */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Assunto do E-mail</label>
                  <input
                    type="text"
                    required
                    value={oficioAssunto}
                    onChange={(e) => setOficioAssunto(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-bold text-slate-700 outline-none"
                  />
                </div>

                {/* Editor do Ofício */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Corpo do Ofício (Editável/Personalizável)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const org = ORGAOS_COMPETENTES.find(o => o.id === selectedOrgao);
                        if (org) setOficioTexto(gerarTextoPadraoOficio(org.nome));
                      }}
                      className="text-[10px] text-indigo-600 font-extrabold hover:underline cursor-pointer"
                    >
                      Restaurar Texto Padrão
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    required
                    value={oficioTexto}
                    onChange={(e) => setOficioTexto(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs font-mono text-slate-700 outline-none leading-relaxed"
                  />
                </div>

                {/* Linha de Envio */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-[10px] text-slate-400 leading-normal max-w-sm">
                    <strong>Expedição Digital Automatizada:</strong> Ao clicar no botão de envio, o sistema registrará permanentemente o parecer no prontuário e abrirá seu cliente oficial de e-mail.
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowOficioModal(false)}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition shrink-0"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingOficio}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer transition shrink-0 hover:scale-102 active:scale-98"
                    >
                      {isSendingOficio ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Expedindo...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Transmitir Ofício</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
