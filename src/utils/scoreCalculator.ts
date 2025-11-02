import { Answer } from "@/types/test";
import { questions } from "@/data/questions";

export const facetNames: Record<string, string> = {
  N1: "Ansiedade",
  N2: "Raiva/Hostilidade",
  N3: "Depressão",
  N4: "Autoconsciência",
  N5: "Impulsividade",
  E1: "Cordialidade",
  E2: "Gregariedade",
  E3: "Assertividade",
  E4: "Atividade",
  E5: "Busca de Emoções",
  O1: "Fantasia",
  O2: "Estética",
  O3: "Sentimentos",
  O4: "Ações",
  O5: "Ideias",
  A1: "Confiança",
  A2: "Franqueza",
  A3: "Altruísmo",
  A4: "Complacência",
  A5: "Modéstia",
  C1: "Competência",
  C2: "Ordem",
  C3: "Senso de Dever",
  C4: "Esforço por Realizações",
  C5: "Autodisciplina",
};

export const calculateScore = (answers: Answer[]) => {
  const traitScores: Record<string, number[]> = {
    neuroticism: [],
    extraversion: [],
    openness: [],
    agreeableness: [],
    conscientiousness: [],
  };

  const facetScores: Record<string, Record<string, number[]>> = {
    neuroticism: { N1: [], N2: [], N3: [], N4: [], N5: [] },
    extraversion: { E1: [], E2: [], E3: [], E4: [], E5: [] },
    openness: { O1: [], O2: [], O3: [], O4: [], O5: [] },
    agreeableness: { A1: [], A2: [], A3: [], A4: [], A5: [] },
    conscientiousness: { C1: [], C2: [], C3: [], C4: [], C5: [] },
  };

  answers.forEach((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return;

    let score = answer.score;
    if (question.keyed === "minus") {
      score = 6 - score; // Reverse score
    }

    traitScores[question.trait].push(score);
    facetScores[question.trait][question.facet].push(score);
  });

  const averageScores: Record<string, number> = {};
  Object.entries(traitScores).forEach(([trait, scores]) => {
    const sum = scores.reduce((a, b) => a + b, 0);
    averageScores[trait] = scores.length > 0 ? sum / scores.length : 0;
  });

  const averageFacetScores: Record<string, Record<string, number>> = {
    neuroticism: {},
    extraversion: {},
    openness: {},
    agreeableness: {},
    conscientiousness: {},
  };

  Object.entries(facetScores).forEach(([trait, facets]) => {
    Object.entries(facets).forEach(([facet, scores]) => {
      const sum = scores.reduce((a, b) => a + b, 0);
      averageFacetScores[trait][facet] = scores.length > 0 ? sum / scores.length : 0;
    });
  });

  return {
    scores: averageScores,
    facetScores: averageFacetScores,
  };
};

export const getTraitClassification = (score: number): string => {
  if (score < 2) return "Muito Baixo";
  if (score < 2.5) return "Baixo";
  if (score < 3.5) return "Médio";
  if (score < 4) return "Alto";
  return "Muito Alto";
};

export const getFacetClassification = (score: number): string => {
  if (score < 2) return "Muito Baixo";
  if (score < 2.5) return "Baixo";
  if (score < 3.5) return "Médio";
  if (score < 4) return "Alto";
  return "Muito Alto";
};
