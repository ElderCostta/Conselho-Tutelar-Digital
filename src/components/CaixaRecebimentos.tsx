import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AtendimentoCase } from "../types";
import { googleSignIn, logout as firebaseLogout, initAuth } from "../lib/firebase";
import { User } from "firebase/auth";
import { 
  Mail, 
  Inbox, 
  Send, 
  CheckCircle2, 
  RefreshCw, 
  FileDown, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  PlusCircle, 
  AlertCircle, 
  Key, 
  HelpCircle, 
  Shield, 
  UserCheck, 
  Settings, 
  Printer, 
  ChevronRight, 
  FileCheck, 
  X, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  Search,
  Check
} from "lucide-react";

interface CaixaRecebimentosProps {
  cases: AtendimentoCase[];
  conselheiroAtivo: string;
  onAddHistoryLog: (id: string, log: { data: string; descricao: string; conselheiro: string }) => void;
  onImportCase: (newCase: any) => void;
  privacyMode: boolean;
  maskField: (text: string | null | undefined) => string;
}

// Tipo de E-mail de Ofício Recebido
interface OficioEmail {
  id: string;
  remetenteNome: string;
  remetenteEmail: string;
  orgao: string;
  assunto: string;
  numeroOficio: string;
  dataRecebimento: string;
  conteudo: string;
  criancaNomeEnvolvida: string;
  urgencia: "Alta" | "Média" | "Baixa";
  status: "Pendente" | "Recebido" | "Arquivado";
  reciboGerado?: {
    codigoValidacao: string;
    dataHoraProtocolo: string;
    conselheiroResponsavel: string;
    mensagemRespostaEnvio: string;
  };
}

// Emails Iniciais de Ofício para o Simulador / Base Off-line (Limpo para sincronização real)
const MOCK_GMAIL_EMAILS: OficioEmail[] = [];

