import React from 'react';
import { pdf } from '@react-pdf/renderer';
import fs from 'fs';
import { IntegratedPDFDocument } from '../src/utils/pdfIntegratedDocument';
import { HDPDFDocument } from '../src/utils/pdfHDDocument';
import { BigFivePDFDocument } from '../src/utils/pdfBigFiveDocument';

const longAnalysis = `A sua Arquitetura Pessoal revela um perfil profundamente individual e estratégico. Com o Tipo Energético Manifestor, você carrega a capacidade de iniciar movimentos e impactar o ambiente ao seu redor de forma direta e poderosa. A sua Estratégia de informar antes de agir é fundamental para reduzir resistências externas e criar alinhamento com as pessoas que serão tocadas pelas suas iniciativas. A Autoridade Emocional indica que as suas decisões devem esperar a clareza da onda emocional, evitando escolhas impulsivas feitas no pico ou no vale do humor.

O seu Perfil 4/6 traz uma combinação rica entre a fase de networking e fundamentação dos primeiros trinta anos de vida e a fase de autoridade e sabedoria que se desenvolve após essa maturidade. Você tem a capacidade de construir redes significativas e, com o tempo, tornar-se uma referência de orientação para outras pessoas. A Definição Individual completa sugere que o seu processo de tomada de decisão é interno e consistente, embora a interação com outras pessoas possa ampliar ou modificar a forma como a sua energia se expressa.

A Cruz de Encarnação Juxtaposition Right Angle Cross of Planning 1 indica um tema central de organização, estrutura e planejamento para o bem coletivo. Você está aqui para contribuir com a construção de sistemas e processos que sustentam a comunidade, trazendo uma visão estratégica e orientada para resultados. Essa cruz também aponta para a importância de equilibrar a lógica com a sensibilidade humana, garantindo que os planos sejam viáveis e acolhedores.

Olhando para os seus Centros, a definição do Centro G (Identidade) e do Sacral traz uma identidade sólida e uma energia de trabalho e vitalidade consistentes. No entanto, os Centros abertos — Cabeça, Ajna, Garganta, Coração, Baço, Plexo Solar e Raiz — representam áreas de grande potencial de aprendizado e também de condicionamento. É importante reconhecer que a mente aberta pode captar ideias e questões dos outros, o que exige discernimento para não se perder em preocupações ou conceitos que não são seus.

A presença de canais ativos como o Canal 1-8 (Inspiração e Expressão Criativa Individual) e o Canal 5-15 (Ritmo e Fluxo da Vida) reforça a sua natureza criativa e a necessidade de seguir os seus próprios ritmos. Esses canais contribuem para a sua capacidade de inspirar mudanças e de encontrar o timing correto para cada ação. A combinação com o Canal 10-34 (O Ser e o Poder) e o Canal 57-10 (Perfeccionismo do Ser) destaca a importância de viver de acordo com a sua verdade interior e de confiar na intuição do corpo.

As Variáveis Avançadas revelam nuances importantes do seu design. A Motivação Need aponta para uma busca por significado e propósito nas suas ações. O Ambiente Caves sugere que você prospera em espaços mais fechados, protegidos e íntimos. A Digestão Alternating indica que o seu corpo responde melhor a padrões alternados de alimentação, e o Design Sense Outer Vision destaca a importância de observar o ambiente externo para processar a informação. A Perspectiva Focus indica uma capacidade de concentração profunda em temas específicos.

Finalmente, a análise integrada com o Mapa de Personalidade mostra uma pessoa com alta Conscienciosidade e Abertura à Experiência, o que complementa a estrutura estratégica do Desenho Humano com criatividade e disciplina. A Amabilidade elevada sugere uma preocupação genuína com o bem-estar coletivo, enquanto a Extroversão moderada indica energia social, mas com necessidade de momentos de recolhimento. O Neuroticismo na faixa intermediária aponta para uma sensibilidade emocional que, quando bem compreendida, se torna uma ferramenta de autoconhecimento e empatia.`;

