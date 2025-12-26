// Human Design - 9 Centros Energéticos
// Cada centro contém gates específicos e tem funções distintas

export interface CenterInfo {
  id: string;
  name: string;
  label: string;
  gates: number[];
  type: 'motor' | 'awareness' | 'pressure' | 'manifestation' | 'identity';
  function: string;
  definedMeaning: string;
  undefinedMeaning: string;
  biologicalCorrelation: string;
  color: string;
}

// Definição dos 9 Centros do Human Design
export const CENTERS: Record<string, CenterInfo> = {
  head: {
    id: 'head',
    name: 'Head',
    label: 'Cabeça',
    gates: [64, 61, 63],
    type: 'pressure',
    function: 'Inspiração e pressão mental',
    definedMeaning: 'Inspiração consistente, fonte de perguntas e ideias',
    undefinedMeaning: 'Amplifica questões dos outros, pressão para responder perguntas',
    biologicalCorrelation: 'Glândula pineal',
    color: '#FFD700' // Yellow
  },
  
  ajna: {
    id: 'ajna',
    name: 'Ajna',
    label: 'Ajna',
    gates: [47, 24, 4, 17, 43, 11],
    type: 'awareness',
    function: 'Conceptualização e processamento mental',
    definedMeaning: 'Forma fixa de pensar e processar informação',
    undefinedMeaning: 'Mente aberta, capaz de ver múltiplas perspectivas',
    biologicalCorrelation: 'Glândula pituitária anterior',
    color: '#32CD32' // Green
  },
  
  throat: {
    id: 'throat',
    name: 'Throat',
    label: 'Garganta',
    gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    type: 'manifestation',
    function: 'Comunicação e manifestação',
    definedMeaning: 'Voz consistente, capacidade de manifestar',
    undefinedMeaning: 'Voz variável, atrai atenção, pressão para falar',
    biologicalCorrelation: 'Tireoide e paratireoide',
    color: '#8B4513' // Brown
  },
  
  g: {
    id: 'g',
    name: 'G Center',
    label: 'Centro G',
    gates: [7, 1, 13, 25, 46, 2, 15, 10],
    type: 'identity',
    function: 'Identidade, direção e amor',
    definedMeaning: 'Senso fixo de identidade e direção na vida',
    undefinedMeaning: 'Identidade camaleônica, busca por pertencimento',
    biologicalCorrelation: 'Fígado e sangue',
    color: '#FFD700' // Yellow
  },
  
  heart: {
    id: 'heart',
    name: 'Heart',
    label: 'Coração',
    gates: [21, 51, 26, 40],
    type: 'motor',
    function: 'Força de vontade e ego',
    definedMeaning: 'Força de vontade consistente, capacidade de fazer promessas',
    undefinedMeaning: 'Vontade inconsistente, não deve fazer promessas',
    biologicalCorrelation: 'Coração, estômago, vesícula biliar, timo',
    color: '#FF0000' // Red
  },
  
  spleen: {
    id: 'spleen',
    name: 'Spleen',
    label: 'Baço',
    gates: [48, 57, 44, 50, 32, 28, 18],
    type: 'awareness',
    function: 'Intuição, instinto, sistema imunológico',
    definedMeaning: 'Intuição confiável, sistema imunológico forte',
    undefinedMeaning: 'Sensibilidade ao ambiente, medo do desconhecido',
    biologicalCorrelation: 'Baço, sistema linfático',
    color: '#8B4513' // Brown
  },
  
  sacral: {
    id: 'sacral',
    name: 'Sacral',
    label: 'Sacral',
    gates: [5, 14, 29, 59, 9, 3, 42, 27, 34],
    type: 'motor',
    function: 'Energia vital, sexualidade, força de trabalho',
    definedMeaning: 'Energia sustentável para trabalho, responde à vida',
    undefinedMeaning: 'Não tem energia própria sustentável, deve descansar',
    biologicalCorrelation: 'Ovários, testículos',
    color: '#FF0000' // Red
  },
  
  solar: {
    id: 'solar',
    name: 'Solar Plexus',
    label: 'Plexo Solar',
    gates: [36, 22, 37, 6, 49, 55, 30],
    type: 'motor',
    function: 'Emoções, sentimentos, ondas emocionais',
    definedMeaning: 'Onda emocional consistente, deve esperar clareza',
    undefinedMeaning: 'Empata, absorve emoções dos outros',
    biologicalCorrelation: 'Rins, pâncreas, próstata, sistema nervoso',
    color: '#8B4513' // Brown
  },
  
  root: {
    id: 'root',
    name: 'Root',
    label: 'Raiz',
    gates: [53, 60, 52, 19, 39, 41, 58, 38, 54],
    type: 'pressure',
    function: 'Pressão para começar, adrenalina, estresse',
    definedMeaning: 'Lida bem com pressão, ritmo próprio',
    undefinedMeaning: 'Amplifica pressão, sensação de pressa',
    biologicalCorrelation: 'Glândulas adrenais',
    color: '#8B4513' // Brown
  }
};

// Array ordenado para visualização do BodyGraph (de cima para baixo)
export const CENTERS_ORDER = ['head', 'ajna', 'throat', 'g', 'heart', 'spleen', 'sacral', 'solar', 'root'];

// Lista de centros motores
export const MOTOR_CENTERS = ['heart', 'sacral', 'solar', 'root'];

// Lista de centros de awareness
export const AWARENESS_CENTERS = ['ajna', 'spleen', 'solar'];

// Função para verificar se um centro está definido dado os gates ativos
export function isCenterDefined(centerId: string, activeGates: number[]): boolean {
  const center = CENTERS[centerId];
  if (!center) return false;
  
  // Um centro está definido se pelo menos um de seus gates está ativo
  // E esse gate faz parte de um canal completo
  return center.gates.some(gate => activeGates.includes(gate));
}

// Função para obter informações de um centro
export function getCenterInfo(centerId: string): CenterInfo | undefined {
  return CENTERS[centerId];
}

// Função para encontrar qual centro um gate pertence
export function getGateCenter(gate: number): string | undefined {
  for (const [centerId, center] of Object.entries(CENTERS)) {
    if (center.gates.includes(gate)) {
      return centerId;
    }
  }
  return undefined;
}
