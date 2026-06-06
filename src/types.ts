/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StatusCase = "Aberto" | "Em Acompanhamento" | "Concluido";

export interface Responsible {
  nome: string;
  parentesco: string;
  telefone: string;
  profissao: string;
}

export interface FollowUpLog {
  id: string;
  data: string; // ISO string or YYYY-MM-DD
  descricao: string;
  conselheiro: string;
}

export interface AtendimentoCase {
  id: string;
  numeroRegistro: string; // E.g., CT-2026-0001
  dataHora: string; // YYYY-MM-DDTHH:mm
  
  // Dados da Criança/Adolescente
  criancaNome: string;
  criancaIdade: number;
  criancaDataNascimento: string; // YYYY-MM-DD
  criancaGen: string; // Masculino, Feminino, Outro
  criancaDocumento: string; // RG, CPF ou Certidão
  criancaEndereco: string;
  criancaEscola: string;
  
  // Responsáveis
  responsavelPrincipal: Responsible;
  outroResponsavel?: Responsible;
  
  // Detalhes da Ocorrência
  tipoOcorrencia: string;
  subTipoOcorrencia?: string;
  descricaoOcorrencia: string;
  denuncianteSigilo: boolean;
  denuncianteNome?: string;
  denuncianteTelefone?: string;
  
  // Medidas Aplicadas (Art 101 e 129 do ECA)
  medidasCrianca: string[]; // Lista das medidas do Art. 101
  medidasPais: string[]; // Lista das medidas do Art. 129
  outrasProvidencias?: string;
  
  // Controle e Histórico
  status: StatusCase;
  historico: FollowUpLog[];
  conselheiroResponsavel: string;
  dataUltimaAtualizacao: string;
}

// Catálogos padronizados para o formulário
export const TIPOS_OCORRENCIA = [
  "Negligência (Falta de cuidados básicos, higiene, alimentação, etc.)",
  "Maus-tratos / Violência Física",
  "Violência Verbal / Psicológica",
  "Abuso Sexual / Exploração Sexual",
  "Evasão Escolar / Violação do Direito à Educação",
  "Trabalho Infantil",
  "Uso de Substâncias por Responsáveis",
  "Uso de Substâncias pelo Adolescente",
  "Violação de Direito à Saúde / Falta de Tratamento/Vacinas",
  "Abandono Intelectual ou Material",
  "Conflito Familiar Grave (Alienação, agressões verbais)",
  "Adolescente em Conflito com a Lei (Apoio inicial)",
  "Outros casos de violação de direitos (ECA Art. 98)"
];

export const MEDIDAS_PROTECAO_101 = [
  "Art. 101, I - Encaminhamento aos pais ou responsável, mediante termo",
  "Art. 101, II - Orientação, apoio e acompanhamento temporários",
  "Art. 101, III - Matrícula e frequência obrigatórias em estabelecimento oficial",
  "Art. 101, IV - Inclusão em programa oficial ou comunitário de auxílio à família",
  "Art. 101, V - Requisição de tratamento médico, psicológico ou psiquiátrico",
  "Art. 101, VI - Inclusão em programa oficial ou comunitário para alcoólatras/toxicômanos",
  "Art. 101, VII - Acolhimento institucional",
  "Art. 101, VIII - Inclusão em programa de acolhimento familiar",
  "Art. 101, IX - Colocação em família substituta (Guarda/Tutela/Adoção)"
];

export const MEDIDAS_PAIS_129 = [
  "Art. 129, I - Encaminhamento a programa oficial de proteção e apoio à família",
  "Art. 129, II - Inclusão em programa de auxílio/tratamento contra adicção",
  "Art. 129, III - Encaminhamento a tratamento psicológico ou psiquiátrico",
  "Art. 129, IV - Encaminhamento a cursos ou palestras de orientação familiar",
  "Art. 129, V - Obrigação de matricular o filho e acompanhar frequência e aproveitamento",
  "Art. 129, VI - Obrigação de encaminhar a criança/adolescente a tratamento especializado",
  "Art. 129, VII - Advertência verbal/escrita oficial",
  "Art. 129, VIII - Perda da guarda (encaminhar ao Ministério Público)",
  "Art. 129, IX - Destituição da tutela (encaminhar ao MP)"
];
