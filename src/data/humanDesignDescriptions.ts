// Descrições detalhadas para Human Design em Português

export interface TypeDescription {
  name: string;
  summary: string;
  strategy: string;
  strategyDescription: string;
  notSelfTheme: string;
  strengths: string[];
  challenges: string[];
  tips: string[];
}

export interface AuthorityDescription {
  name: string;
  description: string;
  howToUse: string;
  tips: string[];
}

export interface ProfileDescription {
  profile: string;
  name: string;
  description: string;
  conscious: string;
  unconscious: string;
}

// Descrições dos Tipos Energéticos
export const TYPE_DESCRIPTIONS: Record<string, TypeDescription> = {
  'Gerador': {
    name: 'Gerador',
    summary: 'Você é a força vital do planeta! Geradores são os construtores, os mestres do trabalho sustentável. Com uma energia sacral poderosa, você tem a capacidade de trabalhar com prazer e satisfação quando está fazendo o que ama.',
    strategy: 'Esperar para Responder',
    strategyDescription: 'Sua estratégia é aguardar que a vida traga coisas para você responder. Não inicie - responda! Quando algo surge no seu campo, seu sacral responderá com um "uh-huh" (sim) ou "un-un" (não). Confie nessa resposta visceral.',
    notSelfTheme: 'Frustração',
    strengths: [
      'Energia sustentável para trabalho',
      'Capacidade de dominar habilidades',
      'Resposta sacral confiável',
      'Magnetismo natural - atrai oportunidades',
      'Satisfação profunda quando alinhado'
    ],
    challenges: [
      'Tendência a iniciar ao invés de responder',
      'Dificuldade em dizer não',
      'Pode se sentir preso em compromissos errados',
      'Frustração quando forçado a fazer o que não gosta'
    ],
    tips: [
      'Pratique ouvir seu "uh-huh" e "un-un"',
      'Não se comprometa imediatamente - durma sobre decisões importantes',
      'Faça o que você ama e o dinheiro seguirá',
      'Sua aura está sempre buscando o que é certo para você'
    ]
  },
  'Gerador Manifestante': {
    name: 'Gerador Manifestante',
    summary: 'Você é um híbrido poderoso! Combina a energia sustentável do Gerador com a capacidade manifestadora. É mais rápido que o Gerador puro e pode iniciar após responder.',
    strategy: 'Esperar para Responder, depois Informar',
    strategyDescription: 'Como o Gerador, você espera para responder. Mas diferente do Gerador puro, após a resposta sacral, você pode agir rapidamente. Informe as pessoas ao seu redor sobre suas ações para evitar resistência.',
    notSelfTheme: 'Frustração e Raiva',
    strengths: [
      'Velocidade e eficiência',
      'Multi-apaixonado - muitos interesses',
      'Pode pular etapas quando responde corretamente',
      'Energia poderosa e magnética',
      'Capacidade de manifestar rapidamente'
    ],
    challenges: [
      'Pode ser impaciente',
      'Tendência a começar muitas coisas',
      'Pode esquecer de informar os outros',
      'Dificuldade em completar projetos longos'
    ],
    tips: [
      'Espere a resposta sacral antes de agir',
      'Informe as pessoas sobre seus planos',
      'Está tudo bem mudar de interesse - siga sua resposta',
      'Use sua energia para o que te satisfaz'
    ]
  },
  'Projetor': {
    name: 'Projetor',
    summary: 'Você é um guia natural! Projetores têm a capacidade única de ver e entender os outros profundamente. Seu papel é gerenciar, direcionar e guiar a energia dos outros.',
    strategy: 'Esperar pelo Convite',
    strategyDescription: 'Aguarde ser reconhecido e convidado para as grandes áreas da vida: carreira, amor, onde morar. Quando você é verdadeiramente convidado, sua sabedoria é recebida e valorizada.',
    notSelfTheme: 'Amargura',
    strengths: [
      'Sabedoria natural sobre sistemas e pessoas',
      'Capacidade de ver o potencial nos outros',
      'Eficiência - faz mais com menos',
      'Guia e mentor natural',
      'Penetra profundamente nos assuntos'
    ],
    challenges: [
      'Pode dar conselhos não solicitados',
      'Risco de burnout se trabalhar como Gerador',
      'Pode se sentir invisível se não reconhecido',
      'Amargura quando não é valorizado'
    ],
    tips: [
      'Espere convites genuínos para o que importa',
      'Estude o que você ama - torne-se expert',
      'Descanse frequentemente - você não tem energia sacral',
      'Seu valor está na sabedoria, não na quantidade de trabalho'
    ]
  },
  'Manifestor': {
    name: 'Manifestor',
    summary: 'Você é um iniciador nato! Manifestores são os únicos que podem verdadeiramente iniciar ação. Sua aura é fechada e repelente, protegendo sua independência.',
    strategy: 'Informar antes de Agir',
    strategyDescription: 'Você pode iniciar, mas deve informar as pessoas afetadas por suas ações ANTES de agir. Isso não é pedir permissão - é uma cortesia que remove resistência do seu caminho.',
    notSelfTheme: 'Raiva',
    strengths: [
      'Capacidade de iniciar e impactar',
      'Independência natural',
      'Poder de fazer as coisas acontecerem',
      'Não precisa esperar por ninguém',
      'Aura que cria espaço'
    ],
    challenges: [
      'Pode parecer controlador ou assustador',
      'Dificuldade em informar - parece pedir permissão',
      'Pode encontrar muita resistência',
      'Energia não é sustentável - precisa de descanso'
    ],
    tips: [
      'Informe, não peça permissão',
      'Encontre paz na solidão',
      'Sua raiva indica onde você não está sendo livre',
      'Aceite que nem todos entenderão você'
    ]
  },
  'Reflector': {
    name: 'Reflector',
    summary: 'Você é um espelho da comunidade! Reflectores são os mais raros (~1% da população) e refletem a saúde do ambiente ao seu redor. Sem centros definidos, você experimenta a vida de forma única.',
    strategy: 'Esperar um Ciclo Lunar (28 dias)',
    strategyDescription: 'Para decisões importantes, aguarde um ciclo lunar completo. Durante esses 28 dias, você experimentará diferentes perspectivas conforme a Lua transita por todos os gates.',
    notSelfTheme: 'Decepção',
    strengths: [
      'Sabedoria sobre a saúde da comunidade',
      'Capacidade de experimentar todos os tipos',
      'Perspectiva única e valiosa',
      'Potencial para grande sabedoria',
      'Reflete o que está funcionando (ou não)'
    ],
    challenges: [
      'Pode se perder nas energias dos outros',
      'Dificuldade em saber quem realmente é',
      'Precisa de muito tempo para decisões',
      'Sensível ao ambiente'
    ],
    tips: [
      'Escolha ambientes saudáveis - você os reflete',
      'Use o ciclo lunar para grandes decisões',
      'Você não está aqui para ser como os outros',
      'Sua diferença é seu dom'
    ]
  }
};

