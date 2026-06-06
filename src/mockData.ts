/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AtendimentoCase } from "./types";

export const MOCK_CASES: AtendimentoCase[] = [
  {
    id: "case-1",
    numeroRegistro: "CT-2026-0042",
    dataHora: "2026-05-10T14:30",
    criancaNome: "Pedro Henrique Silva Santos",
    criancaIdade: 8,
    criancaDataNascimento: "2018-02-14",
    criancaGen: "Masculino",
    criancaDocumento: "Certidão nº 124.552-A",
    criancaEndereco: "Rua das Palmeiras, 45, Bairro Solar, São Paulo - SP",
    criancaEscola: "E.E. Padre José de Anchieta",
    responsavelPrincipal: {
      nome: "Sílvia Maria da Silva Santos",
      parentesco: "Mãe",
      telefone: "(11) 98765-4321",
      profissao: "Auxiliar de Serviços Gerais"
    },
    outroResponsavel: {
      nome: "Antônio Santos",
      parentesco: "Pai",
      telefone: "(11) 91111-2222",
      profissao: "Autônomo (não reside na mesma casa)"
    },
    tipoOcorrencia: "Evasão Escolar / Violação do Direito à Educação",
    subTipoOcorrencia: "Ausência recorrente de mais de 30 dias sem justificativa",
    descricaoOcorrencia: "A escola notificou o Conselho Tutelar após várias tentativas frustradas de contato telefônico e busca ativa escolar. O menor Pedro Henrique não frequenta as aulas há cerca de 5 semanas. Relatam que ele está ficando em casa sozinho cuidando do irmão mais novo.",
    denuncianteSigilo: false,
    denuncianteNome: "Diretora Regina - E.E. Padre José",
    denuncianteTelefone: "(11) 3456-7890",
    medidasCrianca: [
      "Art. 101, II - Orientação, apoio e acompanhamento temporários",
      "Art. 101, III - Matrícula e frequência obrigatórias em estabelecimento oficial"
    ],
    medidasPais: [
      "Art. 129, I - Encaminhamento a programa oficial de proteção e apoio à família",
      "Art. 129, V - Obrigação de matricular o filho e acompanhar frequência e aproveitamento"
    ],
    outrasProvidencias: "Ofício enviado ao CRAS para inclusão urgente em programa de transferência de renda e serviço de convivência e fortalecimento de vínculos.",
    status: "Em Acompanhamento",
    conselheiroResponsavel: "Conselheira Ana Paula Barbosa",
    dataUltimaAtualizacao: "2026-05-28T09:15",
    historico: [
      {
        id: "log-1-1",
        data: "2026-05-12T10:00",
        descricao: "Primeira visita domiciliar realizada pela Conselheira Ana Paula. Conversa com a mãe, D. Sílvia. Ela relatou que não tem com quem deixar o filho menor de 2 anos para trabalhar no período matutino, por isso Pedro acabava ficando em casa ajudando. Foi orientada sobre a gravidade da evasão escolar.",
        conselheiro: "Conselheira Ana Paula Barbosa"
      },
      {
        id: "log-1-2",
        data: "2026-05-15T14:00",
        descricao: "Emitido ofício CT-OF-112/2026 direcionado à Secretaria de Educação requisitando vaga em creche de período integral para o filho caçula de D. Sílvia, visando liberar Pedro para frequentar a escola.",
        conselheiro: "Conselheira Ana Paula Barbosa"
      },
      {
        id: "log-1-3",
        data: "2026-05-28T09:00",
        descricao: "Secretaria de Educação confirmou a vaga na creche municipal. Escola de Pedro notificou que o aluno retornou às atividades escolares nesta semana e que o conselho acompanhará a frequência mensal por meio de relatório escolar.",
        conselheiro: "Conselheira Ana Paula Barbosa"
      }
    ]
  },
  {
    id: "case-2",
    numeroRegistro: "CT-2026-0049",
    dataHora: "2026-06-02T10:15",
    criancaNome: "Mariana Oliveira Costa",
    criancaIdade: 15,
    criancaDataNascimento: "2011-04-22",
    criancaGen: "Feminino",
    criancaDocumento: "RG 54.321.098-X",
    criancaEndereco: "Av. Marginal das Flores, Bloco C, Apto 24, Campinas - SP",
    criancaEscola: "Escola Municipal Júlio Ribeiro",
    responsavelPrincipal: {
      nome: "Carla Oliveira Costa",
      parentesco: "Mãe",
      telefone: "(19) 99123-4567",
      profissao: "Balconista de Farmácia"
    },
    outroResponsavel: {
      nome: "Roberto Medeiros",
      parentesco: "Padrasto",
      telefone: "(19) 99421-9988",
      profissao: "Motorista"
    },
    tipoOcorrencia: "Maus-tratos / Violência Física",
    subTipoOcorrencia: "Supostas agressões físicas recorrentes praticadas pelo padrasto",
    descricaoOcorrencia: "Denúncia anônima via disque-violência apontando gritos e choro constante da adolescente na residência. Vizinhos relatam que a menor apresenta hematomas nos braços e evita sair de casa. Medo de represálias por parte do padrasto.",
    denuncianteSigilo: true,
    denuncianteNome: "",
    denuncianteTelefone: "",
    medidasCrianca: [
      "Art. 101, II - Orientação, apoio e acompanhamento temporários",
      "Art. 101, V - Requisição de tratamento médico, psicológico ou psiquiátrico"
    ],
    medidasPais: [
      "Art. 129, III - Encaminhamento a tratamento psicológico ou psiquiátrico",
      "Art. 129, VII - Advertência verbal/escrita oficial"
    ],
    outrasProvidencias: "Comunicação oficial ao Ministério Público e Delegacia de Defesa da Mulher (DDM) para as devidas providências legais. Adolescente e mãe encaminhadas em caráter de urgência para atendimento psicológico especializado no CREAS.",
    status: "Aberto",
    conselheiroResponsavel: "Conselheiro Marcos Vinícius Lopes",
    dataUltimaAtualizacao: "2026-06-03T16:40",
    historico: [
      {
        id: "log-2-1",
        data: "2026-06-02T15:30",
        descricao: "Atendimento presencial realizado na sede do Conselho Tutelar. A mãe compareceu acompanhada da adolescente, após convocação oficial. Mariana confirmou as agressões verbais do padrasto, mas negou de forma assustada as agressões físicas. Porém, foram constatados sinais de estresse severo e marcas de contenção física leve. A mãe foi alertada e orientada sobre o estatuto da criança e lei Bernardo (Lei Menino Bernardo).",
        conselheiro: "Conselheiro Marcos Vinícius Lopes"
      },
      {
        id: "log-2-2",
        data: "2026-06-03T16:30",
        descricao: "Emitida advertência oficial ao padrasto (Roberto Medeiros), bem como notificação de encaminhamento obrigatório para atendimento grupal de combate à violência doméstica. Guia de encaminhamento da adolescente para o CREAS entregue em mãos para a mãe.",
        conselheiro: "Conselheiro Marcos Vinícius Lopes"
      }
    ]
  },
  {
    id: "case-3",
    numeroRegistro: "CT-2026-0035",
    dataHora: "2026-04-18T08:00",
    criancaNome: "Lucas Rafael Souza",
    criancaIdade: 13,
    criancaDataNascimento: "2013-08-05",
    criancaGen: "Masculino",
    criancaDocumento: "CPF 456.789.123-00",
    criancaEndereco: "Travessa do Comércio, Centrinho, Porto Alegre - RS",
    criancaEscola: "E.M.E.F. Salgado Filho",
    responsavelPrincipal: {
      nome: "Regina Souza",
      parentesco: "Mãe",
      telefone: "(51) 98112-2334",
      profissao: "Desempregada"
    },
    tipoOcorrencia: "Trabalho Infantil",
    subTipoOcorrencia: "Venda de doces em semáforos no período noturno",
    descricaoOcorrencia: "Abordagem da equipe de assistência social identificou o menor vendendo balas em semáforo de grande movimento às 21h30. O menino estava exposto ao trânsito e frio. A família alegou extrema dificuldade financeira.",
    denuncianteSigilo: false,
    denuncianteNome: "Abordagem Social Municipal",
    denuncianteTelefone: "(51) 3289-1100",
    medidasCrianca: [
      "Art. 101, II - Orientação, apoio e acompanhamento temporários",
      "Art. 101, IV - Inclusão em programa oficial ou comunitário de auxílio à família"
    ],
    medidasPais: [
      "Art. 129, I - Encaminhamento a programa oficial de proteção e apoio à família",
      "Art. 129, IV - Encaminhamento a cursos ou palestras de orientação familiar"
    ],
    outrasProvidencias: "Inserção do núcleo familiar no Cadastro Único (CadÚnico). Mãe encaminhada para o Sine municipal (balcão de empregos) para qualificação e inserção produtiva.",
    status: "Concluido",
    conselheiroResponsavel: "Conselheiro Roberto Mendes Santos",
    dataUltimaAtualizacao: "2026-05-20T11:30",
    historico: [
      {
        id: "log-3-1",
        data: "2026-04-20T11:00",
        descricao: "Atendimento à mãe na sede do conselho. Mãe esclareceu que perdeu o auxílio e estava desesperada com o aluguel atrasado. Foi orientada e de imediato foi realizada a interlocução telefônica com o CRAS Centro, que forneceu cesta básica de emergência e agendou atualização urgente do Bolsa Família.",
        conselheiro: "Conselheiro Roberto Mendes Santos"
      },
      {
        id: "log-3-2",
        data: "2026-05-05T14:30",
        descricao: "Visita de retorno ao domicílio. A mãe iniciou curso profissionalizante de panificação e recebeu o primeiro benefício do programa de assistência. Lucas voltou a frequentar a escola integral e foi inserido no programa esportivo do contra-turno escolar (Guarda Municipal).",
        conselheiro: "Conselheiro Roberto Mendes Santos"
      },
      {
        id: "log-3-3",
        data: "2026-05-20T11:00",
        descricao: "Relatório de monitoramento social do CRAS e boletim de frequência escolar sem faltas recebidos com sucesso. Caso do menor Lucas resolvido através da rede socioassistencial protetiva. Arquivamento e encerramento do caso aprovados pelo colegiado.",
        conselheiro: "Conselheiro Roberto Mendes Santos"
      }
    ]
  }
];
