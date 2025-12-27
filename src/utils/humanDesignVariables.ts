// Lookup tables para Variáveis Avançadas de Desenho Humano

// DIGESTION - Cor do Sol Personality
export const DIGESTION_MAP: Record<number, { primary: string; description: string; tips: string }> = {
  1: { primary: 'Appetite', description: 'Come quando tem fome natural', tips: 'Não siga horários fixos. Coma apenas quando sentir fome genuína. Evite comer por obrigação social ou rotina.' },
  2: { primary: 'Taste', description: 'Come o que tem sabor agradável', tips: 'Escolha alimentos pelo sabor. Se não está gostoso, não force. Seu corpo sabe o que precisa pelo paladar.' },
  3: { primary: 'Thirst', description: 'Precisa de líquidos durante refeições', tips: 'Beba água ou líquidos durante as refeições. Sopas e caldos são excelentes. Hidratação é essencial para sua digestão.' },
  4: { primary: 'Touch', description: 'Temperatura e textura da comida importam', tips: 'Prefira comidas quentes ou frias conforme seu corpo pede. Texturas cremosas ou crocantes fazem diferença para você.' },
  5: { primary: 'Sound', description: 'Ambiente sonoro afeta digestão', tips: 'Coma em ambientes calmos ou com música agradável. Evite discussões ou TV alta durante refeições.' },
  6: { primary: 'Light', description: 'Iluminação do ambiente importa', tips: 'Luz natural é ideal para suas refeições. Evite comer no escuro ou sob luz artificial intensa.' },
};

// Subcategoria Digestion - Tom do Sol Personality
export const DIGESTION_TONE_MAP: Record<string, string> = {
  'low': 'Focused',      // Tons 1-3
  'high': 'Open',        // Tons 4-6
};

// ENVIRONMENT - Cor do Nodo Norte Design
export const ENVIRONMENT_MAP: Record<number, { primary: string; description: string; tips: string }> = {
  1: { primary: 'Caves', description: 'Ambientes fechados, internos, protegidos', tips: 'Trabalhe em espaços fechados e aconchegantes. Escritórios, quartos, caves. Evite áreas abertas demais.' },
  2: { primary: 'Markets', description: 'Lugares movimentados, comércio, interação', tips: 'Prospere em ambientes movimentados: cafés, coworkings, feiras. A energia das pessoas te energiza.' },
  3: { primary: 'Kitchens', description: 'Espaços de nutrição e comunidade', tips: 'Cozinhas, restaurantes, lugares de nutrição. Trabalhe perto de onde há comida sendo preparada.' },
  4: { primary: 'Mountains', description: 'Lugares altos com visão ampla', tips: 'Busque andares altos, mirantes, montanhas. Você precisa de vista panorâmica e perspectiva ampla.' },
  5: { primary: 'Valleys', description: 'Lugares baixos, isolados, introspectivos', tips: 'Vales, térreos, lugares recolhidos. Ambientes baixos e protegidos favorecem sua energia.' },
  6: { primary: 'Shores', description: 'Fronteiras, transições, interfaces', tips: 'Beira-mar, margens de rios, fronteiras entre ambientes. Transições te energizam: cidade/campo, casa/trabalho.' },
};

// Subcategoria Environment - Tom do Nodo Norte Design
export const ENVIRONMENT_TONE_MAP: Record<string, string> = {
  'low': 'Active',       // Tons 1-3: você vai até o ambiente
  'high': 'Passive',     // Tons 4-6: o ambiente vem até você
};

// MOTIVATION - Cor do Sol Design
export const MOTIVATION_MAP: Record<number, { primary: string; description: string; tips: string }> = {
  1: { primary: 'Fear', description: 'Motivada por segurança e proteção', tips: 'Crie estruturas de segurança antes de arriscar. Planeje contingências. Sua cautela é sabedoria, não fraqueza.' },
  2: { primary: 'Hope', description: 'Motivada por esperança e otimismo', tips: 'Visualize o melhor resultado possível. Sua esperança inspira outros. Evite pessoas muito pessimistas.' },
  3: { primary: 'Desire', description: 'Motivada por desejos e aspirações', tips: 'Identifique o que você realmente quer. Desejos claros te movem. Não reprima suas aspirações materiais ou emocionais.' },
  4: { primary: 'Need', description: 'Motivada por necessidades básicas', tips: 'Atenda primeiro suas necessidades fundamentais. Não ignore fome, sono, descanso. Cuide do básico antes do extraordinário.' },
  5: { primary: 'Guilt', description: 'Motivada por responsabilidade e dever', tips: 'Use sua responsabilidade como força, não prisão. Contribuir para outros te realiza. Cuidado com culpa excessiva.' },
  6: { primary: 'Innocence', description: 'Motivada por pureza e autenticidade', tips: 'Mantenha sua visão pura sobre as coisas. Não se corrompa por cinismo. Sua ingenuidade é uma força, não fraqueza.' },
};

// Subcategoria Motivation - Tom do Sol Design
export const MOTIVATION_TONE_MAP: Record<string, string> = {
  'low': 'Personal',         // Tons 1-3: motivação interna
  'high': 'Transpersonal',   // Tons 4-6: motivação externa/coletiva
};

