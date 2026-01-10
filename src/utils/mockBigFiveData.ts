import { Question } from "@/types/test";

// Generate mock trait scores with realistic variation
export const generateMockBigFiveResults = () => {
  const generateScore = () => Math.floor(Math.random() * 40) + 30; // 30-70 range
  
  const traitScores = {
    neuroticism: generateScore(),
    extraversion: generateScore(),
    openness: generateScore(),
    agreeableness: generateScore(),
    conscientiousness: generateScore(),
  };

  const getClassification = (score: number) => {
    if (score <= 40) return "low";
    if (score <= 60) return "medium";
    return "high";
  };

  const classifications = {
    neuroticism: getClassification(traitScores.neuroticism),
    extraversion: getClassification(traitScores.extraversion),
    openness: getClassification(traitScores.openness),
    agreeableness: getClassification(traitScores.agreeableness),
    conscientiousness: getClassification(traitScores.conscientiousness),
  };

  // Generate facet scores (6 facets per trait)
  const facetCodes: Record<string, string[]> = {
    neuroticism: ["N1", "N2", "N3", "N4", "N5", "N6"],
    extraversion: ["E1", "E2", "E3", "E4", "E5", "E6"],
    openness: ["O1", "O2", "O3", "O4", "O5", "O6"],
    agreeableness: ["A1", "A2", "A3", "A4", "A5", "A6"],
    conscientiousness: ["C1", "C2", "C3", "C4", "C5", "C6"],
  };

  const facetScores: Record<string, Record<string, number>> = {};
  const facetClassifications: Record<string, Record<string, string>> = {};

  Object.entries(facetCodes).forEach(([trait, codes]) => {
    facetScores[trait] = {};
    facetClassifications[trait] = {};
    codes.forEach(code => {
      const score = Math.floor(Math.random() * 30) + 10; // 10-40 range for facets
      facetScores[trait][code] = score;
      facetClassifications[trait][code] = getClassification(score * 2); // Scale for classification
    });
  });

  return {
    trait_scores: traitScores,
    classifications,
    facet_scores: facetScores,
    facet_classifications: facetClassifications,
  };
};

// Generate random answers for all questions
export const generateRandomAnswers = (questions: Question[]) => {
  return questions.map(q => ({
    questionId: q.id,
    score: Math.floor(Math.random() * 5) + 1, // 1-5
  }));
};

// Sample result with balanced scores for demo
export const DEMO_BIG_FIVE_RESULT = {
  trait_scores: {
    neuroticism: 45,
    extraversion: 62,
    openness: 71,
    agreeableness: 55,
    conscientiousness: 68,
  },
  classifications: {
    neuroticism: "medium",
    extraversion: "high",
    openness: "high",
    agreeableness: "medium",
    conscientiousness: "high",
  },
  facet_scores: {
    neuroticism: { N1: 22, N2: 18, N3: 20, N4: 25, N5: 19, N6: 21 },
    extraversion: { E1: 28, E2: 32, E3: 30, E4: 26, E5: 25, E6: 31 },
    openness: { O1: 35, O2: 30, O3: 32, O4: 28, O5: 36, O6: 33 },
    agreeableness: { A1: 24, A2: 26, A3: 28, A4: 22, A5: 25, A6: 27 },
    conscientiousness: { C1: 32, C2: 30, C3: 34, C4: 28, C5: 31, C6: 29 },
  },
  facet_classifications: {
    neuroticism: { N1: "medium", N2: "low", N3: "medium", N4: "medium", N5: "low", N6: "medium" },
    extraversion: { E1: "high", E2: "high", E3: "high", E4: "medium", E5: "medium", E6: "high" },
    openness: { O1: "high", O2: "high", O3: "high", O4: "medium", O5: "high", O6: "high" },
    agreeableness: { A1: "medium", A2: "medium", A3: "high", A4: "medium", A5: "medium", A6: "medium" },
    conscientiousness: { C1: "high", C2: "high", C3: "high", C4: "medium", C5: "high", C6: "high" },
  },
};
