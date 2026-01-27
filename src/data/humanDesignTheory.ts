// Human Design Theory - Fixed theoretical content (Layer 1)
// This content is inserted directly in the PDF before the AI personalized analysis

export interface TheorySection {
  title: string;
  content: string;
}

export interface CenterTheory {
  id: string;
  name: string;
  function: string;
  importanceForWomen: string;
}

// Introdução ao Desenho Humano
export const INTRO_SECTION: TheorySection = {
  title: "O que é o Desenho Humano?",
  content: `O Human Design é um sistema de autoconhecimento que combina elementos de diversas tradições antigas (astrologia, do I Ching, da Cabala, do sistema de chakras) e modernas (física quântica e genética) para ajudar as pessoas a entenderem melhor quem são e como funcionam no mundo. É como um mapa pessoal que nos mostra nossas características únicas e como podemos viver de forma mais alinhada com nossa verdadeira natureza.

Os Centros no Desenho Humano são semelhantes aos chakras e representam diferentes aspectos da experiência humana. Eles podem ser definidos (coloridos) ou indefinidos (brancos). Dentro do Desenho Humano, os centros representam diferentes áreas de energia e influenciam várias facetas de nossa vida e personalidade.`
};

// Os 9 Centros Energéticos
export const CENTERS_THEORY: CenterTheory[] = [
  {
    id: 'head',
    name: 'Centro da Cabeça',
    function: 'É um centro de inspiração e pressão mental.',
    importanceForWomen: 'Este centro pode influenciar a maneira como as mulheres processam ideias e se conectam com a inspiração. É um ponto de partida para questionamentos e dúvidas, frequentemente impactando a forma como percebem a realidade e buscam significado em suas experiências diárias.'
  },
  {
    id: 'ajna',
    name: 'Centro de Ajna',
    function: 'Processamento mental e consciência.',
    importanceForWomen: 'As mulheres com um Ajna definido podem apresentar uma forma consistente de pensar e de formar opiniões, enquanto aquelas com um Ajna indefinido podem ser mais abertas a novas ideias e influências externas. A consciência aqui se manifesta na maneira como elas tomam decisões e interpretam informações.'
  },
  {
    id: 'throat',
    name: 'Centro da Garganta',
    function: 'Manifestação e comunicação.',
    importanceForWomen: 'Este centro influencia como as mulheres expressam seus pensamentos e sentimentos. A presença de um centro da garganta definido pode indicar uma habilidade mais consistente de se comunicar, enquanto um centro indefinido pode levar a uma adaptação às expectativas comunicativas dos outros.'
  },
  {
    id: 'g',
    name: 'Centro G',
    function: 'Identidade, amor e direção.',
    importanceForWomen: 'Este centro está profundamente ligado à sensação de identidade e propósito. Para muitas mulheres, reflete como elas se veem em relação ao amor e à direção que desejam seguir na vida. Um centro G definido pode proporcionar uma forte sensação de identidade pessoal, enquanto um indefinido pode resultar em uma busca por direção através das experiências dos outros.'
  },
  {
    id: 'heart',
    name: 'Centro do Coração (Ego)',
    function: 'Vontade, ego e materialidade.',
    importanceForWomen: 'Este centro impacta a relação das mulheres com a autoestima e o valor pessoal. Quando definido, pode indicar uma forte vontade e compromisso com objetivos, enquanto um centro indefinido pode fazer com que as mulheres se sintam desafiadas a provar seu valor.'
  },
  {
    id: 'sacral',
    name: 'Centro Sacral',
    function: 'Fonte de energia vital e força de trabalho.',
    importanceForWomen: 'Este é o centro da energia vital, influenciando a capacidade de trabalho e a vitalidade geral. As mulheres com um Sacral definido podem ter uma energia sustentada para o trabalho e projetos, enquanto aquelas com um Sacral indefinido podem precisar de mais tempo para descanso e recuperação.'
  },
  {
    id: 'spleen',
    name: 'Centro do Baço',
    function: 'Intuição, bem-estar e imunidade.',
    importanceForWomen: 'Este centro está ligado à intuição e ao senso de bem-estar. Um centro do baço definido pode proporcionar uma forte conexão com a intuição e a saúde, enquanto um indefinido pode resultar em uma sensibilidade maior às condições externas de saúde e bem-estar.'
  },
  {
    id: 'solar',
    name: 'Centro do Plexo Solar',
    function: 'Emoções e consciência emocional.',
    importanceForWomen: 'Este centro é crucial na gestão das emoções. As mulheres com um Plexo Solar definido podem experimentar uma gama consistente de emoções, enquanto aquelas com um centro indefinido podem ser mais suscetíveis às emoções dos outros e às flutuações emocionais.'
  },
  {
    id: 'root',
    name: 'Centro Raiz',
    function: 'Pressão e adrenalina.',
    importanceForWomen: 'A maneira como as mulheres lidam com o estresse e a pressão pode ser influenciada por este centro. Um centro da raiz definido pode proporcionar uma abordagem mais constante ao gerenciamento de pressão, enquanto um indefinido pode resultar em variações na resposta ao estresse.'
  }
];

