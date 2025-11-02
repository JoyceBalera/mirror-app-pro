import { Question, TraitInfo } from "@/types/test";

export const questions: Question[] = [
  // Neuroticismo (N)
  { id: "N1_1", text: "Fico estressado facilmente", trait: "neuroticism", facet: "N1", keyed: "plus" },
  { id: "N1_2", text: "Sou relaxado na maior parte do tempo", trait: "neuroticism", facet: "N1", keyed: "minus" },
  { id: "N2_1", text: "Fico irritado facilmente", trait: "neuroticism", facet: "N2", keyed: "plus" },
  { id: "N2_2", text: "Raramente fico chateado", trait: "neuroticism", facet: "N2", keyed: "minus" },
  { id: "N3_1", text: "Muitas vezes me sinto triste", trait: "neuroticism", facet: "N3", keyed: "plus" },
  { id: "N3_2", text: "Estou sempre alegre", trait: "neuroticism", facet: "N3", keyed: "minus" },
  { id: "N4_1", text: "Sinto-me desconfortável comigo mesmo", trait: "neuroticism", facet: "N4", keyed: "plus" },
  { id: "N4_2", text: "Estou confortável comigo mesmo", trait: "neuroticism", facet: "N4", keyed: "minus" },
  { id: "N5_1", text: "Entro em pânico facilmente", trait: "neuroticism", facet: "N5", keyed: "plus" },
  { id: "N5_2", text: "Não me preocupo muito", trait: "neuroticism", facet: "N5", keyed: "minus" },

  // Extroversão (E)
  { id: "E1_1", text: "Faço amigos facilmente", trait: "extraversion", facet: "E1", keyed: "plus" },
  { id: "E1_2", text: "Mantenho-me em segundo plano", trait: "extraversion", facet: "E1", keyed: "minus" },
  { id: "E2_1", text: "Gosto de conversar com muitas pessoas", trait: "extraversion", facet: "E2", keyed: "plus" },
  { id: "E2_2", text: "Prefiro ficar sozinho", trait: "extraversion", facet: "E2", keyed: "minus" },
  { id: "E3_1", text: "Domino a conversa", trait: "extraversion", facet: "E3", keyed: "plus" },
  { id: "E3_2", text: "Não gosto de chamar atenção para mim", trait: "extraversion", facet: "E3", keyed: "minus" },
  { id: "E4_1", text: "Estou sempre ocupado", trait: "extraversion", facet: "E4", keyed: "plus" },
  { id: "E4_2", text: "Gosto de relaxar", trait: "extraversion", facet: "E4", keyed: "minus" },
  { id: "E5_1", text: "Busco aventura", trait: "extraversion", facet: "E5", keyed: "plus" },
  { id: "E5_2", text: "Evito multidões", trait: "extraversion", facet: "E5", keyed: "minus" },

  // Abertura (O)
  { id: "O1_1", text: "Acredito na importância da arte", trait: "openness", facet: "O1", keyed: "plus" },
  { id: "O1_2", text: "Não gosto de arte", trait: "openness", facet: "O1", keyed: "minus" },
  { id: "O2_1", text: "Tenho uma imaginação vívida", trait: "openness", facet: "O2", keyed: "plus" },
  { id: "O2_2", text: "Não tenho uma boa imaginação", trait: "openness", facet: "O2", keyed: "minus" },
  { id: "O3_1", text: "Adoro refletir sobre as coisas", trait: "openness", facet: "O3", keyed: "plus" },
  { id: "O3_2", text: "Não gosto de discussões abstratas", trait: "openness", facet: "O3", keyed: "minus" },
  { id: "O4_1", text: "Gosto de variedade", trait: "openness", facet: "O4", keyed: "plus" },
  { id: "O4_2", text: "Prefiro rotina", trait: "openness", facet: "O4", keyed: "minus" },
  { id: "O5_1", text: "Gosto de experimentar coisas novas", trait: "openness", facet: "O5", keyed: "plus" },
  { id: "O5_2", text: "Não gosto de mudanças", trait: "openness", facet: "O5", keyed: "minus" },

  // Amabilidade (A)
  { id: "A1_1", text: "Confio nos outros", trait: "agreeableness", facet: "A1", keyed: "plus" },
  { id: "A1_2", text: "Suspeito de intenções ocultas", trait: "agreeableness", facet: "A1", keyed: "minus" },
  { id: "A2_1", text: "Acredito que os outros têm boas intenções", trait: "agreeableness", facet: "A2", keyed: "plus" },
  { id: "A2_2", text: "Sou cético sobre as intenções dos outros", trait: "agreeableness", facet: "A2", keyed: "minus" },
  { id: "A3_1", text: "Respeito os outros", trait: "agreeableness", facet: "A3", keyed: "plus" },
  { id: "A3_2", text: "Penso que sou melhor que os outros", trait: "agreeableness", facet: "A3", keyed: "minus" },
  { id: "A4_1", text: "Aceito as pessoas como elas são", trait: "agreeableness", facet: "A4", keyed: "plus" },
  { id: "A4_2", text: "Tento mudar as pessoas", trait: "agreeableness", facet: "A4", keyed: "minus" },
  { id: "A5_1", text: "Faço as pessoas se sentirem confortáveis", trait: "agreeableness", facet: "A5", keyed: "plus" },
  { id: "A5_2", text: "Posso ser frio e distante", trait: "agreeableness", facet: "A5", keyed: "minus" },

  // Conscienciosidade (C)
  { id: "C1_1", text: "Sou sempre preparado", trait: "conscientiousness", facet: "C1", keyed: "plus" },
  { id: "C1_2", text: "Deixo minhas coisas por aí", trait: "conscientiousness", facet: "C1", keyed: "minus" },
  { id: "C2_1", text: "Presto atenção aos detalhes", trait: "conscientiousness", facet: "C2", keyed: "plus" },
  { id: "C2_2", text: "Faço uma bagunça das coisas", trait: "conscientiousness", facet: "C2", keyed: "minus" },
  { id: "C3_1", text: "Completo tarefas com sucesso", trait: "conscientiousness", facet: "C3", keyed: "plus" },
  { id: "C3_2", text: "Frequentemente esqueço de devolver as coisas", trait: "conscientiousness", facet: "C3", keyed: "minus" },
  { id: "C4_1", text: "Faço planos e os sigo", trait: "conscientiousness", facet: "C4", keyed: "plus" },
  { id: "C4_2", text: "Não consigo me organizar", trait: "conscientiousness", facet: "C4", keyed: "minus" },
  { id: "C5_1", text: "Trabalho duro", trait: "conscientiousness", facet: "C5", keyed: "plus" },
  { id: "C5_2", text: "Encontro dificuldade em começar tarefas", trait: "conscientiousness", facet: "C5", keyed: "minus" },
];

