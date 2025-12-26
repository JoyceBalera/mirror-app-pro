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

// Novas faixas para 300 questões (60 perguntas por traço, escala 60-300)
export const getTraitClassification = (score: number): string => {
  if (score >= 60 && score <= 140) return "Baixa";
  if (score >= 141 && score <= 220) return "Média";
  if (score >= 221 && score <= 300) return "Alta";
  return "Indefinido";
};

// Novas faixas para 10 perguntas por faceta (escala 10-50)
export const getFacetClassification = (score: number): string => {
  if (score >= 10 && score <= 23) return "Baixa";
  if (score >= 24 && score <= 36) return "Média";
  if (score >= 37 && score <= 50) return "Alta";
  return "Indefinido";
};
