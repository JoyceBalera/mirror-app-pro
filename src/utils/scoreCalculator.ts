import { Answer } from "@/types/test";
import { questionsLuciana as questions, facetNamesLuciana } from "@/data/bigFiveQuestionsLuciana";

export const facetNames: Record<string, string> = facetNamesLuciana;

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

// Faixas de 5 níveis para 300 questões (60 perguntas por traço, escala 60-300) - Luciana
export const getTraitClassification = (score: number): string => {
  if (score >= 60 && score <= 108) return "Muito Baixo";
  if (score >= 109 && score <= 156) return "Baixo";
  if (score >= 157 && score <= 198) return "Médio";
  if (score >= 199 && score <= 246) return "Alto";
  if (score >= 247 && score <= 300) return "Muito Alto";
  return "Indefinido";
};

// Faixas de 5 níveis para 10 perguntas por faceta (escala 10-50) - Luciana
export const getFacetClassification = (score: number): string => {
  if (score >= 10 && score <= 18) return "Muito Baixo";
  if (score >= 19 && score <= 26) return "Baixo";
  if (score >= 27 && score <= 33) return "Médio";
  if (score >= 34 && score <= 41) return "Alto";
  if (score >= 42 && score <= 50) return "Muito Alto";
  return "Indefinido";
};
