import { Question, TraitInfo } from "@/types/test";

// Mapeamento de traços português → inglês
const traitMap: Record<string, string> = {
  "Neuroticismo": "neuroticism",
  "Extroversão": "extraversion",
  "Abertura à Experiência": "openness",
  "Amabilidade": "agreeableness",
  "Conscienciosidade": "conscientiousness",
};

// Mapeamento de facetas para códigos por traço
const facetCodeMap: Record<string, Record<string, string>> = {
  neuroticism: {
    "Ansiedade": "N1",
    "Hostilidade": "N2",
    "Depressão": "N3",
    "Constrangimento": "N4",
    "Impulsividade": "N5",
    "Vulnerabilidade": "N6",
  },
  extraversion: {
    "Calor": "E1",
    "Sociabilidade": "E2",
    "Assertividade": "E3",
    "Atividade": "E4",
    "Busca de Emoções": "E5",
    "Emoções Positivas": "E6",
  },
  openness: {
    "Fantasia": "O1",
    "Estética": "O2",
    "Sentimentos": "O3",
    "Ações": "O4",
    "Ideias": "O5",
    "Valores": "O6",
  },
  agreeableness: {
    "Confiança": "A1",
    "Franqueza": "A2",
    "Altruísmo": "A3",
    "Complacência": "A4",
    "Modéstia": "A5",
    "Sensibilidade": "A6",
  },
  conscientiousness: {
    "Competência": "C1",
    "Ordem": "C2",
    "Senso de dever": "C3",
    "Esforço por Realização": "C4",
    "Autodisciplina": "C5",
    "Ponderação": "C6",
  },
};

// Nomes das facetas para exibição
export const facetNamesLuciana: Record<string, string> = {
  N1: "Ansiedade",
  N2: "Hostilidade",
  N3: "Depressão",
  N4: "Constrangimento",
  N5: "Impulsividade",
  N6: "Vulnerabilidade",
  E1: "Calor",
  E2: "Sociabilidade",
  E3: "Assertividade",
  E4: "Atividade",
  E5: "Busca de Emoções",
  E6: "Emoções Positivas",
  O1: "Fantasia",
  O2: "Estética",
  O3: "Sentimentos",
  O4: "Ações",
  O5: "Ideias",
  O6: "Valores",
  A1: "Confiança",
  A2: "Franqueza",
  A3: "Altruísmo",
  A4: "Complacência",
  A5: "Modéstia",
  A6: "Sensibilidade",
  C1: "Competência",
  C2: "Ordem",
  C3: "Senso de dever",
  C4: "Esforço por Realização",
  C5: "Autodisciplina",
  C6: "Ponderação",
};

