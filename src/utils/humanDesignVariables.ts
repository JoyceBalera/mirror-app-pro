// Lookup tables para Variáveis Avançadas de Desenho Humano

// DIGESTION - Cor do Sol Personality
export const DIGESTION_MAP: Record<number, { primary: string; description: string }> = {
  1: { primary: 'Appetite', description: 'Come quando tem fome natural' },
  2: { primary: 'Taste', description: 'Come o que tem sabor agradável' },
  3: { primary: 'Thirst', description: 'Precisa de líquidos durante refeições' },
  4: { primary: 'Touch', description: 'Temperatura e textura da comida importam' },
  5: { primary: 'Sound', description: 'Ambiente sonoro afeta digestão' },
  6: { primary: 'Light', description: 'Iluminação do ambiente importa' },
};

// Subcategoria Digestion - Tom do Sol Personality
export const DIGESTION_TONE_MAP: Record<string, string> = {
  'low': 'Focused',      // Tons 1-3
  'high': 'Open',        // Tons 4-6
};

// ENVIRONMENT - Cor do Nodo Norte Design
export const ENVIRONMENT_MAP: Record<number, { primary: string; description: string }> = {
  1: { primary: 'Caves', description: 'Ambientes fechados, internos, protegidos' },
  2: { primary: 'Markets', description: 'Lugares movimentados, comércio, interação' },
  3: { primary: 'Kitchens', description: 'Espaços de nutrição e comunidade' },
  4: { primary: 'Mountains', description: 'Lugares altos com visão ampla' },
  5: { primary: 'Valleys', description: 'Lugares baixos, isolados, introspectivos' },
  6: { primary: 'Shores', description: 'Fronteiras, transições, interfaces' },
};

// Subcategoria Environment - Tom do Nodo Norte Design
export const ENVIRONMENT_TONE_MAP: Record<string, string> = {
  'low': 'Active',       // Tons 1-3: você vai até o ambiente
  'high': 'Passive',     // Tons 4-6: o ambiente vem até você
};

// MOTIVATION - Cor do Sol Design
export const MOTIVATION_MAP: Record<number, { primary: string; description: string }> = {
  1: { primary: 'Fear', description: 'Motivada por segurança e proteção' },
  2: { primary: 'Hope', description: 'Motivada por esperança e otimismo' },
  3: { primary: 'Desire', description: 'Motivada por desejos e aspirações' },
  4: { primary: 'Need', description: 'Motivada por necessidades básicas' },
  5: { primary: 'Guilt', description: 'Motivada por responsabilidade e dever' },
  6: { primary: 'Innocence', description: 'Motivada por pureza e autenticidade' },
};

// Subcategoria Motivation - Tom do Sol Design
export const MOTIVATION_TONE_MAP: Record<string, string> = {
  'low': 'Personal',         // Tons 1-3: motivação interna
  'high': 'Transpersonal',   // Tons 4-6: motivação externa/coletiva
};

// PERSPECTIVE - Cor do Nodo Norte Personality
export const PERSPECTIVE_MAP: Record<number, { primary: string; description: string }> = {
  1: { primary: 'Survival', description: 'Perspectiva de sobrevivência básica' },
  2: { primary: 'Possibility', description: 'Perspectiva de possibilidades futuras' },
  3: { primary: 'Power', description: 'Perspectiva de poder e controle' },
  4: { primary: 'Wanting', description: 'Perspectiva de desejos e anseios' },
  5: { primary: 'Probability', description: 'Perspectiva de probabilidades lógicas' },
  6: { primary: 'Personal', description: 'Perspectiva única e individual' },
};

// Subcategoria Perspective - Tom do Nodo Norte Personality
export const PERSPECTIVE_TONE_MAP: Record<string, string> = {
  'low': 'Left',     // Tons 1-3: foco mental/estratégico
  'high': 'Right',   // Tons 4-6: foco sensorial/receptivo
};

// SENSE - Cor do gate de Ajna mais alto em Personality
export const SENSE_MAP: Record<number, { primary: string; description: string }> = {
  1: { primary: 'Smell', description: 'Sentido primário: Olfato' },
  2: { primary: 'Taste', description: 'Sentido primário: Paladar' },
  3: { primary: 'Outer Vision', description: 'Sentido primário: Visão externa' },
  4: { primary: 'Inner Vision', description: 'Sentido primário: Visão interna/insight' },
  5: { primary: 'Feeling', description: 'Sentido primário: Sentimento/tato' },
  6: { primary: 'Touch', description: 'Sentido primário: Toque físico' },
};