// Descrições das Autoridades
export const AUTHORITY_DESCRIPTIONS: Record<string, AuthorityDescription> = {
  'Emocional': {
    name: 'Autoridade Emocional (Solar Plexus)',
    description: 'Você tem uma onda emocional que sobe e desce. Nunca tome decisões no pico ou no vale da onda.',
    howToUse: 'Espere pela clareza emocional. Durma sobre decisões importantes e observe como você se sente sobre elas em diferentes momentos do dia e em diferentes dias.',
    tips: [
      'Não existe verdade no momento - espere',
      'Observe o padrão da sua onda',
      'A clareza vem quando você se sente neutro sobre a decisão',
      'Diga "preciso de tempo" quando pressionado'
    ]
  },
  'Sacral': {
    name: 'Autoridade Sacral',
    description: 'Seu centro sacral responde com sons guturais - "uh-huh" (sim) ou "un-un" (não). Esta é a resposta mais imediata e confiável.',
    howToUse: 'Faça perguntas de sim ou não para si mesmo ou peça para outros fazerem. Observe a resposta do seu corpo - ela acontece antes do pensamento.',
    tips: [
      'Pratique responder a perguntas simples',
      'A resposta vem do intestino, não da mente',
      'Se você não tem resposta, não é o momento',
      'Sons e grunhidos são válidos!'
    ]
  },
  'Esplênica': {
    name: 'Autoridade Esplênica',
    description: 'Você tem intuição instantânea que fala uma vez, muito suavemente. É o instinto de sobrevivência mais antigo.',
    howToUse: 'Preste atenção nos sussurros sutis do corpo. A intuição esplênica é instantânea e não se repete - se você perdeu, terá que esperar por nova situação.',
    tips: [
      'A mensagem é sutil e não se repete',
      'Confie nos calafrios, arrepios, sensações',
      'Sua intuição é sobre segurança e bem-estar',
      'Não racionalize - aja no momento'
    ]
  },
  'Ego/Coração': {
    name: 'Autoridade do Ego/Coração',
    description: 'Sua força de vontade e compromissos pessoais guiam suas decisões. O que você quer fazer?',
    howToUse: 'Pergunte-se: "O que EU quero?" e "Vale a pena para MIM?". Seus compromissos devem servir você primeiro.',
    tips: [
      'Seja egoísta no bom sentido - honre seus desejos',
      'Não faça promessas que não pode cumprir',
      'Sua palavra é sua lei',
      'O que é bom para você será bom para outros'
    ]
  },
  'Auto-Projetada': {
    name: 'Autoridade Auto-Projetada',
    description: 'Você precisa falar sobre suas decisões para ouvir sua própria verdade. A voz revela a direção.',
    howToUse: 'Fale sobre suas opções com pessoas de confiança. Não peça conselhos - apenas fale e ouça o que sai de você.',
    tips: [
      'Encontre "caixas de ressonância" - pessoas que só ouvem',
      'Grave-se falando sobre decisões',
      'A verdade está no som da sua voz',
      'Não deixe outros influenciarem - apenas ouça a si mesmo'
    ]
  },
  'Lunar': {
    name: 'Autoridade Lunar',
    description: 'Como Reflector, você precisa de um ciclo lunar completo (28 dias) para decisões importantes.',
    howToUse: 'Marque no calendário. Durante 28 dias, converse sobre a decisão, observe como se sente em diferentes dias, e espere a clareza emergir.',
    tips: [
      'A Lua transita todos os gates em 28 dias',
      'Você experimentará diferentes perspectivas',
      'Não tenha pressa - sua sabedoria vale a espera',
      'Grandes decisões merecem um ciclo completo'
    ]
  },
  'Sem Autoridade Interna': {
    name: 'Autoridade Mental/Ambiental',
    description: 'Você precisa de ambientes e pessoas corretas para processar decisões. Não decide sozinho.',
    howToUse: 'Converse com diferentes pessoas em diferentes lugares. Observe onde você se sente bem para pensar e quem ajuda você a clarear.',
    tips: [
      'Seu ambiente afeta sua clareza',
      'Encontre conselheiros de confiança',
      'A mente não é sua autoridade - é para os outros',
      'Observe o que emerge nas conversas'
    ]
  }
};