// 300 questões do Big Five - Luciana Belenton
export const questionsLuciana: Question[] = [
  // === NEUROTICISMO ===
  // N1 - Ansiedade (10 questões)
  { id: "N1_1", text: "Quase nunca me sinto sobrecarregada ou preocupada com o futuro.", trait: "neuroticism", facet: "N1", keyed: "minus" },
  { id: "N1_2", text: "Fico calma diante de situações inesperadas.", trait: "neuroticism", facet: "N1", keyed: "minus" },
  { id: "N1_3", text: "Raramente me pego pensando em coisas ruins que podem acontecer.", trait: "neuroticism", facet: "N1", keyed: "minus" },
  { id: "N1_4", text: "Não costumo sentir medo ou tensão sem motivo aparente.", trait: "neuroticism", facet: "N1", keyed: "minus" },
  { id: "N1_5", text: "Não me preocupo facilmente com possíveis problemas futuros.", trait: "neuroticism", facet: "N1", keyed: "minus" },
  { id: "N1_6", text: "Costumo me preocupar muito com o que pode dar errado.", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_7", text: "Frequentemente me sinto tensa ou ansiosa sem motivo claro.", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_8", text: "Tenho dificuldade em relaxar mesmo quando está tudo bem.", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_9", text: "Sinto medo intenso em situações que outras pessoas consideram normais.", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_10", text: "A incerteza sobre o futuro me deixa muito inquieta.", trait: "neuroticism", facet: "N1", keyed: "plus" },

  // N2 - Hostilidade (10 questões)
  { id: "N2_1", text: "Não me irrito facilmente com pequenos inconvenientes.", trait: "neuroticism", facet: "N2", keyed: "minus" },
  { id: "N2_2", text: "Raramente sinto raiva de pessoas ou situações.", trait: "neuroticism", facet: "N2", keyed: "minus" },
  { id: "N2_3", text: "Mantenho a calma mesmo quando contrariada.", trait: "neuroticism", facet: "N2", keyed: "minus" },
  { id: "N2_4", text: "Costumo lidar bem com frustrações.", trait: "neuroticism", facet: "N2", keyed: "minus" },
  { id: "N2_5", text: "Demoro a perder a paciência.", trait: "neuroticism", facet: "N2", keyed: "minus" },
  { id: "N2_6", text: "Fico irritada com facilidade.", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_7", text: "Pequenas contrariedades me deixam impaciente.", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_8", text: "Tenho dificuldade em controlar minha raiva.", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_9", text: "Sinto frustração frequente no dia a dia.", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_10", text: "Quando contrariada, reajo de forma exagerada.", trait: "neuroticism", facet: "N2", keyed: "plus" },

  // N3 - Depressão (10 questões)
  { id: "N3_1", text: "Geralmente me sinto bem comigo mesma.", trait: "neuroticism", facet: "N3", keyed: "minus" },
  { id: "N3_2", text: "Raramente me sinto triste ou desanimada.", trait: "neuroticism", facet: "N3", keyed: "minus" },
  { id: "N3_3", text: "Tenho uma visão otimista sobre a vida.", trait: "neuroticism", facet: "N3", keyed: "minus" },
  { id: "N3_4", text: "Não costumo me sentir vazia ou sem propósito.", trait: "neuroticism", facet: "N3", keyed: "minus" },
  { id: "N3_5", text: "Supero momentos difíceis sem muito abatimento.", trait: "neuroticism", facet: "N3", keyed: "minus" },
  { id: "N3_6", text: "Às vezes me sinto triste sem motivo.", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_7", text: "Tenho pensamentos negativos sobre mim mesma com frequência.", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_8", text: "Sinto-me desesperançosa em relação ao futuro às vezes.", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_9", text: "Tenho dificuldade em sentir prazer nas coisas que antes me faziam bem.", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_10", text: "Frequentemente me sinto desanimada.", trait: "neuroticism", facet: "N3", keyed: "plus" },

  // N4 - Constrangimento (10 questões)
  { id: "N4_1", text: "Não me preocupo com o que os outros pensam de mim.", trait: "neuroticism", facet: "N4", keyed: "minus" },
  { id: "N4_2", text: "Sinto-me confortável em situações sociais.", trait: "neuroticism", facet: "N4", keyed: "minus" },
  { id: "N4_3", text: "Não fico envergonhada quando sou o centro das atenções.", trait: "neuroticism", facet: "N4", keyed: "minus" },
  { id: "N4_4", text: "Raramente sinto vergonha de mim mesma.", trait: "neuroticism", facet: "N4", keyed: "minus" },
  { id: "N4_5", text: "Não me sinto desconfortável ao falar em público.", trait: "neuroticism", facet: "N4", keyed: "minus" },
  { id: "N4_6", text: "Sinto-me inibida na presença de pessoas que não conheço.", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_7", text: "Fico envergonhada facilmente.", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_8", text: "Preocupo-me muito em parecer tola diante dos outros.", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_9", text: "Sinto desconforto quando sou observada.", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_10", text: "Tenho medo de ser julgada negativamente.", trait: "neuroticism", facet: "N4", keyed: "plus" },

  // N5 - Impulsividade (10 questões)
  { id: "N5_1", text: "Penso antes de agir.", trait: "neuroticism", facet: "N5", keyed: "minus" },
  { id: "N5_2", text: "Consigo resistir a tentações com facilidade.", trait: "neuroticism", facet: "N5", keyed: "minus" },
  { id: "N5_3", text: "Não sou impulsiva nas minhas escolhas.", trait: "neuroticism", facet: "N5", keyed: "minus" },
  { id: "N5_4", text: "Mantenho o autocontrole em situações de pressão.", trait: "neuroticism", facet: "N5", keyed: "minus" },
  { id: "N5_5", text: "Raramente me arrependo de decisões tomadas no calor do momento.", trait: "neuroticism", facet: "N5", keyed: "minus" },
  { id: "N5_6", text: "Tenho dificuldade em resistir às minhas vontades.", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_7", text: "Frequentemente como ou gasto mais do que deveria.", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_8", text: "Tomo decisões precipitadas que depois lamento.", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_9", text: "Tenho dificuldade em adiar recompensas.", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_10", text: "Ajo por impulso mesmo quando sei que não deveria.", trait: "neuroticism", facet: "N5", keyed: "plus" },

  // N6 - Vulnerabilidade (10 questões)
  { id: "N6_1", text: "Lido bem com situações de estresse.", trait: "neuroticism", facet: "N6", keyed: "minus" },
  { id: "N6_2", text: "Sinto-me capaz de enfrentar desafios difíceis.", trait: "neuroticism", facet: "N6", keyed: "minus" },
  { id: "N6_3", text: "Não entro em pânico em emergências.", trait: "neuroticism", facet: "N6", keyed: "minus" },
  { id: "N6_4", text: "Consigo manter a clareza mental sob pressão.", trait: "neuroticism", facet: "N6", keyed: "minus" },
  { id: "N6_5", text: "Não me desestabilizo facilmente.", trait: "neuroticism", facet: "N6", keyed: "minus" },
  { id: "N6_6", text: "Sinto-me incapaz de lidar com problemas sérios.", trait: "neuroticism", facet: "N6", keyed: "plus" },
  { id: "N6_7", text: "Em situações de emergência, fico paralisada.", trait: "neuroticism", facet: "N6", keyed: "plus" },
  { id: "N6_8", text: "Sinto que não consigo suportar a pressão.", trait: "neuroticism", facet: "N6", keyed: "plus" },
  { id: "N6_9", text: "Fico emocionalmente abalada diante de dificuldades.", trait: "neuroticism", facet: "N6", keyed: "plus" },
  { id: "N6_10", text: "Preciso de apoio constante para enfrentar adversidades.", trait: "neuroticism", facet: "N6", keyed: "plus" },

  // === EXTROVERSÃO ===
  // E1 - Calor (10 questões)
  { id: "E1_1", text: "Sou reservada com as pessoas.", trait: "extraversion", facet: "E1", keyed: "minus" },
  { id: "E1_2", text: "Não demonstro muito afeto.", trait: "extraversion", facet: "E1", keyed: "minus" },
  { id: "E1_3", text: "Prefiro manter distância emocional dos outros.", trait: "extraversion", facet: "E1", keyed: "minus" },
  { id: "E1_4", text: "Não sou muito expressiva com meus sentimentos.", trait: "extraversion", facet: "E1", keyed: "minus" },
  { id: "E1_5", text: "Evito conversas íntimas.", trait: "extraversion", facet: "E1", keyed: "minus" },
  { id: "E1_6", text: "Sou calorosa e afetuosa com as pessoas.", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_7", text: "Demonstro carinho facilmente.", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_8", text: "Faço amizades com facilidade.", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_9", text: "Gosto de criar vínculos emocionais profundos.", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_10", text: "As pessoas sentem que podem confiar em mim.", trait: "extraversion", facet: "E1", keyed: "plus" },

  // E2 - Sociabilidade (10 questões)
  { id: "E2_1", text: "Prefiro atividades solitárias.", trait: "extraversion", facet: "E2", keyed: "minus" },
  { id: "E2_2", text: "Festas e reuniões me cansam.", trait: "extraversion", facet: "E2", keyed: "minus" },
  { id: "E2_3", text: "Sinto-me bem com poucos amigos.", trait: "extraversion", facet: "E2", keyed: "minus" },
  { id: "E2_4", text: "Gosto mais de ficar em casa do que sair.", trait: "extraversion", facet: "E2", keyed: "minus" },
  { id: "E2_5", text: "Evito eventos sociais.", trait: "extraversion", facet: "E2", keyed: "minus" },
  { id: "E2_6", text: "Adoro festas e encontros sociais.", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_7", text: "Gosto de estar rodeada de muitas pessoas.", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_8", text: "Sinto-me energizada em eventos sociais.", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_9", text: "Prefiro atividades em grupo a atividades sozinha.", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_10", text: "Busco interação social constantemente.", trait: "extraversion", facet: "E2", keyed: "plus" },

  // E3 - Assertividade (10 questões)
  { id: "E3_1", text: "Deixo os outros tomarem a liderança.", trait: "extraversion", facet: "E3", keyed: "minus" },
  { id: "E3_2", text: "Evito confrontos.", trait: "extraversion", facet: "E3", keyed: "minus" },
  { id: "E3_3", text: "Não gosto de impor minha vontade.", trait: "extraversion", facet: "E3", keyed: "minus" },
  { id: "E3_4", text: "Tenho dificuldade em dizer não.", trait: "extraversion", facet: "E3", keyed: "minus" },
  { id: "E3_5", text: "Prefiro seguir ordens a comandar.", trait: "extraversion", facet: "E3", keyed: "minus" },
  { id: "E3_6", text: "Gosto de assumir o controle das situações.", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_7", text: "Expresso minha opinião com confiança.", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_8", text: "Assumo a liderança naturalmente.", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_9", text: "Não tenho problema em dizer não.", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_10", text: "Defendo meus pontos de vista com firmeza.", trait: "extraversion", facet: "E3", keyed: "plus" },

  // E4 - Atividade (10 questões)
  { id: "E4_1", text: "Tenho um ritmo de vida tranquilo.", trait: "extraversion", facet: "E4", keyed: "minus" },
  { id: "E4_2", text: "Prefiro atividades calmas.", trait: "extraversion", facet: "E4", keyed: "minus" },
  { id: "E4_3", text: "Não gosto de rotinas agitadas.", trait: "extraversion", facet: "E4", keyed: "minus" },
  { id: "E4_4", text: "Gosto de fazer as coisas devagar.", trait: "extraversion", facet: "E4", keyed: "minus" },
  { id: "E4_5", text: "Evito agendas muito cheias.", trait: "extraversion", facet: "E4", keyed: "minus" },
  { id: "E4_6", text: "Tenho uma agenda sempre cheia.", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_7", text: "Sou muito ativa e dinâmica.", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_8", text: "Gosto de estar sempre ocupada.", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_9", text: "Prefiro um ritmo acelerado de vida.", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_10", text: "Me sinto bem quando tenho muito a fazer.", trait: "extraversion", facet: "E4", keyed: "plus" },

  // E5 - Busca de Emoções (10 questões)
  { id: "E5_1", text: "Evito atividades arriscadas.", trait: "extraversion", facet: "E5", keyed: "minus" },
  { id: "E5_2", text: "Prefiro a segurança à aventura.", trait: "extraversion", facet: "E5", keyed: "minus" },
  { id: "E5_3", text: "Não gosto de surpresas.", trait: "extraversion", facet: "E5", keyed: "minus" },
  { id: "E5_4", text: "Evito experiências muito estimulantes.", trait: "extraversion", facet: "E5", keyed: "minus" },
  { id: "E5_5", text: "Prefiro rotinas previsíveis.", trait: "extraversion", facet: "E5", keyed: "minus" },
  { id: "E5_6", text: "Gosto de aventuras e emoções fortes.", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_7", text: "Busco experiências novas e intensas.", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_8", text: "Gosto de correr riscos.", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_9", text: "Aprecio atividades que proporcionam adrenalina.", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_10", text: "Sinto-me atraída por experiências emocionantes.", trait: "extraversion", facet: "E5", keyed: "plus" },

  // E6 - Emoções Positivas (10 questões)
  { id: "E6_1", text: "Não costumo demonstrar alegria.", trait: "extraversion", facet: "E6", keyed: "minus" },
  { id: "E6_2", text: "Tenho dificuldade em me entusiasmar.", trait: "extraversion", facet: "E6", keyed: "minus" },
  { id: "E6_3", text: "Raramente me sinto empolgada.", trait: "extraversion", facet: "E6", keyed: "minus" },
  { id: "E6_4", text: "Não sou de rir muito.", trait: "extraversion", facet: "E6", keyed: "minus" },
  { id: "E6_5", text: "Evito demonstrar excesso de emoção.", trait: "extraversion", facet: "E6", keyed: "minus" },
  { id: "E6_6", text: "Sou muito alegre.", trait: "extraversion", facet: "E6", keyed: "plus" },
  { id: "E6_7", text: "Rio com facilidade.", trait: "extraversion", facet: "E6", keyed: "plus" },
  { id: "E6_8", text: "Costumo ver o lado positivo das coisas.", trait: "extraversion", facet: "E6", keyed: "plus" },
  { id: "E6_9", text: "Sinto felicidade com frequência.", trait: "extraversion", facet: "E6", keyed: "plus" },
  { id: "E6_10", text: "Transmito bom humor para os outros.", trait: "extraversion", facet: "E6", keyed: "plus" },

  // === ABERTURA À EXPERIÊNCIA ===
  // O1 - Fantasia (10 questões)
  { id: "O1_1", text: "Sou uma pessoa prática e pé no chão.", trait: "openness", facet: "O1", keyed: "minus" },
  { id: "O1_2", text: "Não costumo sonhar acordada.", trait: "openness", facet: "O1", keyed: "minus" },
  { id: "O1_3", text: "Prefiro fatos a ficção.", trait: "openness", facet: "O1", keyed: "minus" },
  { id: "O1_4", text: "Evito pensamentos fantasiosos.", trait: "openness", facet: "O1", keyed: "minus" },
  { id: "O1_5", text: "Foco na realidade, não em possibilidades.", trait: "openness", facet: "O1", keyed: "minus" },
  { id: "O1_6", text: "Tenho uma imaginação fértil.", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O1_7", text: "Gosto de sonhar acordada.", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O1_8", text: "Tenho muitas ideias criativas.", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O1_9", text: "Frequentemente imagino cenários alternativos.", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O1_10", text: "Minha mente vaga com frequência.", trait: "openness", facet: "O1", keyed: "plus" },

  // O2 - Estética (10 questões)
  { id: "O2_1", text: "Não me interesso muito por arte.", trait: "openness", facet: "O2", keyed: "minus" },
  { id: "O2_2", text: "A beleza não me emociona.", trait: "openness", facet: "O2", keyed: "minus" },
  { id: "O2_3", text: "Prefiro funcionalidade a estética.", trait: "openness", facet: "O2", keyed: "minus" },
  { id: "O2_4", text: "Não aprecio música ou literatura.", trait: "openness", facet: "O2", keyed: "minus" },
  { id: "O2_5", text: "Não me deixo tocar por obras artísticas.", trait: "openness", facet: "O2", keyed: "minus" },
  { id: "O2_6", text: "Aprecio profundamente a arte e a beleza.", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_7", text: "Sinto-me emocionada por música ou poesia.", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_8", text: "A beleza natural me comove.", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_9", text: "Tenho sensibilidade estética aguçada.", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_10", text: "Valorizo a expressão artística.", trait: "openness", facet: "O2", keyed: "plus" },

  // O3 - Sentimentos (10 questões)
  { id: "O3_1", text: "Não presto muita atenção às minhas emoções.", trait: "openness", facet: "O3", keyed: "minus" },
  { id: "O3_2", text: "Evito pensar no que estou sentindo.", trait: "openness", facet: "O3", keyed: "minus" },
  { id: "O3_3", text: "Considero as emoções uma fraqueza.", trait: "openness", facet: "O3", keyed: "minus" },
  { id: "O3_4", text: "Prefiro agir com a razão, não com o coração.", trait: "openness", facet: "O3", keyed: "minus" },
  { id: "O3_5", text: "Não me emociono facilmente.", trait: "openness", facet: "O3", keyed: "minus" },
  { id: "O3_6", text: "Presto atenção às minhas emoções.", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_7", text: "Sinto as emoções de forma intensa.", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_8", text: "Valorizo a vida emocional.", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_9", text: "Sou aberta a experiências emocionais profundas.", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_10", text: "Reconheço a importância dos meus sentimentos.", trait: "openness", facet: "O3", keyed: "plus" },

  // O4 - Ações (10 questões)
  { id: "O4_1", text: "Gosto de rotinas fixas.", trait: "openness", facet: "O4", keyed: "minus" },
  { id: "O4_2", text: "Prefiro o que já conheço.", trait: "openness", facet: "O4", keyed: "minus" },
  { id: "O4_3", text: "Evito mudanças na minha vida.", trait: "openness", facet: "O4", keyed: "minus" },
  { id: "O4_4", text: "Não gosto de experimentar coisas novas.", trait: "openness", facet: "O4", keyed: "minus" },
  { id: "O4_5", text: "Sinto-me confortável com o habitual.", trait: "openness", facet: "O4", keyed: "minus" },
  { id: "O4_6", text: "Gosto de experimentar coisas novas.", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O4_7", text: "Adapto-me bem a mudanças.", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O4_8", text: "Busco variedade nas minhas atividades.", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O4_9", text: "Gosto de sair da minha zona de conforto.", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O4_10", text: "Estou aberta a novas experiências.", trait: "openness", facet: "O4", keyed: "plus" },

  // O5 - Ideias (10 questões)
  { id: "O5_1", text: "Prefiro tarefas práticas a discussões teóricas.", trait: "openness", facet: "O5", keyed: "minus" },
  { id: "O5_2", text: "Não me interesso por assuntos filosóficos.", trait: "openness", facet: "O5", keyed: "minus" },
  { id: "O5_3", text: "Evito debates complexos.", trait: "openness", facet: "O5", keyed: "minus" },
  { id: "O5_4", text: "Prefiro lidar com fatos concretos.", trait: "openness", facet: "O5", keyed: "minus" },
  { id: "O5_5", text: "Não gosto de pensar em conceitos abstratos.", trait: "openness", facet: "O5", keyed: "minus" },
  { id: "O5_6", text: "Gosto de explorar ideias novas.", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O5_7", text: "Sinto curiosidade intelectual.", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O5_8", text: "Aprecio discussões filosóficas.", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O5_9", text: "Gosto de refletir sobre questões complexas.", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O5_10", text: "Busco aprender coisas novas constantemente.", trait: "openness", facet: "O5", keyed: "plus" },

  // O6 - Valores (10 questões)
  { id: "O6_1", text: "Respeito tradições e convenções.", trait: "openness", facet: "O6", keyed: "minus" },
  { id: "O6_2", text: "Prefiro seguir regras estabelecidas.", trait: "openness", facet: "O6", keyed: "minus" },
  { id: "O6_3", text: "Valorizo normas sociais.", trait: "openness", facet: "O6", keyed: "minus" },
  { id: "O6_4", text: "Não questiono autoridades.", trait: "openness", facet: "O6", keyed: "minus" },
  { id: "O6_5", text: "Acredito que há uma maneira certa de fazer as coisas.", trait: "openness", facet: "O6", keyed: "minus" },
  { id: "O6_6", text: "Questiono valores tradicionais.", trait: "openness", facet: "O6", keyed: "plus" },
  { id: "O6_7", text: "Sou aberta a diferentes visões de mundo.", trait: "openness", facet: "O6", keyed: "plus" },
  { id: "O6_8", text: "Não sigo regras apenas por serem regras.", trait: "openness", facet: "O6", keyed: "plus" },
  { id: "O6_9", text: "Acredito que a moralidade é relativa.", trait: "openness", facet: "O6", keyed: "plus" },
  { id: "O6_10", text: "Respeito pontos de vista divergentes.", trait: "openness", facet: "O6", keyed: "plus" },

  // === AMABILIDADE ===
  // A1 - Confiança (10 questões)
  { id: "A1_1", text: "Sou cética em relação às intenções dos outros.", trait: "agreeableness", facet: "A1", keyed: "minus" },
  { id: "A1_2", text: "Desconfio de pessoas que não conheço bem.", trait: "agreeableness", facet: "A1", keyed: "minus" },
  { id: "A1_3", text: "Acredito que as pessoas geralmente têm segundas intenções.", trait: "agreeableness", facet: "A1", keyed: "minus" },
  { id: "A1_4", text: "Demoro a confiar nos outros.", trait: "agreeableness", facet: "A1", keyed: "minus" },
  { id: "A1_5", text: "Sou cautelosa ao lidar com desconhecidos.", trait: "agreeableness", facet: "A1", keyed: "minus" },
  { id: "A1_6", text: "Acredito no melhor das pessoas.", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_7", text: "Confio facilmente nos outros.", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_8", text: "Vejo as pessoas como bem-intencionadas.", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_9", text: "Dou o benefício da dúvida aos outros.", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_10", text: "Acredito que a maioria das pessoas é honesta.", trait: "agreeableness", facet: "A1", keyed: "plus" },

  // A2 - Franqueza (10 questões)
  { id: "A2_1", text: "Às vezes manipulo situações em meu favor.", trait: "agreeableness", facet: "A2", keyed: "minus" },
  { id: "A2_2", text: "Não sou totalmente honesta se isso me beneficiar.", trait: "agreeableness", facet: "A2", keyed: "minus" },
  { id: "A2_3", text: "Escondo minhas verdadeiras intenções quando necessário.", trait: "agreeableness", facet: "A2", keyed: "minus" },
  { id: "A2_4", text: "Uso a bajulação para conseguir o que quero.", trait: "agreeableness", facet: "A2", keyed: "minus" },
  { id: "A2_5", text: "Sou estratégica nas minhas relações.", trait: "agreeableness", facet: "A2", keyed: "minus" },
  { id: "A2_6", text: "Sou sincera e direta.", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_7", text: "Não uso de manipulação para conseguir o que quero.", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_8", text: "Sou transparente em minhas intenções.", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_9", text: "Prefiro a honestidade mesmo que doa.", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_10", text: "Não finjo ser o que não sou.", trait: "agreeableness", facet: "A2", keyed: "plus" },

  // A3 - Altruísmo (10 questões)
  { id: "A3_1", text: "Preocupo-me primeiro com meus próprios interesses.", trait: "agreeableness", facet: "A3", keyed: "minus" },
  { id: "A3_2", text: "Não me esforço para ajudar os outros.", trait: "agreeableness", facet: "A3", keyed: "minus" },
  { id: "A3_3", text: "Prefiro não me envolver nos problemas dos outros.", trait: "agreeableness", facet: "A3", keyed: "minus" },
  { id: "A3_4", text: "Evito assumir responsabilidades pelos outros.", trait: "agreeableness", facet: "A3", keyed: "minus" },
  { id: "A3_5", text: "Não costumo fazer sacrifícios por outras pessoas.", trait: "agreeableness", facet: "A3", keyed: "minus" },
  { id: "A3_6", text: "Gosto de ajudar os outros.", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_7", text: "Sinto-me bem ao fazer algo pelos outros.", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_8", text: "Coloco as necessidades dos outros antes das minhas.", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_9", text: "Estou sempre pronta a oferecer ajuda.", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_10", text: "Preocupo-me genuinamente com o bem-estar alheio.", trait: "agreeableness", facet: "A3", keyed: "plus" },

  // A4 - Complacência (10 questões)
  { id: "A4_1", text: "Defendo meu ponto de vista com firmeza.", trait: "agreeableness", facet: "A4", keyed: "minus" },
  { id: "A4_2", text: "Não cedo facilmente em discussões.", trait: "agreeableness", facet: "A4", keyed: "minus" },
  { id: "A4_3", text: "Gosto de debater e vencer argumentos.", trait: "agreeableness", facet: "A4", keyed: "minus" },
  { id: "A4_4", text: "Não tenho medo de conflitos.", trait: "agreeableness", facet: "A4", keyed: "minus" },
  { id: "A4_5", text: "Insisto quando sei que estou certa.", trait: "agreeableness", facet: "A4", keyed: "minus" },
  { id: "A4_6", text: "Evito conflitos sempre que possível.", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_7", text: "Prefiro ceder a causar discórdia.", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_8", text: "Sou flexível nas minhas opiniões.", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_9", text: "Não gosto de discussões.", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_10", text: "Aceito opiniões diferentes facilmente.", trait: "agreeableness", facet: "A4", keyed: "plus" },

  // A5 - Modéstia (10 questões)
  { id: "A5_1", text: "Não tenho problema em falar das minhas qualidades.", trait: "agreeableness", facet: "A5", keyed: "minus" },
  { id: "A5_2", text: "Gosto de ser reconhecida publicamente.", trait: "agreeableness", facet: "A5", keyed: "minus" },
  { id: "A5_3", text: "Não escondo meus talentos.", trait: "agreeableness", facet: "A5", keyed: "minus" },
  { id: "A5_4", text: "Sei que sou especial.", trait: "agreeableness", facet: "A5", keyed: "minus" },
  { id: "A5_5", text: "Gosto de me destacar.", trait: "agreeableness", facet: "A5", keyed: "minus" },
  { id: "A5_6", text: "Não me sinto superior aos outros.", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_7", text: "Prefiro não me gabar das minhas conquistas.", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_8", text: "Ajo com humildade.", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_9", text: "Evito chamar atenção para mim.", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_10", text: "Reconheço que tenho muito a aprender.", trait: "agreeableness", facet: "A5", keyed: "plus" },

  // A6 - Sensibilidade (10 questões)
  { id: "A6_1", text: "Não me afeto com o sofrimento dos outros.", trait: "agreeableness", facet: "A6", keyed: "minus" },
  { id: "A6_2", text: "Acho que as pessoas exageram nos problemas.", trait: "agreeableness", facet: "A6", keyed: "minus" },
  { id: "A6_3", text: "Não sou muito emotiva.", trait: "agreeableness", facet: "A6", keyed: "minus" },
  { id: "A6_4", text: "Evito envolvimento emocional com os problemas dos outros.", trait: "agreeableness", facet: "A6", keyed: "minus" },
  { id: "A6_5", text: "Sou mais racional do que sentimental.", trait: "agreeableness", facet: "A6", keyed: "minus" },
  { id: "A6_6", text: "Sinto empatia pelo sofrimento alheio.", trait: "agreeableness", facet: "A6", keyed: "plus" },
  { id: "A6_7", text: "Fico comovida com injustiças sociais.", trait: "agreeableness", facet: "A6", keyed: "plus" },
  { id: "A6_8", text: "Sou sensível às emoções dos outros.", trait: "agreeableness", facet: "A6", keyed: "plus" },
  { id: "A6_9", text: "Preocupo-me com causas humanitárias.", trait: "agreeableness", facet: "A6", keyed: "plus" },
  { id: "A6_10", text: "Fico emocionada ao ver outros em dificuldade.", trait: "agreeableness", facet: "A6", keyed: "plus" },

  // === CONSCIENCIOSIDADE ===
  // C1 - Competência (10 questões)
  { id: "C1_1", text: "Não me considero especialmente competente.", trait: "conscientiousness", facet: "C1", keyed: "minus" },
  { id: "C1_2", text: "Às vezes sinto que não sou capaz.", trait: "conscientiousness", facet: "C1", keyed: "minus" },
  { id: "C1_3", text: "Tenho dificuldade em lidar com tarefas complexas.", trait: "conscientiousness", facet: "C1", keyed: "minus" },
  { id: "C1_4", text: "Nem sempre confio na minha capacidade.", trait: "conscientiousness", facet: "C1", keyed: "minus" },
  { id: "C1_5", text: "Sinto-me despreparada para muitas situações.", trait: "conscientiousness", facet: "C1", keyed: "minus" },
  { id: "C1_6", text: "Confio nas minhas habilidades.", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_7", text: "Sei que posso lidar com a maioria dos desafios.", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_8", text: "Sou eficiente no que faço.", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_9", text: "Tenho habilidades para resolver problemas.", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_10", text: "Sou capaz de aprender rapidamente.", trait: "conscientiousness", facet: "C1", keyed: "plus" },

  // C2 - Ordem (10 questões)
  { id: "C2_1", text: "Não sou muito organizada.", trait: "conscientiousness", facet: "C2", keyed: "minus" },
  { id: "C2_2", text: "Meu espaço costuma estar bagunçado.", trait: "conscientiousness", facet: "C2", keyed: "minus" },
  { id: "C2_3", text: "Não sigo rotinas rígidas.", trait: "conscientiousness", facet: "C2", keyed: "minus" },
  { id: "C2_4", text: "Não me incomodo com desordem.", trait: "conscientiousness", facet: "C2", keyed: "minus" },
  { id: "C2_5", text: "Tenho dificuldade em manter as coisas no lugar.", trait: "conscientiousness", facet: "C2", keyed: "minus" },
  { id: "C2_6", text: "Gosto de manter tudo organizado.", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_7", text: "Tenho rotinas bem definidas.", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_8", text: "Prefiro ambientes arrumados.", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_9", text: "Sou sistemática no meu trabalho.", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_10", text: "Mantenho minhas coisas em ordem.", trait: "conscientiousness", facet: "C2", keyed: "plus" },

  // C3 - Senso de dever (10 questões)
  { id: "C3_1", text: "Às vezes ignoro minhas obrigações.", trait: "conscientiousness", facet: "C3", keyed: "minus" },
  { id: "C3_2", text: "Não sigo regras rigidamente.", trait: "conscientiousness", facet: "C3", keyed: "minus" },
  { id: "C3_3", text: "Não me sinto obrigada a cumprir promessas.", trait: "conscientiousness", facet: "C3", keyed: "minus" },
  { id: "C3_4", text: "Faço o que quero, não o que devo.", trait: "conscientiousness", facet: "C3", keyed: "minus" },
  { id: "C3_5", text: "Não me preocupo muito com responsabilidades.", trait: "conscientiousness", facet: "C3", keyed: "minus" },
  { id: "C3_6", text: "Cumpro minhas obrigações com rigor.", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_7", text: "Sou confiável e responsável.", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_8", text: "Sigo regras e normas.", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_9", text: "Honro meus compromissos.", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_10", text: "Levo minhas responsabilidades a sério.", trait: "conscientiousness", facet: "C3", keyed: "plus" },

  // C4 - Esforço por Realização (10 questões)
  { id: "C4_1", text: "Não sou muito ambiciosa.", trait: "conscientiousness", facet: "C4", keyed: "minus" },
  { id: "C4_2", text: "Não me esforço além do necessário.", trait: "conscientiousness", facet: "C4", keyed: "minus" },
  { id: "C4_3", text: "Não tenho grandes metas.", trait: "conscientiousness", facet: "C4", keyed: "minus" },
  { id: "C4_4", text: "Faço o mínimo exigido.", trait: "conscientiousness", facet: "C4", keyed: "minus" },
  { id: "C4_5", text: "Não busco excelência.", trait: "conscientiousness", facet: "C4", keyed: "minus" },
  { id: "C4_6", text: "Busco excelência em tudo que faço.", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_7", text: "Tenho metas claras e trabalho para alcançá-las.", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_8", text: "Sou determinada a ter sucesso.", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_9", text: "Esforço-me para superar expectativas.", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_10", text: "Sou movida pela conquista.", trait: "conscientiousness", facet: "C4", keyed: "plus" },

  // C5 - Autodisciplina (10 questões)
  { id: "C5_1", text: "Procrastino frequentemente.", trait: "conscientiousness", facet: "C5", keyed: "minus" },
  { id: "C5_2", text: "Tenho dificuldade em terminar o que começo.", trait: "conscientiousness", facet: "C5", keyed: "minus" },
  { id: "C5_3", text: "Me distraio facilmente.", trait: "conscientiousness", facet: "C5", keyed: "minus" },
  { id: "C5_4", text: "Não consigo me concentrar por longos períodos.", trait: "conscientiousness", facet: "C5", keyed: "minus" },
  { id: "C5_5", text: "Desisto diante de obstáculos.", trait: "conscientiousness", facet: "C5", keyed: "minus" },
  { id: "C5_6", text: "Termino o que começo.", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_7", text: "Mantenho o foco mesmo em tarefas difíceis.", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_8", text: "Sou disciplinada nos meus hábitos.", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_9", text: "Consigo resistir a distrações.", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_10", text: "Persisto até alcançar meus objetivos.", trait: "conscientiousness", facet: "C5", keyed: "plus" },

  // C6 - Ponderação (10 questões)
  { id: "C6_1", text: "Tomo decisões rapidamente, sem pensar muito.", trait: "conscientiousness", facet: "C6", keyed: "minus" },
  { id: "C6_2", text: "Ajo sem considerar as consequências.", trait: "conscientiousness", facet: "C6", keyed: "minus" },
  { id: "C6_3", text: "Não planejo muito antes de agir.", trait: "conscientiousness", facet: "C6", keyed: "minus" },
  { id: "C6_4", text: "Sigo meus instintos sem refletir.", trait: "conscientiousness", facet: "C6", keyed: "minus" },
  { id: "C6_5", text: "Prefiro decidir rápido e seguir em frente.", trait: "conscientiousness", facet: "C6", keyed: "minus" },
  { id: "C6_6", text: "Penso antes de agir.", trait: "conscientiousness", facet: "C6", keyed: "plus" },
  { id: "C6_7", text: "Avalio cuidadosamente as consequências das minhas decisões.", trait: "conscientiousness", facet: "C6", keyed: "plus" },
  { id: "C6_8", text: "Sou cautelosa ao tomar decisões importantes.", trait: "conscientiousness", facet: "C6", keyed: "plus" },
  { id: "C6_9", text: "Planejo meus passos com antecedência.", trait: "conscientiousness", facet: "C6", keyed: "plus" },
  { id: "C6_10", text: "Não me precipito em escolhas importantes.", trait: "conscientiousness", facet: "C6", keyed: "plus" },
];

