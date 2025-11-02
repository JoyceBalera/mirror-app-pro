export interface Answer {
  questionId: string;
  score: number;
}

export interface FacetScore {
  name: string;
  score: number;
  classification: string;
}

export interface TraitScore {
  name: string;
  score: number;
  classification: string;
  color: string;
  facets: FacetScore[];
}

export interface Question {
  id: string;
  text: string;
  trait: string;
  facet: string;
  keyed: "plus" | "minus";
}

export interface TraitInfo {
  name: string;
  description: string;
  color: string;
  facets: string[];
}