// DESIGN SENSE - Cor do gate de Ajna mais alto em Design
// Usa o mesmo mapa que SENSE_MAP

// Helper functions
export function getToneCategory(tone: number): 'low' | 'high' {
  return tone <= 3 ? 'low' : 'high';
}

export function getDigestionLevel(color: number): 'Low' | 'High' {
  // Simplificação comum: cores 1-3 = Low, cores 4-6 = High
  return color <= 3 ? 'Low' : 'High';
}

export interface AdvancedVariable {
  primary: string;
  description: string;
  level?: string;
  subcategory?: string;
}

export interface AdvancedVariables {
  digestion: AdvancedVariable | null;
  environment: AdvancedVariable | null;
  motivation: AdvancedVariable | null;
  perspective: AdvancedVariable | null;
  sense: AdvancedVariable | null;
  designSense: AdvancedVariable | null;
}

interface Activation {
  planet: string;
  gate: number;
  color?: number;
  tone?: number;
  line?: number;
  longitude?: number;
}

// Função para extrair variáveis avançadas dos dados do HD
export function extractAdvancedVariables(data: {
  personality_activations: Activation[];
  design_activations: Activation[];
}): AdvancedVariables {
  const sunPersonality = data.personality_activations?.find(a => a.planet === 'Sun');
  const sunDesign = data.design_activations?.find(a => a.planet === 'Sun');
  const northNodePersonality = data.personality_activations?.find(a => a.planet === 'NorthNode');
  const northNodeDesign = data.design_activations?.find(a => a.planet === 'NorthNode');

  // Gates de Ajna: 47, 24, 4, 17, 43, 11
  const ajnaGates = [47, 24, 4, 17, 43, 11];
  const ajnaPersonality = data.personality_activations
    ?.filter(a => ajnaGates.includes(a.gate))
    .sort((a, b) => b.gate - a.gate)[0]; // Gate mais alto
  const ajnaDesign = data.design_activations
    ?.filter(a => ajnaGates.includes(a.gate))
    .sort((a, b) => b.gate - a.gate)[0];

  return {
    digestion: sunPersonality?.color ? {
      primary: DIGESTION_MAP[sunPersonality.color]?.primary || 'Unknown',
      level: getDigestionLevel(sunPersonality.color),
      description: DIGESTION_MAP[sunPersonality.color]?.description || '',
      subcategory: sunPersonality.tone ? DIGESTION_TONE_MAP[getToneCategory(sunPersonality.tone)] : undefined,
    } : null,

    environment: northNodeDesign?.color ? {
      primary: ENVIRONMENT_MAP[northNodeDesign.color]?.primary || 'Unknown',
      description: ENVIRONMENT_MAP[northNodeDesign.color]?.description || '',
      subcategory: northNodeDesign.tone ? ENVIRONMENT_TONE_MAP[getToneCategory(northNodeDesign.tone)] : undefined,
    } : null,

    motivation: sunDesign?.color ? {
      primary: MOTIVATION_MAP[sunDesign.color]?.primary || 'Unknown',
      description: MOTIVATION_MAP[sunDesign.color]?.description || '',
      subcategory: sunDesign.tone ? MOTIVATION_TONE_MAP[getToneCategory(sunDesign.tone)] : undefined,
    } : null,

    perspective: northNodePersonality?.color ? {
      primary: PERSPECTIVE_MAP[northNodePersonality.color]?.primary || 'Unknown',
      description: PERSPECTIVE_MAP[northNodePersonality.color]?.description || '',
      subcategory: northNodePersonality.tone ? PERSPECTIVE_TONE_MAP[getToneCategory(northNodePersonality.tone)] : undefined,
    } : null,

    sense: ajnaPersonality?.color ? {
      primary: SENSE_MAP[ajnaPersonality.color]?.primary || 'Unknown',
      description: SENSE_MAP[ajnaPersonality.color]?.description || '',
    } : null,

    designSense: ajnaDesign?.color ? {
      primary: SENSE_MAP[ajnaDesign.color]?.primary || 'Unknown',
      description: SENSE_MAP[ajnaDesign.color]?.description || '',
    } : null,
  };
}