export const traitInfo: Record<string, TraitInfo> = {
  neuroticism: {
    name: "Neuroticismo",
    description: "Tendência a experimentar emoções negativas como ansiedade, raiva e depressão",
    color: "text-red-600",
    facets: ["Ansiedade", "Raiva/Hostilidade", "Depressão", "Autoconsciência", "Impulsividade"],
  },
  extraversion: {
    name: "Extroversão",
    description: "Nível de sociabilidade, assertividade e busca de estimulação externa",
    color: "text-purple-600",
    facets: ["Cordialidade", "Gregariedade", "Assertividade", "Atividade", "Busca de Emoções"],
  },
  openness: {
    name: "Abertura",
    description: "Apreciação por arte, emoção, aventura e ideias não convencionais",
    color: "text-blue-600",
    facets: ["Fantasia", "Estética", "Sentimentos", "Ações", "Ideias"],
  },
  agreeableness: {
    name: "Amabilidade",
    description: "Tendência a ser compassivo e cooperativo com os outros",
    color: "text-amber-600",
    facets: ["Confiança", "Franqueza", "Altruísmo", "Complacência", "Modéstia"],
  },
  conscientiousness: {
    name: "Conscienciosidade",
    description: "Tendência a ser organizado, responsável e orientado para objetivos",
    color: "text-green-600",
    facets: ["Competência", "Ordem", "Senso de Dever", "Esforço por Realizações", "Autodisciplina"],
  },
};
