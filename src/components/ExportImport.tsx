/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { AtendimentoCase } from "../types";
import { 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle,
  ShieldCheck,
  FileDown
} from "lucide-react";
import { MOCK_CASES } from "../mockData";

interface ExportImportProps {
  cases: AtendimentoCase[];
  onImport: (newCases: AtendimentoCase[]) => void;
  onClearAll: () => void;
  onResetSeed: () => void;
}

export default function ExportImport({ cases, onImport, onClearAll, onResetSeed }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(cases, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const today = new Date().toISOString().slice(0, 10);
      const exportFileDefaultName = `prontuario-conselho-tutelar-backup-${today}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      setSuccessMsg("Backup do prontuário digital exportado com sucesso!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg("Falha ao exportar backup.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Validacao simples de estrutura
          const isValid = parsed.every(item => item.criancaNome && item.tipoOcorrencia && item.id);
          if (isValid) {
            onImport(parsed);
            setSuccessMsg(`Importado com sucesso! ${parsed.length} atendimentos adicionados ao sistema.`);
            setErrorMsg("");
            setTimeout(() => setSuccessMsg(""), 4500);
          } else {
            setErrorMsg("O arquivo JSON não parece ser um backup válido de atendimentos.");
          }
        } else {
          setErrorMsg("Estrutura incorreta. Certifique-se de carregar um array de casos.");
        }
      } catch (err) {
        setErrorMsg("Erro de Sintaxe no arquivo JSON. Verifique o arquivo.");
      }
    };
    fileReader.readAsText(files[0]);
    // Reset para permitir re-upload do mesmo arquivo
    e.target.value = "";
  };

  const handleClearAllClick = () => {
    if (window.confirm("ATENÇÃO: Você deseja apagar TODOS os atendimentos registrados localmente? Essa ação é definitiva e não pode ser desfeita. Exporte um backup primeiro!")) {
      onClearAll();
      setSuccessMsg("Prontuário digital limpo com absoluto sucesso. Começando do zero.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const handleResetSeedClick = () => {
    if (window.confirm("Deseja restaurar os casos demonstrativos de teste do Conselho? Isso sobrescreverá registros atuais.")) {
      onResetSeed();
      setSuccessMsg("Base demonstrativa do Conselho Tutelar restaurada.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-6">
      
      <div className="space-y-1.5 border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Segurança, Backup e Sincronização Local (Sem Papel)
        </h3>
        <p className="text-xs text-slate-500">
          Toda informação registrada neste programa de apoio ao Conselho Tutelar é arquivada localmente (no navegador do dispositivo) para respeitar o Estatuto da Criança e do Adolescente (ECA). Use as ações abaixo para manter backup redundantes e arquivar de forma profissional.
        </p>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-205 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-205 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid de Açoes de Backup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-xs">
        
        {/* Painel de Exportacao */}
        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
          <h4 className="font-bold text-slate-700 block">Exportar Prontuário de Atendimentos</h4>
          <p className="text-slate-500 leading-normal">
            Baixe o prontuário completo de {cases.length} casos formatados em arquivo JSON seguro. Você pode guardar este arquivo em um pendrive ou computador seguro como um backup redundante sem risco de perder dados caso mude de computador.
          </p>
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Backup JSON
          </button>
        </div>

        {/* Painel de Importação */}
        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3">
          <h4 className="font-bold text-slate-700 block">Importar Prontuário (.json)</h4>
          <p className="text-slate-500 leading-normal">
            Carregue um arquivo JSON gerado anteriormente pelo sistema para restaurar de forma instantânea todos os históricos, medidas aplicadas, filiações, idades e ocorrências.
          </p>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Importar Backup
          </button>
        </div>

      </div>

      {/* Grid de Administração - Limpar/Restaurar Base de Teste */}
      <div className="border-t border-slate-100 pt-5 space-y-4 text-xs">
        <h4 className="font-bold text-slate-700">Zona Administrativa de Desenvolvimento</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleResetSeedClick}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-55 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-blue-600" /> Restaurar Banco de Exemplos
          </button>
          
          <button
            onClick={handleClearAllClick}
            className="px-4 py-2 border border-rose-220 hover:bg-rose-50 text-rose-700 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" /> Apagar Todo Histórico Local
          </button>
        </div>
      </div>

    </div>
  );
}
