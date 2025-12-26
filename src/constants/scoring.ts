// Constantes centralizadas para cálculo de scores do Big Five
export const SCORING = {
  // Limites para traits (60 questões x 1-5 pontos = 60-300)
  TRAIT_MIN: 60,
  TRAIT_MAX: 300,
  
  // Limites para facets (10 questões x 1-5 pontos = 10-50)
  FACET_MIN: 10,
  FACET_MAX: 50,
};

// Mapeamento de nomes de traits em inglês para português
export const TRAIT_NAME_MAP: Record<string, string> = {
  neuroticism: "neuroticismo",
  extraversion: "extroversão",
  openness: "abertura",
  agreeableness: "amabilidade",
  conscientiousness: "conscienciosidade",
};

// Mapeamento inverso: português para inglês
export const TRAIT_NAME_MAP_REVERSE: Record<string, string> = {
  neuroticismo: "neuroticism",
  extroversão: "extraversion",
  abertura: "openness",
  amabilidade: "agreeableness",
  conscienciosidade: "conscientiousness",
};

// Labels para exibição (capitalizados)
export const TRAIT_LABELS: Record<string, string> = {
  neuroticism: "Neuroticismo",
  neuroticismo: "Neuroticismo",
  extraversion: "Extroversão",
  extroversão: "Extroversão",
  openness: "Abertura",
  abertura: "Abertura",
  agreeableness: "Amabilidade",
  amabilidade: "Amabilidade",
  conscientiousness: "Conscienciosidade",
  conscienciosidade: "Conscienciosidade",
};

// Calcula a porcentagem normalizada de um score de trait (0-100)
export const getTraitPercentage = (score: number): number => {
  return ((score - SCORING.TRAIT_MIN) / (SCORING.TRAIT_MAX - SCORING.TRAIT_MIN)) * 100;
};

// Calcula a porcentagem normalizada de um score de facet (0-100)
export const getFacetPercentage = (score: number): number => {
  return ((score - SCORING.FACET_MIN) / (SCORING.FACET_MAX - SCORING.FACET_MIN)) * 100;
};