// Estrutura do Human Design - Elementos
export const ELEMENTS_THEORY: TheorySection[] = [
  {
    title: 'Tipo (Type)',
    content: 'Os Tipos são a primeira e mais fundamental classificação no Desenho Humano. Eles determinam a maneira como você interage com o mundo e como sua energia flui. Existem cinco tipos principais: Manifestador (iniciadores naturais, estão aqui para começar coisas e agir de forma independente), Gerador (são construtores, com energia sustentada para trabalhar em projetos que amam), Manifestador-Gerador (uma combinação dos dois, com a habilidade de iniciar e trabalhar de forma sustentada), Projetor (guias naturais, estão aqui para orientar os outros e precisam ser reconhecidos e convidados) e Refletor (espelhos do ambiente, são extremamente sensíveis e se beneficiam de ciclos lunares completos para tomar decisões).'
  },
  {
    title: 'Estratégia (Strategy)',
    content: 'A estratégia está relacionada ao tipo e é a maneira mais alinhada de interagir com o mundo. Cada tipo tem sua própria estratégia que, quando seguida, leva à sua assinatura (satisfação, paz, sucesso ou surpresa).'
  },
  {
    title: 'Autoridade Interna (Inner Authority)',
    content: 'É o guia interno para tomar decisões de forma mais alinhada com a sua verdadeira natureza. Cada pessoa tem uma autoridade específica que serve como bússola para decisões corretas.'
  },
  {
    title: 'Definição (Definition)',
    content: 'Refere-se à forma como seus centros no gráfico estão conectados. Isso influencia como uma pessoa processa informações e energias, bem como interage com os outros.'
  },
  {
    title: 'Perfil (Profile)',
    content: 'Existem 12 perfis diferentes. O perfil é a combinação de dois números que refletem seu papel na vida e como você se vê e é visto pelos outros.'
  },
  {
    title: 'Cruz de Encarnação (Incarnation Cross)',
    content: 'No sistema de Human Design, existem 192 Cruzes de Encarnação diferentes. Ela reflete o seu propósito de vida, uma combinação de quatro portões que destacam temas principais que você viverá.'
  },
  {
    title: 'Assinatura (Signature)',
    content: 'Há uma Assinatura específica para cada um dos cinco Tipos principais. A Assinatura é o estado de ser que uma pessoa experimenta quando está vivendo de acordo com seu design, em alinhamento com sua verdadeira natureza, e fornece uma sensação de realização e bem-estar.'
  },
  {
    title: 'Tema do Não-Eu (Not-Self Theme)',
    content: 'Cada um dos cinco tipos principais tem um Tema do Não-Eu, que é a emoção ou estado negativo que uma pessoa experimenta quando não está vivendo de acordo com seu design. Este tema indica um desalinhamento com a sua verdadeira natureza e serve como sinal de alerta.'
  }
];

// Variáveis Avançadas
export const ADVANCED_VARIABLES_THEORY: TheorySection[] = [
  {
    title: 'Digestão (Digestion)',
    content: 'Refere-se à melhor maneira de processar alimentos, afetos e informações, otimizando o bem-estar físico e mental.'
  },
  {
    title: 'Sentido do Design (Design Sense)',
    content: 'Refere-se aos sentidos predominantes através dos quais uma pessoa percebe e interage com o mundo.'
  },
  {
    title: 'Motivação (Motivation)',
    content: 'Refere-se aos impulsos internos que guiam uma pessoa na forma como ela percebe e interage com o mundo. Ela fornece uma lente através da qual uma pessoa pode entender melhor suas ações e decisões.'
  },
  {
    title: 'Ambiente (Environment)',
    content: 'Refere-se ao tipo ideal de ambiente onde uma pessoa pode prosperar e funcionar de maneira mais alinhada com seu design. Compreender o seu tipo de Ambiente pode ajudá-la a escolher ambientes que apoiem seu bem-estar físico e mental.'
  }
];

// Gates and Channels Theory
export const GATES_CHANNELS_THEORY: TheorySection = {
  title: 'Portões e Canais',
  content: `Os Portões (Gates) representam uma característica ou potencial energético específico. Cada portão representa uma característica que pode estar ativada no seu gráfico de Human Design. Os 64 portões estão distribuídos entre os nove centros do corpo no gráfico. Quando dois portões ativados se conectam, formam um Canal, que liga dois centros.

Os Canais (Channels) são 36 no total. Esses canais são formados pela conexão de dois Portões entre dois dos nove centros. Cada canal representa um fluxo de energia e informação entre os centros, influenciando a forma como uma pessoa processa experiências e interage com o mundo.

Quando um canal está definido no seu gráfico, ele indica uma forma consistente de operar essa energia. Os canais desempenham um papel significativo na determinação do seu Tipo, pois influenciam quais centros são definidos.`
};

// Closing theory section
export const CLOSING_THEORY: TheorySection = {
  title: 'Como usar seu Desenho Humano',
  content: `Todos esses elementos do Human Design ajudam a compor um mapa detalhado da sua individualidade, oferecendo insights sobre como viver de forma mais autêntica e satisfatória.

O Human Design sugere que, ao entender seu tipo, estratégia, autoridade e outros aspectos do seu gráfico pessoal, você pode fazer escolhas mais autênticas e viver de forma mais fluida. É um sistema que nos convida a experimentar suas orientações na vida diária, observando como nos sentimos mais alinhados e realizados.

Compreender o Desenho Humano pode ajudar a viver de acordo com sua verdadeira natureza, respeitando sua energia e potencial únicos. É uma ferramenta poderosa para o autoconhecimento e o desenvolvimento pessoal.`
};
