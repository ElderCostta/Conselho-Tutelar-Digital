/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AtendimentoCase, AgendaEvent, AgendaEventType } from "../types";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Briefcase,
  Scale,
  Home,
  Network,
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Info,
  Smartphone,
  Check,
  Send,
  Sparkles,
  Link2,
  ChevronRight,
  ShieldCheck,
  Search,
  CheckCircle
} from "lucide-react";

interface AgendaCompartilhadaProps {
  cases: AtendimentoCase[];
  conselheiroAtivo: string;
}

// Geração de datas relativas para manter a agenda sempre cheia de dados futuros realistas
const getRelativeDateStr = (daysOffset: number, hoursOffset: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hoursOffset);
  d.setMinutes(0);
  
  // Retorna formato YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const SEED_EVENTS = (): AgendaEvent[] => [
  {
    id: "evt-1",
    titulo: "Plantão Noturno - Elder Costa",
    tipo: "Plantão",
    dataHora: getRelativeDateStr(0, 2), // hoje daqui a 2 horas
    duracaoMinutes: 720,
    desc: "Coordenar plantão noturno emergencial para acolhimento de denúncias vindas da delegacia civil.",
    local: "Sede do Conselho Tutelar - Currais Novos",
    conselheirosEscalados: ["ElderCosta", "NoêmiaAssunção"],
    status: "Agendado",
    enviarLembreteEmail: true,
    enviarLembreteSms: true,
    enviarLembreteWhatsapp: true,
    lembreteAntecedencia: 60,
    notificacaoDisparada: false
  },
  {
    id: "evt-2",
    titulo: "Audiência de Conciliação Familiar - Menor G.S.",
    tipo: "Audiência",
    dataHora: getRelativeDateStr(1, 3), // amanhã 
    duracaoMinutes: 90,
    desc: "Acompanhamento do caso de alienação parental e agressão verbal. Intimados pais e testemunhas no Ministério Público.",
    local: "Fórum Desembargador Tomaz Salustino",
    conselheirosEscalados: ["MariaLúcia"],
    status: "Agendado",
    enviarLembreteEmail: true,
    enviarLembreteSms: true,
    enviarLembreteWhatsapp: true,
    lembreteAntecedencia: 120,
    notificacaoDisparada: false
  },
  {
    id: "evt-3",
    titulo: "Visita Domiciliar - Família Silva Ramos",
    tipo: "Visita Domiciliar",
    dataHora: getRelativeDateStr(2, -1), // em 2 dias
    duracaoMinutes: 60,
    desc: "Verificação de denúncia de negligência alimentar e higiene. Aplicação de busca ativa preliminar.",
    local: "Bairro JK, Rua Francisca de Souza, N 140",
    conselheirosEscalados: ["ElderCosta", "KátiaMedeiros"],
    status: "Agendado",
    enviarLembreteEmail: false,
    enviarLembreteSms: true,
    enviarLembreteWhatsapp: true,
    lembreteAntecedencia: 30,
    notificacaoDisparada: false
  },
  {
    id: "evt-4",
    titulo: "Reunião de Rede Socioassistencial (CREAS/RPS)",
    tipo: "Reunião de Rede",
    dataHora: getRelativeDateStr(3, 4), // em 3 dias
    duracaoMinutes: 180,
    desc: "Alinhamento das medidas de proteção aplicadas para evasões escolares recorrentes no município e planejamento de busca ativa unificada.",
    local: "Auditório da Prefeitura de Currais Novos",
    conselheirosEscalados: ["ElderCosta", "NoêmiaAssunção", "MariaLúcia", "CláudiaGarcia", "KátiaMedeiros"],
    status: "Agendado",
    enviarLembreteEmail: true,
    enviarLembreteSms: false,
    enviarLembreteWhatsapp: true,
    lembreteAntecedencia: 240,
    notificacaoDisparada: false
  },
  {
    id: "evt-5",
    titulo: "Reunião do Colegiado Deliberativo Ordinário",
    tipo: "Reunião do Colegiado",
    dataHora: getRelativeDateStr(4, 1), // em 4 dias
    duracaoMinutes: 120,
    desc: "Deliberação sobre novos prontuários abertos, avaliação de relatórios trimestrais e assinatura conjunta de termos de responsabilidade.",
    local: "Sala de Reuniões Internas - Sede CT",
    conselheirosEscalados: ["ElderCosta", "NoêmiaAssunção", "MariaLúcia", "CláudiaGarcia", "KátiaMedeiros"],
    status: "Agendado",
    enviarLembreteEmail: true,
    enviarLembreteSms: false,
    enviarLembreteWhatsapp: false,
    lembreteAntecedencia: 60,
    notificacaoDisparada: false
  }
];