// PERSPECTIVE - Cor do Nodo Norte Personality
export const PERSPECTIVE_MAP: Record<number, { primary: string; description: string; tips: string }> = {
  1: { primary: 'Survival', description: 'Perspectiva de sobrevivência básica', tips: 'Confie na sua capacidade de identificar o que é essencial. Você vê ameaças e oportunidades que outros ignoram.' },
  2: { primary: 'Possibility', description: 'Perspectiva de possibilidades futuras', tips: 'Você vê potenciais onde outros veem problemas. Use essa visão para criar novas soluções e caminhos.' },
  3: { primary: 'Power', description: 'Perspectiva de poder e controle', tips: 'Identifique quem tem o poder real nas situações. Use sua percepção de dinâmicas de poder com sabedoria.' },
  4: { primary: 'Wanting', description: 'Perspectiva de desejos e anseios', tips: 'Você entende profundamente o que as pessoas querem. Use essa percepção para criar valor e conexões.' },
  5: { primary: 'Probability', description: 'Perspectiva de probabilidades lógicas', tips: 'Confie na sua análise lógica de chances e riscos. Você vê padrões estatísticos que outros não percebem.' },
  6: { primary: 'Personal', description: 'Perspectiva única e individual', tips: 'Sua visão é única e válida. Não tente ver como os outros veem. Sua perspectiva pessoal é seu maior ativo.' },
};

// Subcategoria Perspective - Tom do Nodo Norte Personality
export const PERSPECTIVE_TONE_MAP: Record<string, string> = {
  'low': 'Left',     // Tons 1-3: foco mental/estratégico
  'high': 'Right',   // Tons 4-6: foco sensorial/receptivo
};

// SENSE - Cor do gate de Ajna mais alto em Personality
export const SENSE_MAP: Record<number, { primary: string; description: string; tips: string }> = {
  1: { primary: 'Smell', description: 'Sentido primário: Olfato', tips: 'Confie em impressões olfativas. Aromas influenciam suas decisões. Use perfumes e aromas a seu favor.' },
  2: { primary: 'Taste', description: 'Sentido primário: Paladar', tips: 'Seu paladar é guia de decisões. Quando algo "não tem gosto bom", preste atenção. Sabores afetam seu humor.' },
  3: { primary: 'Outer Vision', description: 'Sentido primário: Visão externa', tips: 'Você processa melhor o que vê externamente. Gráficos, imagens, visualizações te ajudam. Observe o ambiente.' },
  4: { primary: 'Inner Vision', description: 'Sentido primário: Visão interna/insight', tips: 'Confie em suas visualizações mentais e insights. Meditação e reflexão aprofundam sua percepção.' },
  5: { primary: 'Feeling', description: 'Sentido primário: Sentimento/tato', tips: 'Suas sensações emocionais são informação valiosa. "Sentir" uma situação te dá dados que a lógica não alcança.' },
  6: { primary: 'Touch', description: 'Sentido primário: Toque físico', tips: 'O contato físico é importante para você processar informações. Tocar objetos, pessoas, texturas te conecta à realidade.' },
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
  tips?: string;
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
      tips: DIGESTION_MAP[sunPersonality.color]?.tips || '',
      subcategory: sunPersonality.tone ? DIGESTION_TONE_MAP[getToneCategory(sunPersonality.tone)] : undefined,
    } : null,

    environment: northNodeDesign?.color ? {
      primary: ENVIRONMENT_MAP[northNodeDesign.color]?.primary || 'Unknown',
      description: ENVIRONMENT_MAP[northNodeDesign.color]?.description || '',
      tips: ENVIRONMENT_MAP[northNodeDesign.color]?.tips || '',
      subcategory: northNodeDesign.tone ? ENVIRONMENT_TONE_MAP[getToneCategory(northNodeDesign.tone)] : undefined,
    } : null,

    motivation: sunDesign?.color ? {
      primary: MOTIVATION_MAP[sunDesign.color]?.primary || 'Unknown',
      description: MOTIVATION_MAP[sunDesign.color]?.description || '',
      tips: MOTIVATION_MAP[sunDesign.color]?.tips || '',
      subcategory: sunDesign.tone ? MOTIVATION_TONE_MAP[getToneCategory(sunDesign.tone)] : undefined,
    } : null,

    perspective: northNodePersonality?.color ? {
      primary: PERSPECTIVE_MAP[northNodePersonality.color]?.primary || 'Unknown',
      description: PERSPECTIVE_MAP[northNodePersonality.color]?.description || '',
      tips: PERSPECTIVE_MAP[northNodePersonality.color]?.tips || '',
      subcategory: northNodePersonality.tone ? PERSPECTIVE_TONE_MAP[getToneCategory(northNodePersonality.tone)] : undefined,
    } : null,

    sense: ajnaPersonality?.color ? {
      primary: SENSE_MAP[ajnaPersonality.color]?.primary || 'Unknown',
      description: SENSE_MAP[ajnaPersonality.color]?.description || '',
      tips: SENSE_MAP[ajnaPersonality.color]?.tips || '',
    } : null,

    designSense: ajnaDesign?.color ? {
      primary: SENSE_MAP[ajnaDesign.color]?.primary || 'Unknown',
      description: SENSE_MAP[ajnaDesign.color]?.description || '',
      tips: SENSE_MAP[ajnaDesign.color]?.tips || '',
    } : null,
  };
}
