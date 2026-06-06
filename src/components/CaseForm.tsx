/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  AtendimentoCase, 
  Responsible, 
  TIPOS_OCORRENCIA, 
  MEDIDAS_PROTECAO_101, 
  MEDIDAS_PAIS_129,
  StatusCase 
} from "../types";
import { 
  Save, 
  X, 
  Baby, 
  UserCheck, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react";

interface CaseFormProps {
  caseToEdit?: AtendimentoCase | null;
  onSave: (caseData: Omit<AtendimentoCase, "id" | "numeroRegistro" | "historico" | "dataUltimaAtualizacao"> & { id?: string }) => void;
  onCancel: () => void;
}

export default function CaseForm({ caseToEdit, onSave, onCancel }: CaseFormProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  // Form State
  const [criancaNome, setCriancaNome] = useState("");
  const [criancaIdade, setCriancaIdade] = useState<number>(0);
  const [criancaDataNascimento, setCriancaDataNascimento] = useState("");
  const [criancaGen, setCriancaGen] = useState("Masculino");
  const [criancaDocumento, setCriancaDocumento] = useState("");
  const [criancaEndereco, setCriancaEndereco] = useState("");
  const [criancaEscola, setCriancaEscola] = useState("");

  const [respNome, setRespNome] = useState("");
  const [respParentesco, setRespParentesco] = useState("Mãe");
  const [respTelefone, setRespTelefone] = useState("");
  const [respProfissao, setRespProfissao] = useState("");

  const [outroRespNome, setOutroRespNome] = useState("");
  const [outroRespParentesco, setOutroRespParentesco] = useState("Pai");
  const [outroRespTelefone, setOutroRespTelefone] = useState("");
  const [outroRespProfissao, setOutroRespProfissao] = useState("");

  const [tipoOcorrencia, setTipoOcorrencia] = useState(TIPOS_OCORRENCIA[0]);
  const [subTipoOcorrencia, setSubTipoOcorrencia] = useState("");
  const [descricaoOcorrencia, setDescricaoOcorrencia] = useState("");
  const [denuncianteSigilo, setDenuncianteSigilo] = useState(true);
  const [denuncianteNome, setDenuncianteNome] = useState("");
  const [denuncianteTelefone, setDenuncianteTelefone] = useState("");

  const [medidasCrianca, setMedidasCrianca] = useState<string[]>([]);
  const [medidasPais, setMedidasPais] = useState<string[]>([]);
  const [outrasProvidencias, setOutrasProvidencias] = useState("");

  const [status, setStatus] = useState<StatusCase>("Aberto");
  const [conselheiroResponsavel, setConselheiroResponsavel] = useState("");
  const [dataHora, setDataHora] = useState("");

  // Carregar dados existes para edição
  useEffect(() => {
    if (caseToEdit) {
      setCriancaNome(caseToEdit.criancaNome);
      setCriancaIdade(caseToEdit.criancaIdade);
      setCriancaDataNascimento(caseToEdit.criancaDataNascimento);
      setCriancaGen(caseToEdit.criancaGen);
      setCriancaDocumento(caseToEdit.criancaDocumento);
      setCriancaEndereco(caseToEdit.criancaEndereco);
      setCriancaEscola(caseToEdit.criancaEscola || "");

      setRespNome(caseToEdit.responsavelPrincipal.nome);
      setRespParentesco(caseToEdit.responsavelPrincipal.parentesco);
      setRespTelefone(caseToEdit.responsavelPrincipal.telefone);
      setRespProfissao(caseToEdit.responsavelPrincipal.profissao || "");

      if (caseToEdit.outroResponsavel) {
        setOutroRespNome(caseToEdit.outroResponsavel.nome);
        setOutroRespParentesco(caseToEdit.outroResponsavel.parentesco);
        setOutroRespTelefone(caseToEdit.outroResponsavel.telefone);
        setOutroRespProfissao(caseToEdit.outroResponsavel.profissao || "");
      } else {
        setOutroRespNome("");
        setOutroRespParentesco("Pai");
        setOutroRespTelefone("");
        setOutroRespProfissao("");
      }

      setTipoOcorrencia(caseToEdit.tipoOcorrencia);
      setSubTipoOcorrencia(caseToEdit.subTipoOcorrencia || "");
      setDescricaoOcorrencia(caseToEdit.descricaoOcorrencia || "");
      setDenuncianteSigilo(caseToEdit.denuncianteSigilo);
      setDenuncianteNome(caseToEdit.denuncianteNome || "");
      setDenuncianteTelefone(caseToEdit.denuncianteTelefone || "");

      setMedidasCrianca(caseToEdit.medidasCrianca || []);
      setMedidasPais(caseToEdit.medidasPais || []);
      setOutrasProvidencias(caseToEdit.outrasProvidencias || "");

      setStatus(caseToEdit.status);
      setConselheiroResponsavel(caseToEdit.conselheiroResponsavel);
      setDataHora(caseToEdit.dataHora);
    } else {
      // Data padrão hoje
      const now = new Date();
      const localString = now.toISOString().slice(0, 16);
      setDataHora(localString);
      // Valores iniciais vazios
      setCriancaNome("");
      setCriancaIdade(0);
      setCriancaDataNascimento("");
      setCriancaGen("Masculino");
      setCriancaDocumento("");
      setCriancaEndereco("");
      setCriancaEscola("");
      setRespNome("");
      setRespParentesco("Mãe");
      setRespTelefone("");
      setRespProfissao("");
      setOutroRespNome("");
      setOutroRespParentesco("Pai");
      setOutroRespTelefone("");
      setOutroRespProfissao("");
      setTipoOcorrencia(TIPOS_OCORRENCIA[0]);
      setSubTipoOcorrencia("");
      setDescricaoOcorrencia("");
      setDenuncianteSigilo(true);
      setDenuncianteNome("");
      setDenuncianteTelefone("");
      setMedidasCrianca([]);
      setMedidasPais([]);
      setOutrasProvidencias("");
      setStatus("Aberto");
      setConselheiroResponsavel(localStorage.getItem("conselho_tutelar_conselheiro") || "ElderCosta");
    }
  }, [caseToEdit]);

  // Handler para calcular a idade ao mudar nascimento
  const handleNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCriancaDataNascimento(val);
    if (val) {
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCriancaIdade(Math.max(0, age));
    }
  };

  const toggleMedidaCrianca = (medida: string) => {
    if (medidasCrianca.includes(medida)) {
      setMedidasCrianca(medidasCrianca.filter(m => m !== medida));
    } else {
      setMedidasCrianca([...medidasCrianca, medida]);
    }
  };

  const toggleMedidaPais = (medida: string) => {
    if (medidasPais.includes(medida)) {
      setMedidasPais(medidasPais.filter(m => m !== medida));
    } else {
      setMedidasPais([...medidasPais, medida]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar dados básicos
    if (!criancaNome.trim()) {
      alert("Por favor, informe o nome da criança ou adolescente.");
      setActiveTab(0);
      return;
    }
    if (!respNome.trim()) {
      alert("Por favor, preencha o nome do responsável principal.");
      setActiveTab(0);
      return;
    }
    if (!descricaoOcorrencia.trim()) {
      alert("Por favor, descreva de maneira resumida os fatos da ocorrência.");
      setActiveTab(1);
      return;
    }

    const payload = {
      id: caseToEdit?.id,
      dataHora,
      criancaNome,
      criancaIdade: Number(criancaIdade),
      criancaDataNascimento,
      criancaGen,
      criancaDocumento,
      criancaEndereco,
      criancaEscola,
      responsavelPrincipal: {
        nome: respNome,
        parentesco: respParentesco,
        telefone: respTelefone,
        profissao: respProfissao
      },
      outroResponsavel: outroRespNome.trim() ? {
        nome: outroRespNome,
        parentesco: outroRespParentesco,
        telefone: outroRespTelefone,
        profissao: outroRespProfissao
      } : undefined,
      tipoOcorrencia,
      subTipoOcorrencia,
      descricaoOcorrencia,
      denuncianteSigilo,
      denuncianteNome: denuncianteSigilo ? "" : denuncianteNome,
      denuncianteTelefone: denuncianteSigilo ? "" : denuncianteTelefone,
      medidasCrianca,
      medidasPais,
      outrasProvidencias,
      status,
      conselheiroResponsavel: conselheiroResponsavel.trim() || "Conselheiro de Plantão"
    };

    onSave(payload);
  };

  // Ícones e descrições das guias para o topo
  const tabs = [
    { title: "Identificação", desc: "Criança & Responsáveis", icon: Baby },
    { title: "Ocorrência", desc: "Tipificação & Fatos", icon: AlertCircle },
    { title: "Medidas Protetivas", desc: "Art. 101 e 129 ECA", icon: ShieldCheck },
    { title: "Conclusão", desc: "Conselheiro & Status", icon: UserCheck },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
      {/* Cabeçalho do Formulário */}
      <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            {caseToEdit ? `Editar Atendimento #${caseToEdit.numeroRegistro}` : "Novo Registro de Atendimento"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Zele pela privacidade e precisão ao cadastrar ocorrências do ECA.</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navegador de Abas */}
      <div className="border-b border-slate-100 bg-slate-50/50 overflow-x-auto scrollbar-none">
        <div className="flex px-4 min-w-[500px]">
          {tabs.map((tab, idx) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex-1 py-3 px-2 text-center border-b-2 font-medium transition-all text-xs flex flex-row items-center justify-center gap-2 ${
                  isActive 
                    ? "border-blue-600 text-blue-600 bg-white" 
                    : "border-transparent text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"
                }`}
              >
                <TabIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <div className="text-left">
                  <span className="block text-[11px] font-bold uppercase tracking-wider">{tab.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
        
        {/* ABA 0: IDENTIFICAÇÃO (CRIANÇA E RESPONSÁVEIS) */}
        {activeTab === 0 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Bloco Criança */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-blue-100 pb-1.5 flex items-center gap-1.5">
                <Baby className="w-4 h-4" /> Dados do Infantojuvenil
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    value={criancaNome}
                    onChange={(e) => setCriancaNome(e.target.value)}
                    placeholder="Nome da criança ou adolescente"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Gênero</label>
                  <select 
                    value={criancaGen}
                    onChange={(e) => setCriancaGen(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                  >
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Data de Nascimento</label>
                  <input 
                    type="date" 
                    value={criancaDataNascimento}
                    onChange={handleNascimentoChange}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Idade Calculada</label>
                  <input 
                    type="number" 
                    min="0"
                    max="18"
                    value={criancaIdade || ""}
                    onChange={(e) => setCriancaIdade(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    placeholder="Ex: 8"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Certidão Nac. / RG / CPF</label>
                  <input 
                    type="text" 
                    value={criancaDocumento}
                    onChange={(e) => setCriancaDocumento(e.target.value)}
                    placeholder="RG, Certidão ou CPF"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Endereço Completo</label>
                  <input 
                    type="text" 
                    value={criancaEndereco}
                    onChange={(e) => setCriancaEndereco(e.target.value)}
                    placeholder="Logradouro, número, bairro, cidade"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Escola de Frequência</label>
                  <input 
                    type="text" 
                    value={criancaEscola}
                    onChange={(e) => setCriancaEscola(e.target.value)}
                    placeholder="Nome do colégio ou creche oficial"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bloco de Responsáveis */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 border-b border-emerald-100 pb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Filiação & Responsável Principal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Responsável Principal *</label>
                  <input 
                    type="text" 
                    required
                    value={respNome}
                    onChange={(e) => setRespNome(e.target.value)}
                    placeholder="Nome completo do responsável"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Parentesco</label>
                  <select 
                    value={respParentesco}
                    onChange={(e) => setRespParentesco(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white"
                  >
                    <option>Mãe</option>
                    <option>Pai</option>
                    <option>Avó / Avô</option>
                    <option>Tia / Tio</option>
                    <option>Irmão / Irmã</option>
                    <option>Padastro / Madrasta</option>
                    <option>Guardião Oficial</option>
                    <option>Outro parentesco</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Telefone de Contato</label>
                  <input 
                    type="text" 
                    value={respTelefone}
                    onChange={(e) => setRespTelefone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none opacity-90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ocupação / Trabalho</label>
                  <input 
                    type="text" 
                    value={respProfissao}
                    onChange={(e) => setRespProfissao(e.target.value)}
                    placeholder="Profissão"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>

                {/* Segundo responsável opcional */}
                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-dotted border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Adicionar Outro Responsável (Opcional)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      value={outroRespNome}
                      onChange={(e) => setOutroRespNome(e.target.value)}
                      placeholder="Nome do outro responsável"
                      className="px-2.5 py-1.5 text-[11px] border border-slate-200 rounded bg-white col-span-1"
                    />
                    <select 
                      value={outroRespParentesco}
                      onChange={(e) => setOutroRespParentesco(e.target.value)}
                      className="px-2 py-1.5 text-[11px] border border-slate-200 rounded bg-white"
                    >
                      <option>Pai</option>
                      <option>Mãe</option>
                      <option>Padrasto</option>
                      <option>Madrasta</option>
                      <option>Tio / Tia</option>
                      <option>Avós</option>
                    </select>
                    <input 
                      type="text" 
                      value={outroRespTelefone}
                      onChange={(e) => setOutroRespTelefone(e.target.value)}
                      placeholder="Telefone"
                      className="px-2.5 py-1.5 text-[11px] border border-slate-200 rounded bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 1: OCORRÊNCIA E DENÚNCIA */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 border-b border-rose-100 pb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Tipificação da Violação do ECA
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Qualificação da Ocorrência *</label>
                  <select
                    value={tipoOcorrencia}
                    onChange={(e) => setTipoOcorrencia(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white font-medium text-slate-700"
                  >
                    {TIPOS_OCORRENCIA.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Direito Violado / Especificidade</label>
                  <input 
                    type="text" 
                    value={subTipoOcorrencia}
                    onChange={(e) => setSubTipoOcorrencia(e.target.value)}
                    placeholder="Ex: Maus tratos físicos, abuso psicológico, evasão prolongada"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Descrição Detalhada do Fato *</label>
                <textarea 
                  required
                  rows={4}
                  value={descricaoOcorrencia}
                  onChange={(e) => setDescricaoOcorrencia(e.target.value)}
                  placeholder="Relato circunstanciado da denúncia recebida ou fatos observados no primeiro atendimento..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none font-sans leading-relaxed"
                />
              </div>

              {/* Seção Denunciante */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Origem da Denúncia / Notificante</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={denuncianteSigilo}
                      onChange={(e) => setDenuncianteSigilo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-100"
                    />
                    <span className="text-xs font-bold text-rose-600">Sigilo Absoluto (Anônima)</span>
                  </label>
                </div>

                {!denuncianteSigilo && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <input 
                        type="text" 
                        value={denuncianteNome}
                        onChange={(e) => setDenuncianteNome(e.target.value)}
                        placeholder="Nome do denunciante / Órgão notificante"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        value={denuncianteTelefone}
                        onChange={(e) => setDenuncianteTelefone(e.target.value)}
                        placeholder="Telefone / Contato do notificante"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                  </div>
                )}
                {denuncianteSigilo && (
                  <p className="text-[11px] text-slate-500">
                    * Marcado em sigilo. Os dados do comunicante não serão arquivados de forma exposta no relatório oficial impresso para a família.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: MEDIDAS DO ECA (Art 101 e 129) */}
        {activeTab === 2 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Medidas Crianca Art 101 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-blue-100 pb-1.5">
                Medidas de Proteção Aplicáveis à Criança/Adolescente (Art. 101 do ECA)
              </h3>
              <p className="text-[11px] text-slate-400">Selecione uma ou mais medidas cabíveis aplicadas para reverter a situação de violação de direitos:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 border border-slate-100 p-2.5 rounded-lg bg-slate-50/60">
                {MEDIDAS_PROTECAO_101.map(medida => {
                  const isChecked = medidasCrianca.includes(medida);
                  return (
                    <label key={medida} className="flex gap-2.5 p-2 rounded hover:bg-white border border-transparent hover:border-slate-150 cursor-pointer select-none items-start">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMedidaCrianca(medida)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span className="text-[11px] text-slate-700 leading-normal">{medida}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Medidas Pais Art 129 */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 border-b border-emerald-100 pb-1.5">
                Medidas Aplicáveis aos Pais ou Responsável Legal (Art. 129 do ECA)
              </h3>
              <p className="text-[11px] text-slate-400">Obrigações e diretrizes de encaminhamento para a família no âmbito social e familiar:</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 border border-slate-100 p-2.5 rounded-lg bg-slate-50/60">
                {MEDIDAS_PAIS_129.map(medida => {
                  const isChecked = medidasPais.includes(medida);
                  return (
                    <label key={medida} className="flex gap-2.5 p-2 rounded hover:bg-white border border-transparent hover:border-slate-150 cursor-pointer select-none items-start">
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMedidaPais(medida)}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300"
                      />
                      <span className="text-[11px] text-slate-700 leading-normal">{medida}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Outras Providencias */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Outras Providências ou Encaminhamentos Complementares</label>
              <textarea 
                rows={2}
                value={outrasProvidencias}
                onChange={(e) => setOutrasProvidencias(e.target.value)}
                placeholder="Exemplo: Ofício enviado à Secretaria de Saúde, convocação de audiência ministerial, busca ativa..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* ABA 3: CONCLUSAO E CONFIGURAÇÃO DE CONTROLE */}
        {activeTab === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 border-b border-purple-100 pb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Finalização & Controle Administrativo
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Data/Hora do Atendimento Inicial *</label>
                <input 
                  type="datetime-local" 
                  required
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Conselheiro Responsável *</label>
                <input 
                  type="text" 
                  required
                  value={conselheiroResponsavel}
                  onChange={(e) => setConselheiroResponsavel(e.target.value)}
                  placeholder="Nome do conselheiro tutelar atuante"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Status do Caso</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusCase)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-white font-bold"
                >
                  <option value="Aberto">🔴 Aberto</option>
                  <option value="Em Acompanhamento">🟡 Em Acompanhamento</option>
                  <option value="Concluido">🟢 Concluido (Fechado)</option>
                </select>
              </div>
            </div>

            {/* Aviso prévio */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <p className="text-xs font-bold text-slate-700">✔️ Consentimento do ECA e Segurança:</p>
              <p className="text-[11px] text-slate-500 leading-normal">
                Ao salvar este registro, ele ficará disponível de forma privada em seu prontuário local de acompanhamento. Isso permite gerar relatórios demográficos, estatísticos por tipo de violência e termos formais de aplicação de medidas. Toda manipulação de dados sensíveis obedece ao dever de sigilo do Art. 17 e Art. 143 do ECA.
              </p>
            </div>
          </div>
        )}

        {/* Botoes de Navegacao Inferior */}
        <div className="flex justify-between items-center border-t border-slate-150 pt-5 mt-2">
          <div>
            {activeTab > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              Cancelar
            </button>
            
            {activeTab < tabs.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                Avançar <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" /> Gravar Registro
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
}