// Descrições dos Perfis
export const PROFILE_DESCRIPTIONS: Record<string, ProfileDescription> = {
  '1/3': {
    profile: '1/3',
    name: 'Investigador/Mártir',
    description: 'Você precisa de uma base sólida de conhecimento (1) e aprende através de experiências práticas, incluindo os erros (3). É um pesquisador nato que testa tudo na prática.',
    conscious: 'Linha 1 - O Investigador: Busca segurança através do conhecimento profundo. Precisa entender as fundações antes de agir.',
    unconscious: 'Linha 3 - O Mártir: Aprende através de tentativa e erro. A vida é um experimento contínuo.'
  },
  '1/4': {
    profile: '1/4',
    name: 'Investigador/Oportunista',
    description: 'Você combina conhecimento profundo (1) com influência através de redes pessoais (4). Compartilha sua expertise com aqueles que conhece.',
    conscious: 'Linha 1 - O Investigador: Busca fundações sólidas de conhecimento.',
    unconscious: 'Linha 4 - O Oportunista: Influencia através de relacionamentos próximos e redes estabelecidas.'
  },
  '2/4': {
    profile: '2/4',
    name: 'Eremita/Oportunista',
    description: 'Você tem talentos naturais que outros reconhecem (2), e influencia através de conexões pessoais (4). Precisa de tempo sozinho para desenvolver seus dons.',
    conscious: 'Linha 2 - O Eremita: Possui talentos naturais que precisam ser chamados para fora.',
    unconscious: 'Linha 4 - O Oportunista: Oportunidades vêm através da rede de relacionamentos.'
  },
  '2/5': {
    profile: '2/5',
    name: 'Eremita/Herético',
    description: 'Você tem dons naturais (2) e é projetado como salvador ou solução para problemas dos outros (5). Precisa de isolamento para recarregar.',
    conscious: 'Linha 2 - O Eremita: Talentos inatos que emergem quando chamados.',
    unconscious: 'Linha 5 - O Herético: Atrai projeções de ser o "salvador" - deve entregar soluções práticas.'
  },
  '3/5': {
    profile: '3/5',
    name: 'Mártir/Herético',
    description: 'Você aprende através da experiência (3) e tem o potencial de oferecer soluções práticas que funcionam (5). Sua sabedoria vem do que você viveu.',
    conscious: 'Linha 3 - O Mártir: Descobre o que funciona (e o que não) através da experiência direta.',
    unconscious: 'Linha 5 - O Herético: Outros projetam nele a capacidade de resolver problemas.'
  },
  '3/6': {
    profile: '3/6',
    name: 'Mártir/Modelo de Papel',
    description: 'Você experimenta intensamente na primeira parte da vida (3), depois sobe ao "telhado" para observar, e eventualmente se torna um modelo (6).',
    conscious: 'Linha 3 - O Mártir: Primeira fase de vida cheia de experimentação.',
    unconscious: 'Linha 6 - O Modelo: Após os 50, emerge como exemplo autêntico de vida vivida.'
  },
  '4/6': {
    profile: '4/6',
    name: 'Oportunista/Modelo de Papel',
    description: 'Você influencia através de redes pessoais (4) e eventualmente se torna um modelo para os outros (6). Relacionamentos são fundamentais.',
    conscious: 'Linha 4 - O Oportunista: Oportunidades fluem através de conexões estabelecidas.',
    unconscious: 'Linha 6 - O Modelo: Após amadurecimento, se torna exemplo de vida bem vivida.'
  },
  '4/1': {
    profile: '4/1',
    name: 'Oportunista/Investigador',
    description: 'Você compartilha conhecimento profundo (1) através de sua rede de relacionamentos (4). É um influenciador com base sólida.',
    conscious: 'Linha 4 - O Oportunista: Vida acontece através de quem você conhece.',
    unconscious: 'Linha 1 - O Investigador: Base inconsciente de pesquisa e fundação.'
  },
  '5/1': {
    profile: '5/1',
    name: 'Herético/Investigador',
    description: 'Você é visto como alguém que pode resolver problemas (5), apoiado por profundo conhecimento (1). Projeta-se como universalizador.',
    conscious: 'Linha 5 - O Herético: Atrai projeções de ser o salvador ou solução.',
    unconscious: 'Linha 1 - O Investigador: Fundação sólida que sustenta sua capacidade prática.'
  },
  '5/2': {
    profile: '5/2',
    name: 'Herético/Eremita',
    description: 'Você tem a projeção de solucionador (5) com talentos naturais que prefere exercer em privacidade (2).',
    conscious: 'Linha 5 - O Herético: Chamado para oferecer soluções práticas.',
    unconscious: 'Linha 2 - O Eremita: Talentos naturais que precisam de espaço para florescer.'
  },
  '6/2': {
    profile: '6/2',
    name: 'Modelo de Papel/Eremita',
    description: 'Você está destinado a ser um modelo (6), com talentos naturais que emergem quando chamados (2). Vive em três fases distintas.',
    conscious: 'Linha 6 - O Modelo: Três fases de vida - experimentação, observação, e modelo.',
    unconscious: 'Linha 2 - O Eremita: Dons naturais que outros reconhecem em você.'
  },
  '6/3': {
    profile: '6/3',
    name: 'Modelo de Papel/Mártir',
    description: 'Você experimenta intensamente em todas as fases da vida (3+6). Sua sabedoria como modelo vem de experiências vividas.',
    conscious: 'Linha 6 - O Modelo: Destinado a ser exemplo após maturação.',
    unconscious: 'Linha 3 - O Mártir: Experimentação contínua que alimenta a sabedoria.'
  }
};

// Descrições das Definições
export const DEFINITION_DESCRIPTIONS: Record<string, string> = {
  'Single': 'Definição Única: Todos os seus centros definidos estão conectados. Você é auto-suficiente energeticamente e não precisa de outros para se sentir completo.',
  'Split': 'Definição Dividida: Você tem dois grupos de centros definidos que não estão conectados. Pode sentir atração por pessoas que "conectam" suas partes.',
  'Triple Split': 'Definição Tripla: Três áreas de definição separadas. Você pode precisar de várias pessoas ou ambientes para se sentir integrado.',
  'Quadruple Split': 'Definição Quádrupla: Quatro áreas separadas. Muito raro. Você precisa de tempo e diversas interações para processar.',
  'No Definition': 'Sem Definição (Reflector): Nenhum centro definido. Você é completamente aberto e reflete o mundo ao seu redor.'
};
