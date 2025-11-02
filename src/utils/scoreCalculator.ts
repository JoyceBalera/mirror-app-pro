import { Answer } from "@/types/test";
import { questions } from "@/data/questions";

export const facetNames: Record<string, string> = {
  N1: "Ansiedade",
  N2: "Raiva/Hostilidade",
  N3: "Depressão",
  N4: "Constrangimento",
  N5: "Impulsividade",
  N6: "Vulnerabilidade ao Estresse",
  E1: "Acolhimento",
  E2: "Gregariedade",
  E3: "Assertividade",
  E4: "Atividade",
  E5: "Busca por Sensações",
  E6: "Emoções Positivas",
  O1: "Fantasia",
  O2: "Estética",
  O3: "Sentimentos",
  O4: "Ideias",
  O5: "Ações Variadas",
  O6: "Valores",
  A1: "Confiança",
  A2: "Franqueza",
  A3: "Altruísmo",
  A4: "Complacência",
  A5: "Modéstia",
  A6: "Sensibilidade",
  C1: "Comprometimento",
  C2: "Ordem",
  C3: "Senso de Dever",
  C4: "Esforço por Realizações",
  C5: "Autodisciplina",
  C6: "Ponderação",
};

export const calculateScore = (answers: Answer[]) => {
  const traitScores: Record<string, number> = {
    neuroticism: 0,
    extraversion: 0,
    openness: 0,
    agreeableness: 0,
    conscientiousness: 0,
  };

  const facetScores: Record<string, Record<string, number>> = {
    neuroticism: { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0, N6: 0 },
    extraversion: { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0 },
    openness: { O1: 0, O2: 0, O3: 0, O4: 0, O5: 0, O6: 0 },
    agreeableness: { A1: 0, A2: 0, A3: 0, A4: 0, A5: 0, A6: 0 },
    conscientiousness: { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 },
  };

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    let score = answer.score;
    if (question.keyed === "minus") {
      score = 6 - score; // Reverse score
    }

    traitScores[question.trait] += score;
    facetScores[question.trait][question.facet] += score;
  });

  return {
    scores: traitScores,
    facetScores: facetScores,
  };
};

export const getTraitClassification = (score: number): string => {
  if (score >= 24 && score <= 55) return "Baixa";
  if (score >= 56 && score <= 87) return "Média";
  if (score >= 88 && score <= 120) return "Alta";
  return "Indefinido";
};

export const getFacetClassification = (score: number): string => {
  if (score >= 4 && score <= 9) return "Baixa";
  if (score >= 10 && score <= 15) return "Média";
  if (score >= 16 && score <= 20) return "Alta";
  return "Indefinido";
};