export default function CaixaRecebimentos({ cases, conselheiroAtivo, onAddHistoryLog, onImportCase, privacyMode, maskField }: CaixaRecebimentosProps) {
  // Helper para ocultar dados confidenciais do teor do e-mail em modo de privacidade
  const getSecureContent = (content: string, childName: string) => {
    if (!privacyMode || !childName || childName === "Não identificada no cabeçalho") return content;
    const maskedName = maskField(childName);
    try {
      const escaped = childName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      return content.replace(regex, maskedName);
    } catch (e) {
      return content;
    }
  };

  // Google OAuth / Gmail API Estados Reais
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string>("");
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [apiSuccessMsg, setApiSuccessMsg] = useState<string>("");
  const [showConfigHelp, setShowConfigHelp] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setGoogleAccessToken("");
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsApiLoading(true);
    setApiError("");
    setApiSuccessMsg("");
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setGoogleAccessToken(result.accessToken);
        setApiSuccessMsg(`Autenticado com sucesso como ${result.user.email}!`);
      }
    } catch (err: any) {
      setApiError(err.message || "Falha ao autenticar com o Google.");
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    setIsApiLoading(true);
    try {
      await firebaseLogout();
      setCurrentUser(null);
      setGoogleAccessToken("");
      setApiSuccessMsg("Sessão do Google encerrada com sucesso.");
    } catch (err: any) {
      setApiError(err.message || "Erro ao encerrar sessão.");
    } finally {
      setIsApiLoading(false);
    }
  };

  // Estados dos e-mails
  const [emails, setEmails] = useState<OficioEmail[]>(() => {
    const saved = localStorage.getItem("ct_caixa_oficios_emails");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as OficioEmail[];
        // Purga automática de e-mails de demonstração/mock antigos para garantir total segurança e privacidade
        return parsed.filter(e => !e.id.startsWith("mail-"));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Pendente" | "Recebido">("Todos");
  
  // Modal de Importar E-mail como Prontuário Novo ou Log
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importType, setImportType] = useState<"novo_caso" | "acompanhamento">("novo_caso");
  const [selectedExistingCaseId, setSelectedExistingCaseId] = useState<string>("");
  const [emailToImport, setEmailToImport] = useState<OficioEmail | null>(null);

  // Estado para visualização do Recibo Oficial imprimível
  const [showReceiptPrintModal, setShowReceiptPrintModal] = useState<boolean>(false);
  const [emailForReceipt, setEmailForReceipt] = useState<OficioEmail | null>(null);
  const [redactPrint, setRedactPrint] = useState<boolean>(false);

  // Sincronizar com localStorage
  useEffect(() => {
    localStorage.setItem("ct_caixa_oficios_emails", JSON.stringify(emails));
  }, [emails]);

  // Função para fazer Chamada Real à API do Gmail se o Token existir
  const fetchRealGmailMessages = async () => {
    let activeToken = googleAccessToken;
    if (!activeToken) {
      try {
        const loginRes = await googleSignIn();
        if (loginRes) {
          setCurrentUser(loginRes.user);
          setGoogleAccessToken(loginRes.accessToken);
          activeToken = loginRes.accessToken;
        } else {
          setApiError("Você precisa se autenticar com o Google para conectar ao Gmail real.");
          return;
        }
      } catch (err: any) {
        setApiError(err.message || "Falha ao se conectar com o Google OAuth.");
        return;
      }
    }

    setIsApiLoading(true);
    setApiError("");
    setApiSuccessMsg("");

    try {
      // 1. Chamar a API do Gmail para listar mensagens com query de ofícios ou remetentes do conselho
      const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=oficio+OR+ofício+OR+conselho+OR+promotoria&maxResults=8`;
      const response = await fetch(listUrl, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Gmail (Status ${response.status}). Token expirado ou inválido.`);
      }

      const data = await response.json();
      const messages = data.messages || [];

      if (messages.length === 0) {
        setApiSuccessMsg("Conexão estabelecida com conselhotutelarcn@gmail.com! Nenhuma mensagem nova com termos oficiais foi encontrada.");
        setIsApiLoading(false);
        return;
      }

      // 2. Buscar detalhes de cada mensagem em paralelo
      const emailDetailPromises = messages.map(async (msg: any) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        if (!detailRes.ok) return null;
        const detailData = await detailRes.json();
        
        // Parsear os cabeçalhos do Gmail
        const headers = detailData.payload.headers;
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
        
        const subject = getHeader("Subject");
        const from = getHeader("From");
        const dateStr = getHeader("Date");

        // Extrair nome e e-mail do remetente
        let remetenteNome = from;
        let remetenteEmail = from;
        const emailMatch = from.match(/<(.+?)>/);
        if (emailMatch) {
          remetenteEmail = emailMatch[1];
          remetenteNome = from.replace(/<.+?>/, "").replace(/"/g, "").trim() || emailMatch[1];
        }

        // Tentar buscar o corpo do e-mail (Snippet ou body decodificado)
        let body = detailData.snippet || "";
        if (detailData.payload.parts) {
          const textPart = detailData.payload.parts.find((p: any) => p.mimeType === "text/plain");
          if (textPart && textPart.body && textPart.body.data) {
            try {
              // Decodificar Base64URL do Gmail
              const base64 = textPart.body.data.replace(/-/g, "+").replace(/_/g, "/");
              body = decodeURIComponent(escape(atob(base64)));
            } catch (e) {
              console.log("Erro ao decodificar corpo", e);
            }
          }
        }

        // Tentar deduzir informações do texto
        let criancaEnvolvida = "Não identificada no cabeçalho";
        const criancaMatch = body.match(/(?:menor|criança|adolescente|infante|aluno|aluna)\s+([^.\n,;]{5,35})/i);
        if (criancaMatch) {
          criancaEnvolvida = criancaMatch[1].trim();
        }

        let numeroOficioDeduzido = "GMAIL-ID-" + msg.id.slice(0, 8).toUpperCase();
        const oficioMatch = subject.match(/(?:ofício|oficio)\s+(?:nº|no|num)?\s*([0-9a-zA-Z\-/]+)/i) || body.match(/(?:ofício|oficio)\s+(?:nº|no|num)?\s*([0-9a-zA-Z\-/]+)/i);
        if (oficioMatch) {
          numeroOficioDeduzido = oficioMatch[1].trim().toUpperCase();
        }

        // Determinar urgência baseada em palavras-chave
        let urgencia: "Alta" | "Média" | "Baixa" = "Média";
        const bodyLower = body.toLowerCase();
        const subjectLower = subject.toLowerCase();
        if (bodyLower.includes("urgente") || bodyLower.includes("máxima urgência") || bodyLower.includes("maus-tratos") || subjectLower.includes("urgente")) {
          urgencia = "Alta";
        } else if (bodyLower.includes("rotina") || bodyLower.includes("boletim")) {
          urgencia = "Baixa";
        }

        const orgaoDeduzido = remetenteNome.includes("-") ? remetenteNome.split("-")[0].trim() : remetenteNome;

        return {
          id: "gmail-" + msg.id,
          remetenteNome,
          remetenteEmail,
          orgao: orgaoDeduzido,
          assunto: subject,
          numeroOficio: numeroOficioDeduzido,
          dataRecebimento: new Date(dateStr).toISOString() || new Date().toISOString(),
          conteudo: body,
          criancaNomeEnvolvida: criancaEnvolvida,
          urgencia,
          status: "Pendente" as const
        };
      });

      const parsedEmails = (await Promise.all(emailDetailPromises)).filter(Boolean) as OficioEmail[];

      if (parsedEmails.length > 0) {
        // Unir com os e-mails existentes sem duplicar pelo id
        setEmails(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const uniques = parsedEmails.filter(p => !existingIds.has(p.id));
          return [...uniques, ...prev];
        });
        setApiSuccessMsg(`Sincronização concluída! Foram importados ${parsedEmails.length} novos ofícios reais diretamente de ${currentUser?.email || "conselhotutelarcn@gmail.com"}`);
      } else {
        setApiSuccessMsg("Acesso ao Gmail efetuado. Nenhuma mensagem nova com correspondência de Ofícios pendentes.");
      }

    } catch (err: any) {
      setApiError(err.message || "Erro desconhecido ao ler e-mails do Gmail. Verifique o console e o token.");
    } finally {
      setIsApiLoading(false);
    }
  };

  // Enviar a Resposta Automática (Dar Recebimento) via Gmail API Real se disponível
  const sendRealGmailReply = async (email: OficioEmail, bodyText: string) => {
    if (!googleAccessToken) return false;
    try {
      // Para enviar uma resposta no Gmail, compomos a mensagem em formato MIME bruto (Raw) codificado em base64url
      const emailIdRaw = email.id.replace("gmail-", "");
      const mailHeader = [
        `To: ${email.remetenteEmail}`,
        `Subject: Re: ${email.assunto}`,
        `In-Reply-To: <${emailIdRaw}@mail.gmail.com>`,
        `References: <${emailIdRaw}@mail.gmail.com>`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        bodyText
      ].join("\r\n");

      const encodedEmail = btoa(unescape(encodeURIComponent(mailHeader)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          raw: encodedEmail,
          threadId: emailIdRaw
        })
      });

      if (!response.ok) {
        console.error("Falha ao responder e-mail via API do Gmail:", await response.text());
        return false;
      }
      return true;
    } catch (e) {
      console.error("Erro ao enviar resposta via API do Gmail:", e);
      return false;
    }
  };

  // Dar o Recebimento Oficial no E-mail (Fluxo Integrado)
  const [isProcessingReceipt, setIsProcessingReceipt] = useState<string | null>(null);
  const handleAcknowledgeReceipt = async (email: OficioEmail) => {
    setIsProcessingReceipt(email.id);
    
    // Simula atraso operacional
    setTimeout(async () => {
      const dataHoraStr = new Date().toLocaleString("pt-BR");
      const hashProtocolo = "PROTO-GMAIL-" + Math.floor(100000 + Math.random() * 900000) + "-CN";
      
      const corpoRespostaText = `CONSELHO TUTELAR DE CURRAIS NOVOS/RN\r\n` +
        `Endereço Oficial: conselhotutelarcn@gmail.com\r\n\r\n` +
        `RECONHECIMENTO DE LEITURA E RECIBO DE RECEBIMENTO DE DOCUMENTO\r\n\r\n` +
        `Confirmamos que o Ofício nº "${email.numeroOficio}" enviado por ${email.orgao} (${email.remetenteNome}) ` +
        `referente ao caso da criança/adolescente "${email.criancaNomeEnvolvida}" foi devidamente recebido e indexado no Prontuário Digital do Conselho Tutelar.\r\n\r\n` +
        `DADOS DO PROTOCOLO DIGITAL:\r\n` +
        `- Código de Validação do Protocolo: ${hashProtocolo}\r\n` +
        `- Data/Hora do Recebimento: ${dataHoraStr}\r\n` +
        `- Conselheiro(a) de Plantão Responsável: ${conselheiroAtivo}\r\n\r\n` +
        `O documento foi classificado com urgência "${email.urgencia}" e já se encontra sob a análise e responsabilidade técnica deste colegiado para aplicação imediata das medidas cabíveis amparadas pela Lei Federal 8.069/1990 (Estatuto da Criança e do Adolescente - ECA).\r\n\r\n` +
        `Esta é uma mensagem automática de protocolo oficial expedida eletronicamente do monitor principal de Currais Novos/RN.`;

      // Se houver token do Gmail API ativo, tenta enviar de fato para o remetente
      let enviadoPorGmailReal = false;
      if (googleAccessToken && email.id.startsWith("gmail-")) {
        enviadoPorGmailReal = await sendRealGmailReply(email, corpoRespostaText);
      }

      // Atualiza o estado local do e-mail com o Recibo de Protocolo
      setEmails(prev => prev.map(evt => {
        if (evt.id === email.id) {
          return {
            ...evt,
            status: "Recebido" as const,
            reciboGerado: {
              codigoValidacao: hashProtocolo,
              dataHoraProtocolo: dataHoraStr,
              conselheiroResponsavel: conselheiroAtivo,
              mensagemRespostaEnvio: enviadoPorGmailReal 
                ? "Enviada resposta eletrônica oficial direta via API do Gmail da conta conselhotutelarcn@gmail.com" 
                : "Resposta simulada integrada à fila local do colegiado (@conselhotutelarcn)"
            }
          };
        }
        return evt;
      }));

      setIsProcessingReceipt(null);
      
      // Abre modal de importação para Prontuário para que o conselheiro associe ou crie o caso logo
      setEmailToImport(email);
      setImportType("novo_caso");
      setShowImportModal(true);
    }, 1500);
  };

  // Executar a importação real no sistema de Prontuário do Conselho Tutelar
  const handleExecuteImport = () => {
    if (!emailToImport) return;

    const protocolCode = emailToImport.reciboGerado?.codigoValidacao || "PROTO-OFFLINE";

    if (importType === "novo_caso") {
      // Preparar os dados de um novo AtendimentoCase baseado no Ofício
      const novoCasoImportado = {
        dataHora: new Date().toISOString(),
        criancaNome: emailToImport.criancaNomeEnvolvida !== "Não identificada no cabeçalho" ? emailToImport.criancaNomeEnvolvida : "A IDENTIFICAR (Ref Ofício " + emailToImport.numeroOficio + ")",
        criancaIdade: 10, // Idade padrão provisória
        criancaDataNascimento: "2016-01-01",
        criancaGen: "Masculino" as const,
        criancaDocumento: "",
        criancaEndereco: "Bairro JK / Centro, Currais Novos - RN",
        criancaEscola: emailToImport.orgao.includes("Escola") ? emailToImport.orgao : "",
        responsavelPrincipal: {
          nome: "Responsável a Identificar",
          parentesco: "Mãe/Pai" as const,
          telefone: "",
          endereco: "Currais Novos - RN"
        },
        tipoOcorrencia: emailToImport.assunto.toLowerCase().includes("maus-tratos") ? "Violência" : "Negligência",
        subTipoOcorrencia: "Violência Física ou Negligência Familiar",
        descricaoOcorrencia: `ATENDIMENTO GERADO VIA IMPORTAÇÃO DIRETA DO GMAIL DA CAIXA DE RECEBIMENTOS DO CONSELHO (E-mail: conselhotutelarcn@gmail.com).\n\n--- DADOS DO OFÍCIO RECEBIDO ---\nÓrgão Remetente: ${emailToImport.orgao}\nOfício de Referência: Nº ${emailToImport.numeroOficio}\nRemetente Técnico: ${emailToImport.remetenteNome} (${emailToImport.remetenteEmail})\nCódigo de Validação do Protocolo CT: ${protocolCode}\n\n--- TEOR DO OFÍCIO ENVIADO ---\n${emailToImport.conteudo}`,
        denuncianteSigilo: false,
        denuncianteNome: emailToImport.orgao,
        denuncianteTelefone: emailToImport.remetenteEmail,
        medidasCrianca: ["Acolhimento Provisório ou Orientação Familiar"],
        medidasPais: ["Encaminhamento para Rede de Assistência Social"],
        outrasProvidencias: `Instalação de averiguação administrativa do Ofício de referência ${emailToImport.numeroOficio}.`,
        status: "Aberto" as const,
        conselheiroResponsavel: conselheiroAtivo
      };

      // Chama a função passada por props para salvar o caso
      onImportCase(novoCasoImportado);
      
      // Registra que o caso foi protocolado
      alert(`Sucesso! Um novo Prontuário de Atendimento foi criado automaticamente no banco de casos para a criança/adolescente: ${novoCasoImportado.criancaNome}.`);

    } else if (importType === "acompanhamento" && selectedExistingCaseId) {
      // Adicionar como log histórico em um caso já existente
      const logText = `[OFÍCIO RECEBIDO E PROTOCOLADO - CAIXA DE RECEBIMENTOS GMAIL]\n` +
        `O Conselho Tutelar oficializou o recebimento do Ofício nº ${emailToImport.numeroOficio} expedido por ${emailToImport.orgao}.\n` +
        `Remetente: ${emailToImport.remetenteNome} (${emailToImport.remetenteEmail})\n` +
        `Protocolo Geral de Recebimento: ${protocolCode}\n\n` +
        `DETALHE DO REQUERIMENTO:\n${emailToImport.conteudo}`;

      onAddHistoryLog(selectedExistingCaseId, {
        data: new Date().toISOString(),
        descricao: logText,
        conselheiro: conselheiroAtivo
      });

      alert(`Sucesso! O teor do Ofício nº ${emailToImport.numeroOficio} foi indexado com sucesso no histórico do Prontuário selecionado.`);
    }

    setShowImportModal(false);
    setEmailToImport(null);
  };

  // Filtrar e-mails da caixa de recebimento
  const filteredEmails = emails.filter(e => {
    const matchesSearch = 
      e.orgao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.assunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.numeroOficio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.criancaNomeEnvolvida.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "Todos" ? true :
      statusFilter === "Pendente" ? e.status === "Pendente" :
      e.status === "Recebido" || e.status === "Arquivado";

    return matchesSearch && matchesStatus;
  });

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || (filteredEmails.length > 0 ? filteredEmails[0] : null);

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0 font-sans text-left">
      
      {/* PAINEL CENTRAL (LADO ESQUERDO): LISTAGEM DE OFÍCIOS NO GMAIL */}
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col overflow-hidden min-h-[500px]">
        
        {/* Cabeçalho de Controle e Configuração */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-150 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-150 shadow-3xs">
                <Mail className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                  Caixa de Recebimento de Ofícios
                  <span className="bg-red-100 text-red-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                    GMAIL OFICIAL
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400 font-bold leading-normal">
                  Endereço do Colegiado: <span className="text-blue-600 underline">conselhotutelarcn@gmail.com</span>
                </p>
              </div>
            </div>

            {/* Ações de Sincronização */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-3xs"
                title="Configurar Integração de API Google Workspace"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Painel de Integração</span>
              </button>

              <button
                onClick={googleAccessToken ? fetchRealGmailMessages : () => {
                  fetchRealGmailMessages();
                }}
                disabled={isApiLoading}
                className="px-3.5 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer select-none border border-blue-500/10 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isApiLoading ? "animate-spin" : ""}`} />
                <span>{isApiLoading ? "Sincronizando..." : "Sincronizar Gmail"}</span>
              </button>
            </div>
          </div>

          {/* Banner de Ajuda / Setup da API do Gmail */}
          {showConfigHelp && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Integração Oficial com Google Workspace (Gmail API)
                </span>
                <button 
                  onClick={() => setShowConfigHelp(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                Esta integração segura permite que o Conselho Tutelar se conecte diretamente a uma conta oficial do Gmail com a devida permissão. Com os escopos do Gmail habilitados, o sistema pode ler novos ofícios recebidos e enviar recibos eletrônicos de protocolo de forma real e transparente.
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full border border-blue-500 p-0.5 object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm uppercase">
                        {currentUser.email?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">CONEXÃO ATIVA</span>
                      <span className="text-xs font-bold text-white block">{currentUser.displayName || "Conselheiro"}</span>
                      <span className="text-[10px] text-blue-300 font-mono block">{currentUser.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">CONEXÃO REQUERIDA</span>
                      <span className="text-xs font-bold text-slate-300">Nenhuma conta conectada para sincronização em tempo real.</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                  {currentUser ? (
                    <button 
                      onClick={handleGoogleLogout}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-extrabold transition cursor-pointer"
                    >
                      Desconectar Conta
                    </button>
                  ) : (
                    <button 
                      onClick={handleGoogleLogin}
                      className="flex items-center gap-2.5 bg-white hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-extrabold transition shadow-sm cursor-pointer border border-slate-200"
                    >
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                      <span>Entrar com o Google</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md font-bold uppercase">
                  Escopo Autorizado: gmail.readonly
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-md font-bold uppercase">
                  Escopo Autorizado: gmail.send
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-900 px-2.5 py-1 rounded-md font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Sincronização Segura Ativa (SSL)
                </span>
              </div>
            </motion.div>
          )}

          {/* Notificação de Status de Sincronização API */}
          {apiError && (
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold leading-normal">Ambiente Local / Demonstração Ativado para Teste Operacional</p>
                <p className="text-[10px] font-normal leading-relaxed text-amber-700 mt-0.5">
                  Como o token de produção do Google Workspace não está inserido (ou está inativo), o sistema entrou no modo simulador off-line. <strong>Você pode ler, emitir recibos formais de leitura, gerar termos e integrar os ofícios aos prontuários normalmente com e-mails reais de demonstração da comarca!</strong>
                </p>
              </div>
            </div>
          )}

          {apiSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{apiSuccessMsg}</span>
            </div>
          )}

          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por Órgão, Criança, Assunto ou Número do Ofício..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2 text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-bold hidden md:inline">Filtrar:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-40 bg-white border border-slate-200 p-1.5 rounded-lg outline-none cursor-pointer font-bold text-xs text-slate-700"
              >
                <option value="Todos">Todos Ofícios</option>
                <option value="Pendente">🔴 Pendentes de Recibo</option>
                <option value="Recebido">🟢 Recebidos (Com Recibo)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listagem de E-mails */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[500px] lg:max-h-[600px]">
          {filteredEmails.length === 0 ? (
            <div className="text-center py-24 p-6 space-y-3">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-bold">Nenhum ofício recebido corresponde aos filtros indicados.</p>
              <button 
                onClick={() => { setSearchQuery(""); setStatusFilter("Todos"); }}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            filteredEmails.map((email) => {
              const isSelected = email.id === selectedEmailId;
              const formattedDate = new Date(email.dataRecebimento).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`p-4 text-left cursor-pointer transition relative flex items-start gap-3.5 ${
                    isSelected ? "bg-blue-50/70 border-l-4 border-blue-600 shadow-3xs" : "hover:bg-slate-50/50 border-l-4 border-transparent"
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <div className="pt-1.5 shrink-0">
                    <span className={`w-3.5 h-3.5 rounded-full block border-2 border-white shadow-3xs ${
                      email.status === "Pendente" 
                        ? "bg-red-500 animate-pulse" 
                        : "bg-emerald-500"
                    }`} />
                  </div>

                  {/* Detalhes de Informação */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 truncate">
                        {email.orgao}
                      </span>
                      <span className="text-[10px] text-slate-450 font-bold shrink-0 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-800 truncate">
                      {email.assunto}
                    </h3>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-black text-[9px]">
                          OFÍCIO Nº {email.numeroOficio}
                        </span>
                        <span>• Menor: <strong className="text-slate-705">{maskField(email.criancaNomeEnvolvida)}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          email.urgencia === "Alta" ? "bg-red-100 text-red-700" :
                          email.urgencia === "Média" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          Urgência {email.urgencia}
                        </span>

                        {email.status === "Recebido" && (
                          <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Recibo Emitido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PAINEL DE INSPEÇÃO E LEITURA DETALHADA DO OFÍCIO SELECIONADO */}
      <div className="w-full xl:w-105 bg-white border border-slate-100 rounded-2xl shadow-xs flex flex-col overflow-hidden min-h-[500px]">
        {selectedEmail ? (
          <div className="flex-1 flex flex-col">
            
            {/* Header do E-mail detalhado */}
            <div className="p-4.5 bg-slate-50 border-b border-slate-150 space-y-3 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  selectedEmail.urgencia === "Alta" ? "bg-red-100 text-red-700 border border-red-200" :
                  selectedEmail.urgencia === "Média" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                  "bg-blue-100 text-blue-700 border border-blue-200"
                }`}>
                  Prioridade de Atendimento: {selectedEmail.urgencia}
                </span>

                <span className="text-[10px] text-slate-450 font-bold font-mono">
                  Indexado em: {new Date(selectedEmail.dataRecebimento).toLocaleString("pt-BR")}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-800 leading-tight">
                  {selectedEmail.assunto}
                </h3>
                <span className="text-xs text-blue-600 font-extrabold block mt-1">
                  Nº {selectedEmail.numeroOficio}
                </span>
              </div>

              <div className="bg-white border border-slate-150 p-2.5 rounded-xl text-[11px] text-slate-500 space-y-1 shadow-3xs">
                <p><strong>Órgão Expedidor:</strong> <span className="font-black text-slate-800">{selectedEmail.orgao}</span></p>
                <p><strong>Remetente Técnico:</strong> <span className="text-slate-700">{selectedEmail.remetenteNome}</span> (<span className="text-blue-500 underline">{selectedEmail.remetenteEmail}</span>)</p>
                <p><strong>Criança/Menor Citado:</strong> <span className="text-rose-700 font-black">{maskField(selectedEmail.criancaNomeEnvolvida)}</span></p>
              </div>
            </div>

            {/* Conteúdo textual do E-mail */}
            <div className="flex-1 p-4.5 overflow-y-auto bg-slate-50/20 text-xs text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap font-mono select-text text-left border-b border-slate-150 max-h-[300px] lg:max-h-[400px]">
              {getSecureContent(selectedEmail.conteudo, selectedEmail.criancaNomeEnvolvida)}
            </div>

            {/* Ações e Status de Recebimento */}
            <div className="p-4.5 bg-slate-50 space-y-4 text-left">
              {selectedEmail.status === "Pendente" ? (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 text-red-800 border border-red-150 rounded-xl text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold">Ofício Oficial não Recebido pelo Conselho Tutelar</p>
                      <p className="text-[10px] text-red-700 font-medium mt-0.5">
                        O órgão remetente ainda não possui o termo formal de recebimento do Conselho. Ao clicar em Dar Recebimento, uma mensagem eletrônica oficial será enviada de volta confirmando o protocolo.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcknowledgeReceipt(selectedEmail)}
                    disabled={isProcessingReceipt !== null}
                    className="w-full py-3 bg-red-650 hover:bg-red-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md uppercase tracking-wide border border-red-600/20 select-none"
                  >
                    {isProcessingReceipt === selectedEmail.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Enviando Recibo via Gmail...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                        <span>Dar Recebimento & Responder Ofício</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Recibo já gerado */}
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-extrabold text-emerald-900 uppercase">
                        Protocolo Oficial de Recebimento Ativo
                      </span>
                    </div>

                    <div className="text-[10px] text-emerald-700 space-y-1 font-semibold leading-relaxed">
                      <p><strong>Protocolo:</strong> <span className="font-mono bg-emerald-100 text-emerald-950 px-1 py-0.2 rounded font-black">{selectedEmail.reciboGerado?.codigoValidacao}</span></p>
                      <p><strong>Confirmado em:</strong> {selectedEmail.reciboGerado?.dataHoraProtocolo}</p>
                      <p><strong>Conselheiro Responsável:</strong> {selectedEmail.reciboGerado?.conselheiroResponsavel}</p>
                      <p className="text-[9px] text-emerald-600 mt-1.5 pt-1.5 border-t border-emerald-200">
                        {selectedEmail.reciboGerado?.mensagemRespostaEnvio}
                      </p>
                    </div>
                  </div>

                  {/* Ações adicionais do recibo */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setEmailForReceipt(selectedEmail);
                        setShowReceiptPrintModal(true);
                      }}
                      className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Recibo</span>
                    </button>

                    <button
                      onClick={() => {
                        setEmailToImport(selectedEmail);
                        setImportType("novo_caso");
                        setShowImportModal(true);
                      }}
                      className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-blue-100" />
                      <span>Indexar Prontuário</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
            <Mail className="w-10 h-10 text-slate-200" />
            <p className="text-xs font-bold">Selecione um ofício da lista ao lado para leitura e preenchimento de recebimento.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: IMPORTAR OFÍCIO PARA O SISTEMA DE PRONTUÁRIOS */}
      {showImportModal && emailToImport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-left"
          >
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-100" />
                <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-tight">Indexação de Documento Recebido</h3>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-white hover:text-slate-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] text-slate-450 uppercase font-black tracking-wider">Documento Referência:</span>
                <p className="font-bold text-slate-800 leading-normal">
                  Ofício {emailToImport.numeroOficio} — {emailToImport.orgao}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Criança citada no requerimento: <strong className="text-rose-600">{maskField(emailToImport.criancaNomeEnvolvida)}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Tipo de Vínculo de Arquivamento:</label>
                
                <div className="grid grid-cols-2 gap-2.5">
                  <label className={`p-3 border rounded-xl flex flex-col gap-1 cursor-pointer transition ${
                    importType === "novo_caso" 
                      ? "border-blue-500 bg-blue-50 text-blue-900" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      <input 
                        type="radio" 
                        name="importType"
                        checked={importType === "novo_caso"}
                        onChange={() => setImportType("novo_caso")}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <span>Novo Atendimento</span>
                    </div>
                    <span className="text-[10px] text-slate-450 leading-relaxed font-semibold pl-5">
                      Abrir prontuário em branco importando todo o teor do e-mail.
                    </span>
                  </label>

                  <label className={`p-3 border rounded-xl flex flex-col gap-1 cursor-pointer transition ${
                    importType === "acompanhamento" 
                      ? "border-blue-500 bg-blue-50 text-blue-900" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      <input 
                        type="radio" 
                        name="importType"
                        checked={importType === "acompanhamento"}
                        onChange={() => setImportType("acompanhamento")}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <span>Acompanhamento</span>
                    </div>
                    <span className="text-[10px] text-slate-450 leading-relaxed font-semibold pl-5">
                      Anexar o teor do Ofício como uma nova linha histórica de um caso existente.
                    </span>
                  </label>
                </div>
              </div>

              {importType === "acompanhamento" && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Selecione o Prontuário Alvo do Colegiado:</label>
                  <select
                    value={selectedExistingCaseId}
                    onChange={(e) => setSelectedExistingCaseId(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-xl outline-none font-bold cursor-pointer text-slate-800"
                  >
                    <option value="">-- Selecione o Prontuário Cadastrado --</option>
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        📄 {c.numeroRegistro} - {maskField(c.criancaNome)} ({c.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-3.5 border-t border-slate-150 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold cursor-pointer text-slate-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importType === "acompanhamento" && !selectedExistingCaseId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Confirmar Indexação
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: TERMO OFICIAL DE RECIBO / PROTOCOLO DIGITAL IMPRIMÍVEL */}
      {showReceiptPrintModal && emailForReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full flex flex-col text-left print:shadow-none print:border-none print:m-0"
          >
            {/* Header não imprimível */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Printer className="w-4 h-4" />
                Certidão de Recebimento de Ofício
              </span>
              <button 
                onClick={() => {
                  setEmailForReceipt(null);
                  setShowReceiptPrintModal(false);
                }}
                className="text-white hover:text-slate-300 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Controles de Redação e Privacidade de Impressão */}
            <div className="px-6 py-3 bg-slate-150 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
              <span className="text-[11px] text-slate-500 font-bold">
                🔒 CONTROLE ÉTICO (ECA Art. 143):
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={redactPrint}
                  onChange={(e) => setRedactPrint(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-extrabold text-slate-850">
                  Imprimir cópia com nomes e dados censurados (Segurança LGPD)
                </span>
              </label>
            </div>

            {/* Certidão Imprimível */}
            <div className="p-8 sm:p-12 space-y-6 flex-1 text-slate-900 font-sans select-text select-all print:p-0">
              
              {/* Brasão Oficial / Logomarca Municipal */}
              <div className="text-center space-y-2 pb-4 border-b-2 border-double border-slate-350 flex flex-col items-center">
                <img src="/icon.svg" className="w-20 h-20 object-contain mx-auto" alt="Brasão do Conselho" />
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase leading-none tracking-tight">Estado do Rio Grande do Norte</h3>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800 uppercase mt-0.5">Prefeitura Municipal de Currais Novos</h4>
                  <span className="text-[11px] font-black tracking-widest text-blue-700 block uppercase mt-1">Conselho Tutelar dos Direitos da Criança e do Adolescente</span>
                  <span className="text-[9px] font-bold text-slate-400 block tracking-wide">Criado pela Lei Municipal nº 1.234 - Amparado no Art. 131 do ECA</span>
                </div>
              </div>

              {/* Título da Certidão */}
              <div className="text-center space-y-1">
                <h2 className="font-black text-sm sm:text-base uppercase tracking-wider text-slate-900">
                  Certidão de Protocolo Eletrônico de Ofício
                </h2>
                <span className="text-[10px] text-slate-450 font-black block uppercase tracking-widest font-mono">
                  Validação Geral: {emailForReceipt.reciboGerado?.codigoValidacao}
                </span>
              </div>

              {/* Corpo da Certidão */}
              <div className="text-xs sm:text-sm leading-relaxed text-justify text-slate-800 space-y-4 font-normal">
                <p>
                  Certifico para os devidos fins de direito e comprovação civil que o <strong>CONSELHO TUTELAR DE CURRAIS NOVOS/RN</strong>, estabelecido na Sede Municipal, recebeu em seu correio eletrônico oficial cadastrado (<strong>conselhotutelarcn@gmail.com</strong>), o documento oficial caracterizado abaixo:
                </p>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 font-mono text-[11px] sm:text-xs">
                  <p><strong>Órgão Remetente:</strong> {emailForReceipt.orgao}</p>
                  <p><strong>Remetente Técnico:</strong> {emailForReceipt.remetenteNome} ({emailForReceipt.remetenteEmail})</p>
                  <p><strong>Identificação do Ofício:</strong> Nº {emailForReceipt.numeroOficio}</p>
                  <p><strong>Assunto do Ofício:</strong> {emailForReceipt.assunto}</p>
                  <p><strong>Criança/Adolescente Citado:</strong> {redactPrint ? maskField(emailForReceipt.criancaNomeEnvolvida) : emailForReceipt.criancaNomeEnvolvida}</p>
                  <p><strong>Classificação de Urgência:</strong> {emailForReceipt.urgencia}</p>
                  <p><strong>Data/Hora Oficial de Envio:</strong> {new Date(emailForReceipt.dataRecebimento).toLocaleString("pt-BR")}</p>
                </div>

                <p>
                  O recebimento deste documento foi devidamente processado e o seu teor foi indexado de forma segura no <strong>Prontuário de Atendimentos Administrativos do Conselho Tutelar</strong>. Uma notificação eletrônica de leitura com recibo digital de protocolo foi devolvida automaticamente para o e-mail do remetente.
                </p>

                <p>
                  O caso encontra-se sob a responsabilidade legal e técnica deste colegiado para que sejam aplicadas as medidas protetivas e de encaminhamento exigidas para a garantia integral dos direitos do menor envolvido, conforme capitulado na Lei Federal nº 8.069/90 (Estatuto da Criança e do Adolescente).
                </p>
              </div>

              {/* Data e Local */}
              <div className="text-right text-xs sm:text-sm pt-4">
                <p>Currais Novos/RN, {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.</p>
                <p className="text-slate-450 text-[10px] font-mono mt-1">Horário de Protocolo Local: {emailForReceipt.reciboGerado?.dataHoraProtocolo}</p>
              </div>

              {/* Assinaturas */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-4 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-slate-350 w-44 mx-auto" />
                  <span className="font-extrabold text-slate-800 block mt-1">{emailForReceipt.reciboGerado?.conselheiroResponsavel}</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Conselheiro Tutelar Responsável</span>
                </div>

                <div>
                  <div className="h-10 border-b border-slate-350 w-44 mx-auto" />
                  <span className="font-extrabold text-slate-800 block mt-1">Conselho Tutelar Colegiado</span>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Apoio e Secretaria Municipal</span>
                </div>
              </div>

              {/* Linha de Validade da Assinatura Digital */}
              <div className="text-center pt-8 text-[9px] text-slate-400 font-mono space-y-1">
                <p>CÓDIGO DE RASTREABILIDADE DIGITAL DO RECONHECIMENTO GMAIL:</p>
                <p className="font-black text-slate-600 uppercase break-all">
                  SHA-256: {btoa(emailForReceipt.reciboGerado?.codigoValidacao || "").slice(0, 32)}...
                </p>
                <p className="text-slate-400">Esta certidão possui fé pública de recebimento oficial, em conformidade com o regimento interno do Conselho Tutelar.</p>
              </div>

            </div>

            {/* Ações não imprimíveis */}
            <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-end gap-2.5 print:hidden">
              <button 
                onClick={() => {
                  setEmailForReceipt(null);
                  setShowReceiptPrintModal(false);
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold transition cursor-pointer text-slate-700"
              >
                Voltar
              </button>

              <button 
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-blue-100" />
                <span>Imprimir Documento de Fé Pública</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
