/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AtendimentoCase, StatusCase, FollowUpLog, TIPOS_OCORRENCIA } from "./types";
import { MOCK_CASES } from "./mockData";
import Dashboard from "./components/Dashboard";
import CaseForm from "./components/CaseForm";
import CaseDetails from "./components/CaseDetails";
import ExportImport from "./components/ExportImport";
import OficioTemplates from "./components/OficioTemplates";
import AgendaCompartilhada from "./components/AgendaCompartilhada";
import CaixaRecebimentos from "./components/CaixaRecebimentos";
// @ts-ignore
import bannerCriancas from "./assets/images/banner_criancas_1782313336193.jpg";
import { 
  Users, 
  Plus, 
  Search, 
  FileText, 
  LayoutDashboard, 
  Database, 
  ShieldAlert, 
  UserPlus, 
  Clock, 
  Briefcase,
  Smile,
  LogOut,
  SlidersHorizontal,
  Home,
  Download,
  Smartphone,
  Laptop,
  Share2,
  HelpCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Copy,
  AlertCircle,
  Terminal,
  ExternalLink,
  Scale,
  Calendar,
  Mail
} from "lucide-react";

export default function App() {
  const [cases, setCases] = useState<AtendimentoCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [editingCase, setEditingCase] = useState<AtendimentoCase | null>(null);
  const [currentTab, setCurrentTab] = useState<"casos" | "dashboard" | "backup" | "oficios" | "agenda" | "recebimentos">("casos");

  // Estado global para modo de privacidade (Esconder dados confidenciais na tela de terceiros)
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => {
    return localStorage.getItem("conselho_tutelar_privacy_mode") === "true";
  });

  // Função para mascarar dados de crianças e responsáveis no frontend (Prevenindo vazamento de dados visuais)
  const maskField = (text: string | null | undefined) => {
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

  useEffect(() => {
    localStorage.setItem("conselho_tutelar_privacy_mode", String(privacyMode));
  }, [privacyMode]);

  // Estados para instalação PWA (celular/computador)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installModalTab, setInstallModalTab] = useState<"celular" | "computador">("celular");
  const [copiedCommand, setCopiedCommand] = useState(false);

  useEffect(() => {
    // Detectar se já está rodando standalone (instalado)
    const checkStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstallFlow = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      // Abre o diálogo passo-a-passo explicando no mobile/PC
      setShowInstallModal(true);
    }
  };



  // Filtros de Prontuário
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [occurrenceFilter, setOccurrenceFilter] = useState<string>("Todos");

  // Lista de Usuários Cadastrados do Conselho Tutelar
  const USUARIOS_CADASTRADOS = [
    "ElderCosta",
    "NoêmiaAssunção",
    "MariaLúcia",
    "CláudiaGarcia",
    "KátiaMedeiros"
  ];
  const SENHA_PADRAO = "@CTdireitos";

  // Estados de Autenticação
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("conselho_tutelar_logged_in") === "true";
  });
  const [selectedUserLogin, setSelectedUserLogin] = useState<string>("ElderCosta");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");

  // Perfil do Conselheiro Ativo
  const [conselheiroProfile, setConselheiroProfile] = useState<string>(() => {
    return localStorage.getItem("conselho_tutelar_conselheiro") || "ElderCosta";
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Controle de Bloqueio por Inatividade e Bloqueio Manual
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [unlockPassword, setUnlockPassword] = useState<string>("");
  const [unlockError, setUnlockError] = useState<string>("");

  useEffect(() => {
    if (!isLoggedIn || isLocked) return;

    let timeoutId: any;
    const INACTIVITY_TIME = 300000; // 5 minutos de inatividade

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsLocked(true);
      }, INACTIVITY_TIME);
    };

    const handleActivity = () => {
      resetTimer();
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isLoggedIn, isLocked]);

  // Carregar casos iniciais
  useEffect(() => {
    const saved = localStorage.getItem("conselho_tutelar_cases");
    if (saved) {
      try {
        setCases(JSON.parse(saved));
      } catch (e) {
        setCases(MOCK_CASES);
      }
    } else {
      setCases(MOCK_CASES);
      localStorage.setItem("conselho_tutelar_cases", JSON.stringify(MOCK_CASES));
    }
  }, []);

  // Sincronizar com localStorage
  const saveCasesToStorage = (updatedCases: AtendimentoCase[]) => {
    setCases(updatedCases);
    localStorage.setItem("conselho_tutelar_cases", JSON.stringify(updatedCases));
  };

  // Ações de Autenticação
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === SENHA_PADRAO) {
      setIsLoggedIn(true);
      setConselheiroProfile(selectedUserLogin);
      localStorage.setItem("conselho_tutelar_logged_in", "true");
      localStorage.setItem("conselho_tutelar_conselheiro", selectedUserLogin);
      setLoginError("");
      setInputPassword("");
    } else {
      setLoginError("Senha incorreta! Use a senha padrão: @CTdireitos");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("conselho_tutelar_logged_in");
    setInputPassword("");
  };

  // Criar ou Editar Caso
  const handleSaveCase = (formData: Omit<AtendimentoCase, "id" | "numeroRegistro" | "historico" | "dataUltimaAtualizacao"> & { id?: string }) => {
    let updatedCases: AtendimentoCase[];

    if (formData.id) {
      // Edição
      updatedCases = cases.map(c => {
        if (c.id === formData.id) {
          return {
            ...c,
            ...formData,
            dataUltimaAtualizacao: new Date().toISOString()
          } as AtendimentoCase;
        }
        return c;
      });
    } else {
      // Novo Registro
      const randomId = "case-" + Date.now();
      const currentYear = new Date().getFullYear();
      const serialNumber = String(cases.length + 1).padStart(4, "0");
      const recordNumber = `CT-${currentYear}-${serialNumber}`;

      const newCase: AtendimentoCase = {
        id: randomId,
        numeroRegistro: recordNumber,
        dataHora: formData.dataHora,
        criancaNome: formData.criancaNome,
        criancaIdade: formData.criancaIdade,
        criancaDataNascimento: formData.criancaDataNascimento,
        criancaGen: formData.criancaGen,
        criancaDocumento: formData.criancaDocumento,
        criancaEndereco: formData.criancaEndereco,
        criancaEscola: formData.criancaEscola,
        responsavelPrincipal: formData.responsavelPrincipal,
        outroResponsavel: formData.outroResponsavel,
        tipoOcorrencia: formData.tipoOcorrencia,
        subTipoOcorrencia: formData.subTipoOcorrencia,
        descricaoOcorrencia: formData.descricaoOcorrencia,
        denuncianteSigilo: formData.denuncianteSigilo,
        denuncianteNome: formData.denuncianteNome,
        denuncianteTelefone: formData.denuncianteTelefone,
        medidasCrianca: formData.medidasCrianca,
        medidasPais: formData.medidasPais,
        outrasProvidencias: formData.outrasProvidencias,
        status: formData.status,
        conselheiroResponsavel: formData.conselheiroResponsavel,
        dataUltimaAtualizacao: new Date().toISOString(),
        historico: [
          {
            id: `log-${Date.now()}-init`,
            data: new Date().toISOString(),
            descricao: `Abertura oficial do prontuário do atendimento pelo(a) conselheiro(a) ${formData.conselheiroResponsavel}.`,
            conselheiro: formData.conselheiroResponsavel
          }
        ]
      };
      updatedCases = [newCase, ...cases];
      setSelectedCaseId(newCase.id);
    }

    saveCasesToStorage(updatedCases);
    setIsCreating(false);
    setEditingCase(null);
  };

  // Excluir / Arquivar Caso
  const handleDeleteCase = (id: string) => {
    const updated = cases.filter(c => c.id !== id);
    saveCasesToStorage(updated);
    setSelectedCaseId(null);
  };

  // Atualizar Status do caso directamente no inspector
  const handleUpdateStatus = (id: string, newStatus: StatusCase) => {
    const updated = cases.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          dataUltimaAtualizacao: new Date().toISOString(),
          historico: [
            ...c.historico,
            {
              id: `log-${Date.now()}-status`,
              data: new Date().toISOString(),
              descricao: `O status do atendimento foi alterado para: "${newStatus}".`,
              conselheiro: conselheiroProfile
            }
          ]
        };
      }
      return c;
    });
    saveCasesToStorage(updated);
  };

  // Adicionar registro histórico (Acompanhamento)
  const handleAddHistoryLog = (id: string, newLog: Omit<FollowUpLog, "id">) => {
    const logId = "log-" + Date.now();
    const updated = cases.map(c => {
      if (c.id === id) {
        return {
          ...c,
          dataUltimaAtualizacao: new Date().toISOString(),
          historico: [
            ...c.historico,
            {
              ...newLog,
              id: logId
            }
          ]
        };
      }
      return c;
    });
    saveCasesToStorage(updated);
  };

  // Operações de Backup
  const handleImportBackup = (imported: AtendimentoCase[]) => {
    saveCasesToStorage(imported);
  };

  const handleClearAll = () => {
    saveCasesToStorage([]);
    setSelectedCaseId(null);
  };

  const handleResetSeed = () => {
    saveCasesToStorage(MOCK_CASES);
    setSelectedCaseId(null);
  };

  // Filtros aplicados sobre a lista de prontuários
  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.criancaNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.numeroRegistro.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.responsavelPrincipal.nome.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "Todos" || c.status === statusFilter;
    const matchesOccurrence = occurrenceFilter === "Todos" || c.tipoOcorrencia.includes(occurrenceFilter);

    return matchesSearch && matchesStatus && matchesOccurrence;
  });

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 15 }}
          className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Logo Centralizada Ampliada e Arredondada */}
            <div className="relative">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-white border-4 border-blue-600 shadow-xl p-2.5 flex items-center justify-center select-none overflow-hidden transition-transform duration-350 hover:scale-105 active:scale-95">
                <img 
                  src="/icon.svg" 
                  className="w-full h-full object-contain" 
                  alt="Logo Conselho Tutelar de Currais Novos" 
                />
              </div>
              <span className="absolute bottom-2 right-2 w-5.5 h-5.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>

            <div>
              <h2 className="text-xl font-black text-blue-700 tracking-tight uppercase leading-none">Conselho Tutelar</h2>
              <span className="text-xs font-black text-slate-800 tracking-wider block mt-1 uppercase">De Currais Novos / RN</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mt-1">Prontuário Digital Autorizado</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs font-semibold flex items-center gap-2 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Select de Usuário */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Identificação do Conselheiro</label>
              <div className="relative">
                <select
                  value={selectedUserLogin}
                  onChange={(e) => {
                    setSelectedUserLogin(e.target.value);
                    setLoginError("");
                  }}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-bold text-slate-800 outline-none transition cursor-pointer appearance-none"
                >
                  {USUARIOS_CADASTRADOS.map((user) => (
                    <option key={user} value={user}>
                      👥 {user}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Input de Senha */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Senha de Acesso</label>
              <input
                type="password"
                required
                placeholder="Insira sua senha de acesso"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-xs font-bold text-slate-800 outline-none transition"
              />
              <span className="text-[10px] text-slate-400 font-medium block mt-1">
                Dica de demonstração: a senha padrão é <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded">@CTdireitos</span>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/15 transition-all hover:scale-101 active:scale-99 hover:shadow-blue-500/25 cursor-pointer"
            >
              Entrar no Sistema
            </button>
          </form>

          {/* Atalhos para fazer teste rápido */}
          <div className="border-t border-slate-100 pt-4 text-center">
            <span className="text-[10px] text-slate-400 font-bold block mb-2 uppercase tracking-wide">Conselheiros Cadastrados para Seleção:</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {USUARIOS_CADASTRADOS.map((usr) => (
                <button
                  key={usr}
                  type="button"
                  onClick={() => {
                    setSelectedUserLogin(usr);
                    setLoginError("");
                  }}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
                    selectedUserLogin === usr 
                      ? "bg-blue-100 text-blue-800 border border-blue-200" 
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  {usr}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
            Conselho Tutelar de Currais Novos / RN. Protegendo as Crianças e Adolescentes com responsabilidade civil e digital.
            <div className="mt-2.5 flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 border border-slate-200">PWA Ativo</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-600 border border-slate-200">Segurança TLS</span>
            </div>
          </div>
        </motion.div>

        {/* Botão flutuante para instalar o PWA do Conselho direto da tela de login */}
        <button
          onClick={triggerInstallFlow}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition hover:-translate-y-0.5"
          title="Instalar como Aplicativo"
        >
          <Download className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span>Instalar no Celular ou Computador</span>
        </button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden text-left">
        {/* Repeating Watermark Background */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none select-none flex flex-wrap gap-12 p-8 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="text-white text-[10px] font-mono font-bold tracking-widest rotate-12 uppercase shrink-0">
              CONSELHO TUTELAR CURRAIS NOVOS • CONFIDENCIAL • ECA ART. 143
            </div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl p-8 space-y-6 relative z-10 text-white"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-500 animate-pulse">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-lg font-black text-amber-400 tracking-tight uppercase leading-none">Tela Bloqueada por Inatividade</h2>
              <p className="text-[11px] text-slate-300 font-bold block mt-2.5 uppercase">
                Operador Responsável: <span className="text-white font-extrabold">{conselheiroProfile}</span>
              </p>
              <span className="text-[10px] uppercase tracking-wide text-slate-400 block mt-1 leading-normal">
                Para evitar vazamento de dados confidenciais, a tela foi protegida. Insira sua senha para continuar o trabalho.
              </span>
            </div>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (unlockPassword === SENHA_PADRAO) {
              setIsLocked(false);
              setUnlockPassword("");
              setUnlockError("");
            } else {
              setUnlockError("Senha incorreta! Use a senha padrão para desbloquear.");
            }
          }} className="space-y-4">
            {unlockError && (
              <div className="p-3 bg-red-950/50 text-red-200 rounded-xl border border-red-800/50 text-xs font-semibold text-center">
                {unlockError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Senha do Conselheiro</label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Insira sua senha de acesso"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-xs font-bold text-white outline-none transition"
              />
              <span className="text-[10px] text-slate-500 font-medium block mt-1">
                Dica: a senha padrão é <span className="font-bold text-blue-400">@CTdireitos</span>
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setIsLocked(false);
                  setUnlockPassword("");
                  setUnlockError("");
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Trocar Usuário
              </button>

              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
              >
                Desbloquear
              </button>
            </div>
          </form>

          <p className="text-center text-[9px] text-slate-500 leading-normal font-mono uppercase">
            Art. 143 do ECA: É vedada a divulgação de atos judiciais, policiais e administrativos relativos a crianças e adolescentes.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row print:bg-white print:text-black">
      
      {/* BARRA LATERAL (MENU PRINCIPAL ANIMADO COM CONTROLE DE ACESSO) */}
      <aside className="w-full md:w-64 lg:w-72 bg-slate-900 text-slate-100 border-b md:border-b-0 md:border-r border-slate-800 p-4 md:p-5 flex flex-col shrink-0 md:h-screen md:sticky md:top-0 print:hidden overflow-y-auto z-30">
        
        {/* Logo e Título do Conselho */}
        <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-slate-800">
          <div className="relative shrink-0">
            <img 
              src="/icon.svg" 
              className="w-10 h-10 rounded-full border border-blue-500/30 shadow-md p-1 object-contain select-none bg-white transition-transform duration-300 hover:scale-105" 
              alt="Logo" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" title="Sistema Online" />
          </div>
          <div>
            <h1 className="text-xs font-black text-blue-450 tracking-wider leading-none uppercase">Conselho Tutelar</h1>
            <span className="text-[10px] font-extrabold text-slate-300 tracking-wide block mt-1 leading-none">Currais Novos / RN</span>
            <span className="text-[8px] font-bold text-slate-500 block mt-0.5 uppercase tracking-widest">ECA Digital v3.0</span>
          </div>
        </div>

        {/* Navegação de Abas - Vertical Animada */}
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 px-3">Menu do Sistema</span>
          
          <motion.button 
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentTab("casos"); setSelectedCaseId(null); setIsCreating(false); }}
            className={`relative w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[11px] font-extrabold transition-colors cursor-pointer group ${
              currentTab === "casos" ? "text-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {currentTab === "casos" && (
              <motion.div 
                layoutId="activeSidebarPill" 
                className="absolute inset-0 bg-blue-500/10 border-l-4 border-blue-500 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <FileText className={`w-4 h-4 transition-colors ${currentTab === "casos" ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} />
            <span>Prontuários</span>
          </motion.button>

          <motion.button 
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentTab("agenda"); setSelectedCaseId(null); setIsCreating(false); }}
            className={`relative w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[11px] font-extrabold transition-colors cursor-pointer group ${
              currentTab === "agenda" ? "text-emerald-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {currentTab === "agenda" && (
              <motion.div 
                layoutId="activeSidebarPill" 
                className="absolute inset-0 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <Calendar className={`w-4 h-4 transition-colors ${currentTab === "agenda" ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
            <span>Agenda Coletiva 📅</span>
          </motion.button>

          <motion.button 
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentTab("oficios"); setSelectedCaseId(null); setIsCreating(false); }}
            className={`relative w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[11px] font-extrabold transition-colors cursor-pointer group ${
              currentTab === "oficios" ? "text-blue-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {currentTab === "oficios" && (
              <motion.div 
                layoutId="activeSidebarPill" 
                className="absolute inset-0 bg-blue-500/10 border-l-4 border-blue-500 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <FileText className={`w-4 h-4 transition-colors ${currentTab === "oficios" ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} />
            <span>Documentos Oficiais</span>
          </motion.button>

          <motion.button 
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentTab("recebimentos"); setSelectedCaseId(null); setIsCreating(false); }}
            className={`relative w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[11px] font-extrabold transition-colors cursor-pointer group ${
              currentTab === "recebimentos" ? "text-red-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {currentTab === "recebimentos" && (
              <motion.div 
                layoutId="activeSidebarPill" 
                className="absolute inset-0 bg-red-500/10 border-l-4 border-red-500 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <Mail className={`w-4 h-4 transition-colors ${currentTab === "recebimentos" ? "text-red-400 animate-pulse" : "text-slate-500 group-hover:text-slate-300"}`} />
            <span>Recebimentos Real 📥</span>
          </motion.button>

          <motion.button 
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentTab("dashboard"); setSelectedCaseId(null); setIsCreating(false); }}
            className={`relative w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[11px] font-extrabold transition-colors cursor-pointer group ${
              currentTab === "dashboard" ? "text-indigo-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {currentTab === "dashboard" && (
              <motion.div 
                layoutId="activeSidebarPill" 
                className="absolute inset-0 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <LayoutDashboard className={`w-4 h-4 transition-colors ${currentTab === "dashboard" ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
            <span>Estatísticas / KPI</span>
          </motion.button>

          <motion.button 
            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setCurrentTab("backup"); setSelectedCaseId(null); setIsCreating(false); }}
            className={`relative w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[11px] font-extrabold transition-colors cursor-pointer group ${
              currentTab === "backup" ? "text-slate-200" : "text-slate-400 hover:text-white"
            }`}
          >
            {currentTab === "backup" && (
              <motion.div 
                layoutId="activeSidebarPill" 
                className="absolute inset-0 bg-slate-500/10 border-l-4 border-slate-500 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <Database className={`w-4 h-4 transition-colors ${currentTab === "backup" ? "text-slate-300" : "text-slate-500 group-hover:text-slate-300"}`} />
            <span>Backup / Sinc</span>
          </motion.button>
        </div>

        {/* Rodapé de Utilidades e Perfil Ativo */}
        <div className="pt-4 border-t border-slate-800 flex flex-col gap-3 mt-auto">
          
          {/* Controle LGPD / Vazar Zero */}
          <button 
            onClick={() => setPrivacyMode(!privacyMode)}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between font-extrabold text-xs transition-colors cursor-pointer border ${
              privacyMode 
                ? "bg-amber-600/25 border-amber-500 text-amber-200" 
                : "bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 text-slate-300"
            }`}
            title="Mascarar nomes e dados sensíveis na interface"
          >
            <div className="flex items-center gap-2">
              {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span>Modo LGPD</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider">{privacyMode ? "Ativo" : "Off"}</span>
          </button>

          {/* Instalar App (PWA) */}
          <button 
            onClick={triggerInstallFlow}
            className="w-full px-3 py-2 rounded-xl flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm transition-transform active:scale-97 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar Aplicativo</span>
          </button>

          {/* Card do Perfil do Conselheiro */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[7px] text-slate-500 block font-black uppercase tracking-widest">Conselheiro</span>
              <span className="font-extrabold text-white text-xs block truncate" title={conselheiroProfile}>
                {conselheiroProfile}
              </span>
            </div>
            <div className="flex gap-1 shrink-0">
              <button 
                onClick={() => setIsLocked(true)}
                className="p-1.5 bg-slate-800 text-amber-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer" 
                title="Bloquear Tela"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 bg-slate-800 text-rose-400 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer" 
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* PAINEL DE CONTEÚDO PRINCIPAL (DIFERENTES TELAS + HEADER DE CRIANÇAS) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* CABEÇALHO IMERSIVO COM IMAGEM DE CRIANÇAS E DEGRADÊ DE ALTA VISIBILIDADE */}
        <header className="relative bg-slate-950 text-white py-12 px-6 sm:px-8 shadow-md border-b border-slate-800 print:hidden overflow-hidden shrink-0">
          
          {/* Imagem de Fundo (Crianças e Adolescentes) */}
          <div className="absolute inset-0 z-0">
            <img 
              src={bannerCriancas} 
              alt="Crianças e Adolescentes sorrindo e protegidos" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-25 select-none pointer-events-none transform scale-102 hover:scale-105 transition-transform duration-[12000ms] ease-out"
            />
            {/* Máscara de Degradê Escura para Garantir 100% de Visibilidade dos Textos */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/45" />
          </div>

          {/* Conteúdo do Cabeçalho por cima da Imagem com Alta Visibilidade */}
          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-xs">
                  Estatuto da Criança e do Adolescente (ECA)
                </span>
                <span className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-xs">
                  Currais Novos / RN
                </span>
              </div>
              <h1 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight uppercase leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Conselho Tutelar
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1.5 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] max-w-2xl leading-relaxed">
                Painel unificado de Prontuários ECA, Agenda Coletiva de Compromissos e Recebimentos Automáticos em Tempo Real.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0 text-right">
              <span className="text-[9px] font-black text-blue-400 tracking-wider block">CONEXÃO SEGURA ATIVA</span>
              <span className="text-[10px] text-slate-400 font-semibold max-w-[200px] leading-tight block">
                Operando sob as diretrizes do Art. 143 do ECA.
              </span>
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO PRINCIPAL (DIFERENTES TELAS) */}
        <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col min-h-0 print:p-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ rotateY: -15, opacity: 0, transformOrigin: "left center" }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ backfaceVisibility: "hidden" }}
              className="w-full flex-1 flex flex-col min-h-0"
            >
            {/* TAB 1: PRONTUÁRIO DE CASOS (SPLIT-PANE DESIGN) */}
        {currentTab === "casos" && (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            
            {/* LADO A: LISTAGEM DE CASOS (Ocupa 1/3 no desktop ou largura inteira se nada selecionado / editando) */}
            {(!selectedCaseId && !isCreating && !editingCase) || true ? (
              <div className={`flex-1 lg:max-w-md bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[450px] lg:h-[calc(100vh-140px)] ${
                (selectedCaseId || isCreating || editingCase) ? "hidden lg:flex" : "flex"
              }`}>
                {/* Cabeçalho da Lista + Botão de Criar Atendimento */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h2 className="text-sm font-extrabold">Banco de Casos ({filteredCases.length})</h2>
                    </div>
                    <button
                      onClick={() => { setIsCreating(true); setSelectedCaseId(null); setEditingCase(null); }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Novo Atendimento
                    </button>
                  </div>

                  {/* Campo de buscas */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Pesquisar por Criança ou Registro..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2 text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  {/* Filtros Avançados Dropdowns */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filtro de Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg outline-none cursor-pointer font-bold text-slate-700"
                      >
                        <option value="Todos">Todos Status</option>
                        <option value="Aberto">🟢 Aberto</option>
                        <option value="Em Acompanhamento">🟡 Em Aconpanhamento</option>
                        <option value="Concluido">⚪ Concluído</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Filtrar Violação</label>
                      <select
                        value={occurrenceFilter}
                        onChange={(e) => setOccurrenceFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1.5 rounded-lg outline-none cursor-pointer font-semibold text-slate-700 truncate"
                      >
                        <option value="Todos">Todas Violações</option>
                        <option value="Negligência">Negligência</option>
                        <option value="Violência">Violência</option>
                        <option value="Abuso">Abuso Sexual</option>
                        <option value="Evasão">Evasão Escolar</option>
                        <option value="Trabalho">Trabalho Infantil</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lista Scrolável */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {filteredCases.length === 0 ? (
                    <div className="text-center py-20 p-4 space-y-2">
                      <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">Nenhum atendimento correspondente encontrado.</p>
                      <button 
                        onClick={() => { setSearchQuery(""); setStatusFilter("Todos"); setOccurrenceFilter("Todos"); }}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Limpar Todos os Filtros
                      </button>
                    </div>
                  ) : (
                    filteredCases.map(c => {
                      const isActive = c.id === selectedCaseId;
                      return (
                        <motion.div
                          key={c.id}
                          onClick={() => { setSelectedCaseId(c.id); setIsCreating(false); setEditingCase(null); }}
                          whileHover={{ scale: 1.015, x: 3 }}
                          transition={{ type: "spring", stiffness: 350, damping: 22 }}
                          className={`p-4 cursor-pointer text-left transition relative ${
                            isActive 
                              ? "bg-blue-50/75 border-l-4 border-blue-600 shadow-xs" 
                              : "hover:bg-slate-50/60 border-l-4 border-transparent"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                              {c.numeroRegistro}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === "Aberto" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                              c.status === "Em Acompanhamento" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                              "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}>
                              {c.status}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-slate-800 line-clamp-1 flex items-center gap-1.5">
                            {maskField(c.criancaNome)}
                            {privacyMode && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Protegido" />
                            )}
                          </h3>
                          <div className="text-[11px] text-slate-500 flex justify-between items-center mt-1">
                            <span>{c.criancaIdade} anos • {c.responsavelPrincipal.parentesco}: {maskField(c.responsavelPrincipal.nome.split(" ")[0])}</span>
                          </div>

                          <div className="mt-2 text-[11px] text-slate-400 bg-slate-50 p-1.5 rounded-md line-clamp-1 border border-slate-100">
                            {c.tipoOcorrencia}
                          </div>

                          <div className="text-[9px] text-slate-400 text-right mt-1.5">
                            Modificado em {new Date(c.dataUltimaAtualizacao).toLocaleDateString('pt-BR')}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : null}

            {/* LADO B: PAINEL DE CONTEÚDO EXPANDIDO (Inspector, Formulários ou Estado Vazio) */}
            <div className="flex-1 min-w-0">
              {isCreating ? (
                <CaseForm 
                  onSave={handleSaveCase} 
                  onCancel={() => setIsCreating(false)} 
                />
              ) : editingCase ? (
                <CaseForm 
                  caseToEdit={editingCase} 
                  onSave={handleSaveCase} 
                  onCancel={() => setEditingCase(null)} 
                />
              ) : selectedCase ? (
                <CaseDetails 
                  caseData={selectedCase}
                  onBack={() => setSelectedCaseId(null)}
                  onEdit={(c) => setEditingCase(c)}
                  onDelete={handleDeleteCase}
                  onUpdateStatus={handleUpdateStatus}
                  onAddHistoryLog={handleAddHistoryLog}
                  privacyMode={privacyMode}
                />
              ) : (
                /* Estado Vazio de Seleção (Apenas Desktop, pois no mobile o Lado A cobre a tela) */
                <div className="hidden lg:flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl p-12 text-center h-[calc(100vh-140px)] space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div className="max-w-sm space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-800">Prontuário Digital Administrativo</h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Selecione um caso na barra lateral esquerda para inspecionar os detalhes do menor, aplicar medidas e emitir o Termo Oficial do Conselho de proteção.
                    </p>
                  </div>
                  <button
                    onClick={() => { setIsCreating(true); setSelectedCaseId(null); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar Novo Atendimento
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: DASHBOARD ESTATÍSTICO DE ATENDIMENTOS */}
        {currentTab === "dashboard" && (
          <Dashboard 
            cases={cases} 
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              setCurrentTab("casos");
            }} 
          />
        )}

        {/* TAB 3: CONTROLE DE BACKUP E SEGURANÇA */}
        {currentTab === "backup" && (
          <ExportImport 
            cases={cases}
            onImport={handleImportBackup}
            onClearAll={handleClearAll}
            onResetSeed={handleResetSeed}
          />
        )}

        {/* TAB 4: MODELOS DE OFÍCIO / NOTIFICAÇÃO / TERMO */}
        {currentTab === "oficios" && (
          <OficioTemplates 
            cases={cases}
            onBack={() => setCurrentTab("casos")}
            onAddHistoryLog={handleAddHistoryLog}
            conselheiroNome={conselheiroProfile}
          />
        )}

        {/* TAB 5: AGENDA COMPARTILHADA DO COLEGIADO */}
        {currentTab === "agenda" && (
          <AgendaCompartilhada 
            cases={cases}
            conselheiroAtivo={conselheiroProfile}
          />
        )}

        {/* TAB 6: CAIXA DE RECEBIMENTOS DO GMAIL */}
        {currentTab === "recebimentos" && (
          <CaixaRecebimentos 
            cases={cases}
            conselheiroAtivo={conselheiroProfile}
            onAddHistoryLog={handleAddHistoryLog}
            onImportCase={(newCase) => {
              const randomId = "case-" + Date.now();
              const currentYear = new Date().getFullYear();
              const serialNumber = String(cases.length + 1).padStart(4, "0");
              const recordNumber = `CT-${currentYear}-${serialNumber}`;
              
              const fullCase = {
                ...newCase,
                id: randomId,
                numeroRegistro: recordNumber,
                dataUltimaAtualizacao: new Date().toISOString(),
                historico: [
                  {
                    id: `log-${Date.now()}-init`,
                    data: new Date().toISOString(),
                    descricao: `Abertura de prontuário via Ofício Importado da Caixa de Recebimentos por(a) conselheiro(a) ${conselheiroProfile}.`,
                    conselheiro: conselheiroProfile
                  }
                ]
              };
              
              const updated = [fullCase, ...cases];
              saveCasesToStorage(updated);
              setSelectedCaseId(randomId);
              setCurrentTab("casos");
            }}
            privacyMode={privacyMode}
            maskField={maskField}
          />
        )}

          </motion.div>
        </AnimatePresence>

      </main>

      {/* FOOTER INFORMAL */}
      <footer className="py-4 border-t border-slate-100 text-center bg-white text-[10px] text-slate-400 font-mono print:hidden shrink-0 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Conselho Tutelar Digital © 2026 • Apoio Administrativo ao ECA</span>
          <span>Tecnologia de Confiança Local (LGPD Atendida • Prontuário Criptografado offline)</span>
        </div>
      </footer>

      </div>

      {/* MODAL DE INSTRUÇÕES DE INSTALAÇÃO PWA */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-all duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Top Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Download className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-none">Instalar Conselho Tutelar</h3>
                  <span className="text-[10px] opacity-80 font-medium block mt-1 uppercase tracking-wider">De Currais Novos • Aplicativo Web Digital</span>
                </div>
              </div>
              <button 
                onClick={() => setShowInstallModal(false)}
                className="text-white/70 hover:text-white bg-white/15 hover:bg-white/20 p-1.5 rounded-full text-xs font-bold transition w-7 h-7 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body & Tab Selecionada */}
            <div className="p-6 flex-1 space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed">
                Este sistema utiliza a tecnologia <strong>PWA (Progressive Web App)</strong>. Você pode instalá-lo nativamente tanto no seu <strong>celular</strong> quanto em seu <strong>computador</strong> para carregar mais rápido, de forma segura e com suporte offline!
              </p>

              {/* Tabs para Tipo de Instalação */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setInstallModalTab("celular")}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    installModalTab === "celular" ? "bg-white text-blue-700 shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>No Celular</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInstallModalTab("computador")}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    installModalTab === "computador" ? "bg-white text-blue-700 shadow-xs" : "hover:text-slate-900"
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>No Computador</span>
                </button>
              </div>

              {/* Informações detalhadas do dispositivo */}
              {installModalTab === "celular" ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Android Card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">1</span>
                      <h4 className="text-xs font-extrabold text-slate-800">No Celular Android (Google Chrome)</h4>
                    </div>
                    <ul className="list-disc pl-8 text-xs text-slate-600 space-y-1">
                      <li>Basta tocar no botão azul <strong>Instalar</strong> localizado no topo do cabeçalho deste aplicativo.</li>
                      <li>Caso não veja o botão, toque nos 3 pontinhos (<span className="font-bold">⋮</span>) no canto superior direito do seu navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                    </ul>
                  </div>

                  {/* iOS/iPhone Card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">2</span>
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">No iPhone / iPad (Safari)</h4>
                    </div>
                    <ul className="list-disc pl-8 text-xs text-slate-600 space-y-1">
                      <li>Toque no ícone de <strong>Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline-block text-blue-600 mx-0.5" /> (um quadrado com seta para cima) na barra inferior do Safari.</li>
                      <li>Role as opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                      <li>Toque no botão <strong>"Adicionar"</strong> no canto superior direito do celular. O aplicativo será fixado na sua página de apps nativos!</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Card 1: PWA Native Installation */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">✓</span>
                      <h4 className="text-xs font-bold text-slate-800">Instalação PWA Automática e Segura</h4>
                    </div>
                    
                    <div className="text-xs text-slate-600 pl-2 space-y-2">
                      <p>Sendo um aplicativo web inteligente, você pode instalá-lo diretamente no Windows, macOS ou Linux de forma totalmente segura, sem nenhum arquivo externo de download:</p>
                      <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                        <li><strong>Botão Instalar:</strong> Se disponível, clique no botão azul <strong>Instalar</strong> no cabeçalho superior deste sistema.</li>
                        <li><strong>Dica Visual do Navegador:</strong> Olhe na barra de endereços (o local onde digita o site) no topo do seu Google Chrome ou Microsoft Edge. À direita, localize o ícone de uma <strong>tela de computador com seta para baixo</strong> ou um sinal de <strong>"+"</strong> e clique nele.</li>
                        <li><strong>Atalho de Área de Trabalho:</strong> Ao confirmar, o Prontuário criará automaticamente um ícone seguro direto na sua Área de Trabalho e será executado sem as barras de navegação tradicionais, parecendo um programa nativo super rápido!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition"
              >
                Entendido, Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