export default function AgendaCompartilhada({ cases, conselheiroAtivo }: AgendaCompartilhadaProps) {
  // Estado local para eventos
  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    const saved = localStorage.getItem("ct_agenda_eventos");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SEED_EVENTS();
      }
    }
    return SEED_EVENTS();
  });

  // Estado para aba ativa de filtros internos (Todos / Plantões / Audiências / Visitas / Reuniões)
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Estado de notificações automáticas disparadas recentes (Logs virtuais de e-mail / SMS / WhatsApp)
  const [notifLogs, setNotifLogs] = useState<{
    id: string;
    tempo: string;
    tipoCanal: "SMS" | "WhatsApp" | "E-mail";
    destinatario: string;
    mensagem: string;
    status: "Enviado" | "Agendado";
  }[]>(() => {
    const saved = localStorage.getItem("ct_agenda_notif_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: "l-1",
        tempo: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString("pt-BR"),
        tipoCanal: "WhatsApp",
        destinatario: "+55 (84) 99881-2201 (Elder Costa)",
        mensagem: "Lembrete automático: Seu Plantão Noturno em Currais Novos inicia em 60 min. Favor comparecer à sede.",
        status: "Enviado"
      },
      {
        id: "l-2",
        tempo: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString("pt-BR"),
        tipoCanal: "SMS",
        destinatario: "+55 (84) 98711-3004 (Família Silva)",
        mensagem: "Lembrete de compromisso: Visita domiciliar agendada do Conselho Tutelar em sua residência no dia " + new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR") + ".",
        status: "Enviado"
      }
    ];
  });

  // Estado para controle de criação de novo evento
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<AgendaEvent>>({
    titulo: "",
    tipo: "Plantão",
    dataHora: "",
    duracaoMinutes: 60,
    desc: "",
    local: "",
    caseId: "",
    envolvidosCrianca: "",
    conselheirosEscalados: [conselheiroAtivo],
    status: "Agendado",
    enviarLembreteEmail: true,
    enviarLembreteSms: true,
    enviarLembreteWhatsapp: true,
    lembreteAntecedencia: 60
  });

  // Salvar no localstorage
  useEffect(() => {
    localStorage.setItem("ct_agenda_eventos", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("ct_agenda_notif_logs", JSON.stringify(notifLogs));
  }, [notifLogs]);

  // Alerta Virtual: Monitoração automática em tempo real dos lembretes simulados!
  useEffect(() => {
    const checkUpcomingLembretes = () => {
      let updatedAny = false;
      const now = new Date();
      const nextLogs = [...notifLogs];
      const nextEvents = events.map(evt => {
        const evtTime = new Date(evt.dataHora);
        const diffMs = evtTime.getTime() - now.getTime();
        const diffMin = Math.round(diffMs / (60 * 1000));
        
        // Se faltar menos que a antecedência configurada E o evento estiver agendado E ainda não disparou
        if (diffMin > 0 && diffMin <= evt.lembreteAntecedencia && !evt.notificacaoDisparada && evt.status === "Agendado") {
          updatedAny = true;
          evt.notificacaoDisparada = true;

          // Disparar canais virtuais de notificação
          if (evt.enviarLembreteSms) {
            nextLogs.unshift({
              id: "gen-sms-" + Math.random().toString(36).substring(2, 7),
              tempo: new Date().toLocaleTimeString("pt-BR"),
              tipoCanal: "SMS",
              destinatario: "Responsáveis Integrados / Conselheiros",
              mensagem: `ALERTA CT: Lembrete do evento "${evt.titulo}" em breve [Local: ${evt.local}].`,
              status: "Enviado"
            });
          }
          if (evt.enviarLembreteWhatsapp) {
            nextLogs.unshift({
              id: "gen-wa-" + Math.random().toString(36).substring(2, 7),
              tempo: new Date().toLocaleTimeString("pt-BR"),
              tipoCanal: "WhatsApp",
              destinatario: `Contatos do Colegiado (${evt.conselheirosEscalados.join(", ")})`,
              mensagem: `⚠️ NOTIFICAÇÃO DE EVENTO EM APRESSO: "${evt.titulo}" está agendado para ${new Date(evt.dataHora).toLocaleString("pt-BR")}. Local: ${evt.local}.`,
              status: "Enviado"
            });
          }
          if (evt.enviarLembreteEmail) {
            nextLogs.unshift({
              id: "gen-mail-" + Math.random().toString(36).substring(2, 7),
              tempo: new Date().toLocaleTimeString("pt-BR"),
              tipoCanal: "E-mail",
              destinatario: "colegiado@conselhotutelar-cn.gov.br",
              mensagem: `Conselho Tutelar Digital - Compromisso Iminente: "${evt.titulo}". Detalhes adicionais compilados no prontuário eletrônico municipal.`,
              status: "Enviado"
            });
          }
        }
        return evt;
      });

      if (updatedAny) {
        setEvents(nextEvents);
        setNotifLogs(nextLogs.slice(0, 30)); // Máximo 30 logs ativos na tela
      }
    };

    const interval = setInterval(checkUpcomingLembretes, 10000); // Checa a cada 10s
    return () => clearInterval(interval);
  }, [events, notifLogs]);

  // Função para simular o teste manual de envio de notificações
  const [isSimulating, setIsSimulating] = useState(false);
  const handleTestNotifications = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const logsAdicionais = [
        {
          id: "test-wa-" + Date.now(),
          tempo: new Date().toLocaleTimeString("pt-BR"),
          tipoCanal: "WhatsApp" as const,
          destinatario: "+55 (84) 99881-2201 (Elder Costa)",
          mensagem: "Sincronização de Notificações ativada! Lembrete enviado p/ todos os agentes de plantão ativo.",
          status: "Enviado" as const
        },
        {
          id: "test-sms-" + Date.now(),
          tempo: new Date().toLocaleTimeString("pt-BR"),
          tipoCanal: "SMS" as const,
          destinatario: "Prontuários Ativos de Currais Novos",
          mensagem: "Sistemas de alertas civis automatizados testados e calibrados com sucesso.",
          status: "Enviado" as const
        }
      ];
      setNotifLogs(prev => [...logsAdicionais, ...prev]);
      setIsSimulating(false);
    }, 1500);
  };

  // Excluir evento
  const handleDeleteEvent = (id: string) => {
    if (confirm("Deseja realmente remover este compromisso da agenda compartilhada do colegiado?")) {
      const filtered = events.filter(e => e.id !== id);
      setEvents(filtered);
    }
  };

  // Concluir evento
  const handleToggleStatus = (id: string) => {
    const updated = events.map(e => {
      if (e.id === id) {
        const nextStatus = e.status === "Agendado" ? "Concluído" : "Agendado";
        return { ...e, status: nextStatus as "Agendado" | "Concluído" };
      }
      return e;
    });
    setEvents(updated);
  };

  // Cadastrar Novo Evento
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.titulo || !newEvent.dataHora || !newEvent.local) {
      alert("Por favor, preencha oTítulo, Data/Hora e Localização do compromisso.");
      return;
    }

    const created: AgendaEvent = {
      id: "evt-" + Date.now(),
      titulo: newEvent.titulo,
      tipo: newEvent.tipo as AgendaEventType,
      dataHora: newEvent.dataHora,
      duracaoMinutes: Number(newEvent.duracaoMinutes || 60),
      desc: newEvent.desc || "Sem descrição adicional inserida.",
      local: newEvent.local,
      caseId: newEvent.caseId || undefined,
      envolvidosCrianca: newEvent.envolvidosCrianca || undefined,
      conselheirosEscalados: newEvent.conselheirosEscalados || [conselheiroAtivo],
      status: "Agendado",
      enviarLembreteEmail: !!newEvent.enviarLembreteEmail,
      enviarLembreteSms: !!newEvent.enviarLembreteSms,
      enviarLembreteWhatsapp: !!newEvent.enviarLembreteWhatsapp,
      lembreteAntecedencia: Number(newEvent.lembreteAntecedencia || 60),
      notificacaoDisparada: false
    };

    const updatedEvents = [created, ...events];
    // Ordenar por ordem cronológica decrescente ou crescente? Vamos colocar mais recentes primeiro ou ordenar por data
    updatedEvents.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

    setEvents(updatedEvents);
    setShowCreateModal(false);

    // Adiciona log inicial
    const logInfo = {
      id: "log-" + Date.now(),
      tempo: new Date().toLocaleTimeString("pt-BR"),
      tipoCanal: "WhatsApp" as const,
      destinatario: `Conselheiro: ${conselheiroAtivo}`,
      mensagem: `Novo evento agendado com sucesso: "${created.titulo}" para ${new Date(created.dataHora).toLocaleString("pt-BR")}.`,
      status: "Agendado" as const
    };
    setNotifLogs(prev => [logInfo, ...prev]);

    // Reset form
    setNewEvent({
      titulo: "",
      tipo: "Plantão",
      dataHora: "",
      duracaoMinutes: 60,
      desc: "",
      local: "",
      caseId: "",
      envolvidosCrianca: "",
      conselheirosEscalados: [conselheiroAtivo],
      status: "Agendado",
      enviarLembreteEmail: true,
      enviarLembreteSms: true,
      enviarLembreteWhatsapp: true,
      lembreteAntecedencia: 60
    });
  };

  // Listar conselheiros disponíveis para escala
  const CONSELHEIROS_LIST = [
    "ElderCosta",
    "NoêmiaAssunção",
    "MariaLúcia",
    "CláudiaGarcia",
    "KátiaMedeiros"
  ];

  // Alternar conselheiros escalados no formulário
  const handleToggleConselheiroEscalado = (nome: string) => {
    const atual = newEvent.conselheirosEscalados || [];
    if (atual.includes(nome)) {
      setNewEvent({
        ...newEvent,
        conselheirosEscalados: atual.filter(n => n !== nome)
      });
    } else {
      setNewEvent({
        ...newEvent,
        conselheirosEscalados: [...atual, nome]
      });
    }
  };

  // Filtragem final dos eventos
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.local.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.envolvidosCrianca && evt.envolvidosCrianca.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = activeTypeFilter === "Todos" || evt.tipo === activeTypeFilter;

    return matchesSearch && matchesType;
  });

  const getTipoIcon = (tipo: AgendaEventType) => {
    switch (tipo) {
      case "Plantão":
        return <Briefcase className="w-4.5 h-4.5 text-blue-500" />;
      case "Audiência":
        return <Scale className="w-4.5 h-4.5 text-rose-500" />;
      case "Visita Domiciliar":
        return <Home className="w-4.5 h-4.5 text-amber-500" />;
      case "Reunião de Rede":
        return <Network className="w-4.5 h-4.5 text-indigo-500" />;
      case "Reunião do Colegiado":
        return <Users className="w-4.5 h-4.5 text-emerald-500" />;
    }
  };

  const getTipoBadgeColor = (tipo: AgendaEventType) => {
    switch (tipo) {
      case "Plantão":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "Audiência":
        return "bg-rose-50 text-rose-700 border-rose-200/60";
      case "Visita Domiciliar":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      case "Reunião de Rede":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/60";
      case "Reunião do Colegiado":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
  };

  // Contagem de eventos hoje e próximos
  const totalAgendados = events.filter(e => e.status === "Agendado").length;
  const totalPlantao = events.filter(e => e.tipo === "Plantão" && e.status === "Agendado").length;
  const totalAudiencias = events.filter(e => e.tipo === "Audiência" && e.status === "Agendado").length;
  const totalVisitas = events.filter(e => e.tipo === "Visita Domiciliar" && e.status === "Agendado").length;

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-0 text-slate-800">
      
      {/* SEÇÃO DA ESQUERDA: LISTA E CONTROLES DE COMPROMISSOS */}
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Cabeçalho da Agenda */}
        <div className="p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 leading-tight">Agenda Compartilhada do Colegiado 📂</h2>
                <span className="text-xs font-bold text-slate-400 block mt-0.5 uppercase tracking-wide">
                  Planejamento unificado dos Conselheiros Tutelares
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition hover:scale-102 cursor-pointer shadow-sm select-none"
            >
              <Plus className="w-4 h-4 text-white" /> Agendar Compromisso
            </button>
          </div>

          {/* Cards Rápidos de Filtro/Totalizador */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
            <button 
              onClick={() => setActiveTypeFilter("Todos")}
              className={`p-2.5 rounded-xl border text-left transition ${
                activeTypeFilter === "Todos" 
                  ? "bg-slate-900 border-slate-900 text-white" 
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="text-[10px] uppercase font-black tracking-wide block opacity-75">Geral</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-lg font-black">{totalAgendados}</span>
                <span className="text-xs font-bold opacity-80">Eventos</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTypeFilter("Plantão")}
              className={`p-2.5 rounded-xl border text-left transition ${
                activeTypeFilter === "Plantão" 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="text-[10px] uppercase font-black tracking-wide block opacity-75">Plantões</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-lg font-black">{totalPlantao}</span>
                <span className="text-xs font-bold opacity-80">Ativos</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTypeFilter("Audiência")}
              className={`p-2.5 rounded-xl border text-left transition ${
                activeTypeFilter === "Audiência" 
                  ? "bg-rose-600 border-rose-600 text-white" 
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="text-[10px] uppercase font-black tracking-wide block opacity-75">Audiências</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-lg font-black">{totalAudiencias}</span>
                <span className="text-xs font-bold opacity-80">Previsões</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTypeFilter("Visita Domiciliar")}
              className={`p-2.5 rounded-xl border text-left transition ${
                activeTypeFilter === "Visita Domiciliar" 
                  ? "bg-amber-500 border-amber-500 text-white" 
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="text-[10px] uppercase font-black tracking-wide block opacity-75">V. Domiciliares</span>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-lg font-black">{totalVisitas}</span>
                <span className="text-xs font-bold opacity-80">Rotas</span>
              </div>
            </button>
          </div>

          {/* Campo de pesquisa rápida e filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar por compromisso, conselheiro, criança, local..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-9.5 pr-4 py-2.5 text-xs rounded-xl outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-500 hover:bg-slate-50/50 transition font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Abas auxiliares de Categoria */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5">
              {["Reunião de Rede", "Reunião do Colegiado"].map(extraTab => (
                <button
                  key={extraTab}
                  onClick={() => setActiveTypeFilter(activeTypeFilter === extraTab ? "Todos" : extraTab)}
                  className={`px-3 py-2 text-xs rounded-xl font-bold transition whitespace-nowrap cursor-pointer border ${
                    activeTypeFilter === extraTab 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200/40"
                  }`}
                >
                  {extraTab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-5 space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 px-4 space-y-3">
              <Calendar className="w-12 h-12 text-slate-350 mx-auto" />
              <p className="text-sm font-extrabold text-slate-500">Nenhum compromisso agendado para esta categoria.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Adicione compromissos como Plantões, Audiências no fórum municipal ou Visitas domiciliares para que o colegiado permaneça sincronizado.
              </p>
              <button
                onClick={() => { setActiveTypeFilter("Todos"); setSearchQuery(""); }}
                className="font-bold text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            filteredEvents.map(evt => {
              const dateObj = new Date(evt.dataHora);
              const dataFormatada = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
              const horaFormatada = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              const isToday = new Date().toDateString() === dateObj.toDateString();

              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white border rounded-2xl p-4.5 hover:shadow-md transition duration-200 space-y-3.5 relative ${
                    evt.status === "Concluído" 
                      ? "border-emerald-100 bg-emerald-50/5 opacity-80" 
                      : isToday 
                        ? "border-blue-300 ring-2 ring-blue-50/50" 
                        : "border-slate-150/80"
                  }`}
                >
                  {/* Status superior do evento */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1.5 ${getTipoBadgeColor(evt.tipo)}`}>
                        {getTipoIcon(evt.tipo)}
                        {evt.tipo}
                      </span>

                      {isToday && (
                        <span className="bg-blue-600 text-white font-black text-[9px] uppercase px-1.5 py-0.5 rounded tracking-widest animate-pulse">
                          HOJE ⏰
                        </span>
                      )}

                      {evt.status === "Concluído" && (
                        <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase px-1.5 py-0.5 rounded flex items-center gap-1">
                          ✓ Concluído
                        </span>
                      )}
                    </div>

                    {/* Botões de Ação na Direita */}
                    <div className="flex items-center gap-1.5 print:hidden">
                      <button
                        onClick={() => handleToggleStatus(evt.id)}
                        className={`p-1.5 rounded-lg transition border cursor-pointer ${
                          evt.status === "Concluído"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        }`}
                        title={evt.status === "Concluído" ? "Marcar como Pendente" : "Marcar como Concluído / Realizado"}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                        title="Remover compromisso"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes de Texto */}
                  <div className="space-y-1.5 text-left">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                      {evt.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-3xl whitespace-pre-line">
                      {evt.desc}
                    </p>
                  </div>

                  {/* Informações adicionais do Evento: Data, Local, Vinculos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/65 border border-slate-150/40 p-3.5 rounded-2xl text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Data & Hora</span>
                        <span className="font-extrabold text-slate-800">{dataFormatada} às {horaFormatada}</span>
                        <span className="text-[10px] text-slate-400 block">Duração: {evt.duracaoMinutes} min</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                       <div className="min-w-0">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Local</span>
                         <span className="font-semibold text-slate-800 block truncate" title={evt.local}>{evt.local}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <Users className="w-4 h-4 text-slate-400 shrink-0" />
                       <div>
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Escala de Responsáveis</span>
                         <div className="flex items-center gap-1 flex-wrap mt-0.5">
                           {evt.conselheirosEscalados.map(cons => (
                             <span key={cons} className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                               {cons}
                             </span>
                           ))}
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Vinculo de Caso Prontuário, se houver */}
                  {evt.envolvidosCrianca && (
                    <div className="flex items-center gap-2 text-xs bg-indigo-50/20 border border-indigo-100/50 p-2.5 rounded-xl text-left">
                      <Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="text-[11px] text-indigo-950 font-bold">
                        Vínculo de Atendimento: <span className="font-extrabold text-indigo-650">{evt.envolvidosCrianca}</span>
                        {evt.caseId && <span className="font-mono text-[10px] text-slate-400 ml-1">({evt.caseId.slice(0, 8)})</span>}
                      </div>
                    </div>
                  )}

                  {/* Alertas de Notificações Ativados */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100/60 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-400 font-bold">
                      <BellRing className="w-3.5 h-3.5 text-blue-500" />
                      <span>Notificações Automáticas Configuradas:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border flex items-center gap-1 ${
                        evt.enviarLembreteWhatsapp 
                          ? "bg-slate-50 border-emerald-300 text-emerald-700 font-bold" 
                          : "bg-slate-50 text-slate-300 border-slate-100"
                      }`}>
                        WhatsApp
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border flex items-center gap-1 ${
                        evt.enviarLembreteSms 
                          ? "bg-slate-50 border-blue-300 text-blue-700 font-bold" 
                          : "bg-slate-50 text-slate-300 border-slate-100"
                      }`}>
                        SMS
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase border flex items-center gap-1 ${
                        evt.enviarLembreteEmail 
                          ? "bg-slate-50 border-purple-300 text-purple-700 font-bold" 
                          : "bg-slate-50 text-slate-300 border-slate-100"
                      }`}>
                        E-mail
                      </span>
                      
                      <div className="h-4 w-px bg-slate-200 mx-1" />
                      <span className="text-[10px] text-slate-450 font-semibold font-mono">
                        Avisar {evt.lembreteAntecedencia} min antes
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* SEÇÃO DA DIREITA: CENTRAL DE NOTIFICAÇÕES AUTOMÁTICAS E GATEWAY */}
      <div className="w-full xl:w-96 space-y-6 shrink-0 font-sans text-left">
        
        {/* Painel Status dos Gateways de Mensageria */}
        <div className="bg-slate-900 border border-slate-850 text-white rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden">
          {/* Fundo decorativo neon sutil */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <BellRing className="w-4.5 h-4.5 text-emerald-400 animate-swing" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Central de Mensageria Ativa</h3>
              <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Drives Locais Integrados
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-350 leading-relaxed font-normal">
            As notificações de plantões, audiências e visitas são disparadas <strong>automaticamente</strong> para conselheiros, familiares e redes de proteção através de gateways locais simulados.
          </p>

          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                Gateway WhatsApp (API)
              </span>
              <span className="font-bold text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">
                Conectado (Mock)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-slate-500" />
                Servidor de E-mail (SMTP)
              </span>
              <span className="font-bold text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">
                Pronto
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                Serviço de SMS (Cellular)
              </span>
              <span className="font-bold text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase">
                Em Execução
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleTestNotifications}
              disabled={isSimulating}
              className="w-full py-2.5 bg-blue-650 hover:bg-blue-600 disabled:bg-blue-800 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer select-none border border-blue-500/30"
            >
              {isSimulating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sincronizando Alertas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Testar Disparo de Lembretes SMS</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* LOGS DE DISPAROS DE ALERTAS */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col space-y-3.5 max-h-[480px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500" />
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">Histórico de Alertas</h3>
            </div>
            <button 
              onClick={() => {
                if (confirm("Deseja limpar todos os registros locais de disparos?")) setNotifLogs([]);
              }}
              className="text-[10px] font-bold text-slate-450 hover:text-rose-600 transition cursor-pointer"
            >
              Limpar Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[350px] pr-1">
            {notifLogs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[11px] text-slate-400 font-bold">Nenhum alerta disparado recentemente.</p>
                <p className="text-[10px] text-slate-450 mt-1">Os alertas surgem de acordo com a antecedência dos eventos.</p>
              </div>
            ) : (
              notifLogs.map(log => (
                <div key={log.id} className="bg-slate-50 hover:bg-slate-100/80 border border-slate-150/40 p-2.5 rounded-xl text-xs space-y-1 transition text-left">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded font-black text-[9px] uppercase ${
                      log.tipoCanal === "WhatsApp" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" :
                      log.tipoCanal === "SMS" ? "bg-blue-50 text-blue-800 border border-blue-100" :
                      "bg-purple-50 text-purple-800 border border-purple-100"
                    }`}>
                      {log.tipoCanal}
                    </span>
                    <span className="text-slate-400 font-semibold font-mono">{log.tempo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Destino: {log.destinatario}</span>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-sans">{log.mensagem}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-indigo-50/40 border border-indigo-100/50 p-3 rounded-xl text-[10px] text-indigo-805 leading-relaxed flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong>Segurança Geral:</strong> Os números e nomes de família nos disparos herdam as regras e máscaras do <strong>Modo de Privacidade LGPD</strong> para manter dados confidenciais ocultos na rede.
            </div>
          </div>
        </div>

      </div>

      {/* MODAL DE CADASTRAR COMPROMISSO */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-150 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col transform transition-all font-sans"
            >
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-white" />
                  <h3 className="font-extrabold text-sm sm:text-base">Agendar Novo Evento Colegiativo</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="p-5 overflow-y-auto max-h-[80vh] space-y-4 text-left">
                
                {/* Título */}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Título do Compromisso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Plantão de Natal Costa, Reunião de Rede com CRAS"
                    value={newEvent.titulo}
                    onChange={(e) => setNewEvent({ ...newEvent, titulo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-bold"
                  />
                </div>

                {/* Grid Tipo, Data e Duração */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Tipo *</label>
                    <select
                      value={newEvent.tipo}
                      onChange={(e) => setNewEvent({ ...newEvent, tipo: e.target.value as AgendaEventType })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer font-bold text-slate-700"
                    >
                      <option value="Plantão">Plantão 🏢</option>
                      <option value="Audiência">Audiência ⚖️</option>
                      <option value="Visita Domiciliar">Visita Domiciliar 🏠</option>
                      <option value="Reunião de Rede">Reunião de Rede 🌐</option>
                      <option value="Reunião do Colegiado">Reunião do Colegiado 👥</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Data & Hora de Início *</label>
                    <input
                      type="datetime-local"
                      required
                      value={newEvent.dataHora}
                      onChange={(e) => setNewEvent({ ...newEvent, dataHora: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                {/* Local e Duração */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Localização física *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sala de Reunião Sede, Fórum Criminal"
                      value={newEvent.local}
                      onChange={(e) => setNewEvent({ ...newEvent, local: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Duração (Minutos)</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="60"
                      value={newEvent.duracaoMinutes}
                      onChange={(e) => setNewEvent({ ...newEvent, duracaoMinutes: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>

                {/* Vínculo opcional do prontuário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Vincular Atendimento (Opcional)</label>
                    <select
                      value={newEvent.caseId || ""}
                      onChange={(e) => {
                        const cid = e.target.value;
                        const c = cases.find(item => item.id === cid);
                        setNewEvent({
                          ...newEvent,
                          caseId: cid,
                          envolvidosCrianca: c ? `${c.numeroRegistro} - ${c.criancaNome}` : ""
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer font-bold text-slate-700"
                    >
                      <option value="">Nenhum prontuário</option>
                      {cases.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.numeroRegistro} • {c.criancaNome.slice(0, 15)}...
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Nome do Envolvido / Detalhes</label>
                    <input
                      type="text"
                      placeholder="Criança / Sigla"
                      value={newEvent.envolvidosCrianca || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, envolvidosCrianca: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Selecionar Conselheiros Escalados */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Agentes / Conselheiros Escalados</label>
                  <div className="flex flex-wrap gap-2">
                    {CONSELHEIROS_LIST.map(cons => {
                      const isSelected = newEvent.conselheirosEscalados?.includes(cons);
                      return (
                        <button
                          key={cons}
                          type="button"
                          onClick={() => handleToggleConselheiroEscalado(cons)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border cursor-pointer ${
                            isSelected 
                              ? "bg-blue-600 border-blue-600 text-white" 
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cons}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Descrição em texto */}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-extrabold text-slate-400 block">Pautas Extra / Descrição do Alinhamento</label>
                  <textarea
                    rows={2.5}
                    placeholder="Informações adicionais para conhecimento mútuo do Conselho Tutelar..."
                    value={newEvent.desc}
                    onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Configurações de Notificações Ativas */}
                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wide block">
                    Notificações e Lembretes Automáticos:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newEvent.enviarLembreteWhatsapp}
                        onChange={(e) => setNewEvent({ ...newEvent, enviarLembreteWhatsapp: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span>WhatsApp (API)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newEvent.enviarLembreteSms}
                        onChange={(e) => setNewEvent({ ...newEvent, enviarLembreteSms: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span>SMS Individual</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newEvent.enviarLembreteEmail}
                        onChange={(e) => setNewEvent({ ...newEvent, enviarLembreteEmail: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span>E-mail Colegiativo</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200">
                    <span className="text-xs text-slate-500 font-bold shrink-0">Disparar lembrete com antecedência de:</span>
                    <select
                      value={newEvent.lembreteAntecedencia}
                      onChange={(e) => setNewEvent({ ...newEvent, lembreteAntecedencia: Number(e.target.value) })}
                      className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={120}>2 horas</option>
                      <option value={1440}>1 dia</option>
                    </select>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                  >
                    Agendar Compromisso
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