const integratedData = {
  language: 'pt' as const,
  userName: 'Giulia Felin',
  testDate: new Date(),
  traitScores: {
    Neuroticismo: 175,
    Extroversão: 210,
    'Abertura à Experiência': 230,
    Amabilidade: 220,
    Conscienciosidade: 240,
  },
  traitClassifications: {
    Neuroticismo: 'Médio',
    Extroversão: 'Alto',
    'Abertura à Experiência': 'Alto',
    Amabilidade: 'Alto',
    Conscienciosidade: 'Alto',
  },
  energyType: 'Manifestor',
  strategy: 'Informar antes de agir',
  authority: 'Autoridade Emocional',
  profile: '4/6',
  definition: 'Individual Completa',
  incarnationCross: 'Juxtaposition Right Angle Cross of Planning 1',
  definedCenters: ['G (Identidade)', 'Sacral'],
  openCenters: ['Cabeça', 'Ajna', 'Garganta', 'Coração', 'Baço', 'Plexo Solar', 'Raiz'],
  activeChannels: [
    { id: '1-8', name: 'Canal 1-8: Inspiração' },
    { id: '5-15', name: 'Canal 5-15: Ritmo' },
    { id: '10-34', name: 'Canal 10-34: Ser e Poder' },
    { id: '57-10', name: 'Canal 57-10: Perfeccionismo do Ser' },
  ],
  ai_analysis: longAnalysis,
};

const hdData = {
  language: 'pt' as const,
  user_name: 'Giulia Felin',
  birth_date: '1990-01-01',
  birth_time: '12:00',
  birth_location: 'São Paulo, Brasil',
  energy_type: 'Manifestor',
  strategy: 'Informar antes de agir',
  authority: 'Autoridade Emocional',
  profile: '4/6',
  definition: 'Individual Completa',
  incarnation_cross: 'Juxtaposition Right Angle Cross of Planning 1',
  centers: {
    head: false,
    ajna: false,
    throat: false,
    g: true,
    heart: false,
    sacral: true,
    spleen: false,
    solar: false,
    root: false,
  },
  channels: [
    { id: '1-8', name: 'Canal 1-8: Inspiração', isComplete: true },
    { id: '5-15', name: 'Canal 5-15: Ritmo', isComplete: true },
    { id: '10-34', name: 'Canal 10-34: Ser e Poder', isComplete: true },
    { id: '57-10', name: 'Canal 57-10: Perfeccionismo do Ser', isComplete: true },
  ],
  personality_activations: [],
  design_activations: [],
  variables: {
    digestion: { primary: 'Alternating', level: 'PHS', description: 'Padrões alternados de alimentação' },
    environment: { primary: 'Caves', level: 'Environment', description: 'Espaços íntimos e protegidos' },
    motivation: { primary: 'Need', level: 'Motivation', description: 'Busca por propósito' },
    perspective: { primary: 'Focus', level: 'Perspective', description: 'Concentração profunda' },
    designSense: { primary: 'Outer Vision', level: 'Design Sense', description: 'Observação do ambiente externo' },
  },
  ai_analysis_full: longAnalysis,
};

const bigFiveData = {
  language: 'pt' as const,
  userName: 'Giulia Felin',
  testDate: new Date(),
  aiAnalysis: longAnalysis,
  traitScores: {
    Neuroticismo: 175,
    Extroversão: 210,
    'Abertura à Experiência': 230,
    Amabilidade: 220,
    Conscienciosidade: 240,
  },
  facetScores: {
    Neuroticismo: { Ansiedade: 35, Hostilidade: 30, Depressão: 32, Autoconsciência: 38, Impulsividade: 40, Vulnerabilidade: 36 },
    Extroversão: { Amizade: 42, Gregarismo: 38, Assertividade: 44, Atividade: 41, BuscaPorSensações: 39, EmoçõesPositivas: 45 },
    'Abertura à Experiência': { Fantasia: 46, Estética: 48, Sentimentos: 47, Ações: 43, Ideias: 49, Valores: 45 },
    Amabilidade: { Confiança: 44, Moralidade: 46, Altruísmo: 45, Cooperação: 42, Modéstia: 40, Simpatia: 43 },
    Conscienciosidade: { Competência: 48, Ordem: 46, Dever: 47, Realização: 49, Autodisciplina: 45, Deliberação: 44 },
  },
  classifications: {
    Neuroticismo: 'Médio',
    Extroversão: 'Alto',
    'Abertura à Experiência': 'Alto',
    Amabilidade: 'Alto',
    Conscienciosidade: 'Alto',
  },
};

async function main() {
  const docs = [
    { name: '/tmp/test-integrated.pdf', doc: <IntegratedPDFDocument data={integratedData} /> },
    { name: '/tmp/test-hd.pdf', doc: <HDPDFDocument data={hdData} /> },
    { name: '/tmp/test-bigfive.pdf', doc: <BigFivePDFDocument data={bigFiveData} /> },
  ];

  for (const { name, doc } of docs) {
    const blob = await pdf(doc).toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    fs.writeFileSync(name, Buffer.from(arrayBuffer));
    console.log(`Generated ${name} (${fs.statSync(name).size} bytes)`);
  }
}

main().catch(console.error);