// Informações dos traços para exibição
export const traitInfoLuciana: Record<string, TraitInfo> = {
  neuroticism: {
    name: "Neuroticismo",
    description: "Tendência a experimentar emoções negativas como ansiedade, raiva e depressão. Pessoas com alto neuroticismo são mais propensas a reagir emocionalmente a eventos estressantes.",
    color: "bg-rose-500",
    facets: ["Ansiedade", "Hostilidade", "Depressão", "Constrangimento", "Impulsividade", "Vulnerabilidade"],
  },
  extraversion: {
    name: "Extroversão",
    description: "Grau de interação social, atividade e capacidade de sentir emoções positivas. Extrovertidos tendem a ser sociáveis, assertivos e cheios de energia.",
    color: "bg-amber-500",
    facets: ["Calor", "Sociabilidade", "Assertividade", "Atividade", "Busca de Emoções", "Emoções Positivas"],
  },
  openness: {
    name: "Abertura à Experiência",
    description: "Apreciação por novas experiências, criatividade e curiosidade intelectual. Pessoas abertas tendem a ser imaginativas, criativas e abertas a novas ideias.",
    color: "bg-violet-500",
    facets: ["Fantasia", "Estética", "Sentimentos", "Ações", "Ideias", "Valores"],
  },
  agreeableness: {
    name: "Amabilidade",
    description: "Tendência a ser cooperativo, confiante e prestativo. Pessoas amáveis tendem a valorizar a harmonia social e são geralmente mais empáticas.",
    color: "bg-emerald-500",
    facets: ["Confiança", "Franqueza", "Altruísmo", "Complacência", "Modéstia", "Sensibilidade"],
  },
  conscientiousness: {
    name: "Conscienciosidade",
    description: "Grau de organização, persistência e motivação para alcançar objetivos. Pessoas conscienciosas tendem a ser disciplinadas, organizadas e confiáveis.",
    color: "bg-sky-500",
    facets: ["Competência", "Ordem", "Senso de dever", "Esforço por Realização", "Autodisciplina", "Ponderação"],
  },
};

// Total de questões por traço (60 cada = 300 total)
export const QUESTIONS_PER_TRAIT = 60;
export const QUESTIONS_PER_FACET = 10;
export const TOTAL_QUESTIONS = 300;
