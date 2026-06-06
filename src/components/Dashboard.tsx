/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AtendimentoCase } from "../types";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Award, 
  Activity,
  Calendar
} from "lucide-react";

interface DashboardProps {
  cases: AtendimentoCase[];
  onSelectCase: (caseId: string) => void;
}

export default function Dashboard({ cases, onSelectCase }: DashboardProps) {
  // Calculos de estatisticas
  const total = cases.length;
  const abertos = cases.filter(c => c.status === "Aberto").length;
  const acompanhamento = cases.filter(c => c.status === "Em Acompanhamento").length;
  const concluidos = cases.filter(c => c.status === "Concluido").length;

  // Ocorrencias por tipo
  const ocorrenciasByType: { [key: string]: number } = {};
  cases.forEach(c => {
    // Pegar o tipo principal (simplificar ate o primeiro parentese se houver)
    const shortType = c.tipoOcorrencia.split(" (")[0];
    ocorrenciasByType[shortType] = (ocorrenciasByType[shortType] || 0) + 1;
  });

  const sortedOcorrencias = Object.entries(ocorrenciasByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Faixas etarias
  const faixasEtarias = {
    "Primeira Infância (0-5 anos)": cases.filter(c => c.criancaIdade <= 5).length,
    "Infância (6-11 anos)": cases.filter(c => c.criancaIdade > 5 && c.criancaIdade <= 11).length,
    "Adolescência (12-17 anos)": cases.filter(c => c.criancaIdade >= 12).length,
  };

  // Casos urgentes recentes (Aberto nos ultimos dias)
  const casosRecentes = [...cases]
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Resumo Geral de Kpis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Casos</p>
            <h3 className="text-2xl font-bold text-slate-800">{total}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Registrados no sistema</p>
          </div>
        </div>

        {/* KPI 2: Abertas */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendentes / Abertos</p>
            <h3 className="text-2xl font-bold text-slate-800">{abertos}</h3>
            <p className="text-[10px] text-rose-500 mt-1 font-medium">Requerem atenção rápida</p>
          </div>
        </div>

        {/* KPI 3: Em Acompanhamento */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Acompanhamentos</p>
            <h3 className="text-2xl font-bold text-slate-800">{acompanhamento}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Monitoramento ativo em andamento</p>
          </div>
        </div>

        {/* KPI 4: Concluidas */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolvidos / Concluídos</p>
            <h3 className="text-2xl font-bold text-slate-800">{concluidos}</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-medium">Arquivados e protegidos</p>
          </div>
        </div>
      </div>

      {/* Grid de Gráficos Customizados e Ocorrências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Grafico de Volumetria de Ocorrências (Barra Customizada) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Tipos de Ocorrência mais Recorrentes
            </h3>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Top 5</span>
          </div>

          <div className="space-y-4 pt-2">
            {sortedOcorrencias.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Nenhum atendimento registrado no momento.</p>
            ) : (
              sortedOcorrencias.map(([type, count]) => {
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[280px] sm:max-w-xs">{type}</span>
                      <span className="text-slate-500">{count} {count === 1 ? "caso" : "casos"} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Estatísticas Demográficas e Faixa Etária */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Casos por Faixa Etária (ECA)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {Object.entries(faixasEtarias).map(([faixa, count]) => {
              const petcentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={faixa} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-center space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">{faixa}</span>
                  <span className="text-2xl font-bold text-slate-800 block">{count}</span>
                  <div className="inline-block px-1.5 py-0.5 text-[10px] bg-slate-200 text-slate-700 font-semibold rounded-md">
                    {petcentage.toFixed(0)}% do total
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-800 space-y-1">
              <span className="font-bold block">Regra Geral de Atenção Prontidão:</span>
              <p>Mantenha prioridade absoluta nos casos classificados como primeira infância (0 a 5 anos), conforme diretriz do Marco Legal da Primeira Infância e do ECA Art. 4º.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Linha do Tempo de Casos Recentes / Alerta Rápido */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          Atendimentos Recentes que Necessitam de Acompanhamento
        </h3>

        <div className="divide-y divide-slate-100">
          {casosRecentes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Nenhum atendimento pendente.</p>
          ) : (
            casosRecentes.map(c => (
              <div 
                key={c.id} 
                onClick={() => onSelectCase(c.id)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 p-2 rounded-lg transition-transform hover:-translate-y-px"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                      {c.numeroRegistro}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{c.criancaNome}</span>
                    <span className="text-xs text-slate-500">({c.criancaIdade} anos)</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{c.tipoOcorrencia}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-slate-400 block">Registrado em</span>
                    <span className="text-slate-600 font-semibold">{new Date(c.dataHora).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    c.status === "Aberto" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                    c.status === "Em Acompanhamento" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                    "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Rápido de Emergência / Dicas Legais para Conselheiros */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl self-start">
            <Award className="w-7 h-7 text-amber-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold">Atribuições do Conselho Tutelar (ECA Art. 136)</h3>
            <p className="text-xs text-blue-100 leading-relaxed max-w-4xl">
              O Conselho Tutelar é órgão autônomo, permanente e não jurisdicional encarregado pela sociedade de zelar pelo cumprimento dos direitos da criança e do adolescente. Aplique as medidas pertinentes com embasamento técnico e preencha sempre de forma detalhada o histórico para garantir a rastreabilidade em audiências públicas.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="text-[10.5px] bg-white/15 px-2.5 py-1 rounded-md">Art. 98 - Proteção integral</span>
              <span className="text-[10.5px] bg-white/15 px-2.5 py-1 rounded-md">Art. 101 - Medidas de proteção à criança</span>
              <span className="text-[10.5px] bg-white/15 px-2.5 py-1 rounded-md">Art. 129 - Obrigações dos responsáveis</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
