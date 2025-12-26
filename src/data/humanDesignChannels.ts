// Human Design - 36 Canais
// Cada canal conecta dois gates de centros diferentes
// Quando ambos os gates de um canal estão ativos, o canal está "definido"

export interface Channel {
  id: string;
  gates: [number, number];
  name: string;
  nameEn: string;
  centers: [string, string];
  circuitry: 'individual' | 'collective' | 'tribal' | 'integration';
  keynote: string;
  description: string;
}

// Os 36 Canais do Human Design
export const CHANNELS: Channel[] = [
  // CIRCUITO DE INTEGRAÇÃO (4 canais)
  {
    id: '34-57',
    gates: [34, 57],
    name: 'Poder',
    nameEn: 'The Channel of Power',
    centers: ['sacral', 'spleen'],
    circuitry: 'integration',
    keynote: 'Poder Arquetípico',
    description: 'Canal de poder instintivo e intuição para sobrevivência'
  },
  {
    id: '10-57',
    gates: [10, 57],
    name: 'Perfeição',
    nameEn: 'The Channel of Perfection',
    centers: ['g', 'spleen'],
    circuitry: 'integration',
    keynote: 'Sobrevivência do Amor-Próprio',
    description: 'Intuição para o comportamento perfeito'
  },
  {
    id: '20-57',
    gates: [20, 57],
    name: 'A Onda Cerebral',
    nameEn: 'The Brain Wave',
    centers: ['throat', 'spleen'],
    circuitry: 'integration',
    keynote: 'Consciência no Agora',
    description: 'Intuição expressa no momento presente'
  },
  {
    id: '10-34',
    gates: [10, 34],
    name: 'Exploração',
    nameEn: 'The Channel of Exploration',
    centers: ['g', 'sacral'],
    circuitry: 'integration',
    keynote: 'Seguindo a Convicção',
    description: 'Poder para seguir sua própria direção'
  },

  // CIRCUITO INDIVIDUAL - CONHECIMENTO (8 canais)
  {
    id: '61-24',
    gates: [61, 24],
    name: 'Consciência',
    nameEn: 'The Channel of Awareness',
    centers: ['head', 'ajna'],
    circuitry: 'individual',
    keynote: 'Um Pensador',
    description: 'Inspiração que leva à racionalização'
  },
  {
    id: '43-23',
    gates: [43, 23],
    name: 'Estruturação',
    nameEn: 'The Channel of Structuring',
    centers: ['ajna', 'throat'],
    circuitry: 'individual',
    keynote: 'Individualidade',
    description: 'Insights únicos expressos como simplicidade'
  },
  {
    id: '1-8',
    gates: [1, 8],
    name: 'Inspiração',
    nameEn: 'The Channel of Inspiration',
    centers: ['g', 'throat'],
    circuitry: 'individual',
    keynote: 'Um Modelo de Papel Criativo',
    description: 'Auto-expressão criativa que inspira outros'
  },
  {
    id: '2-14',
    gates: [2, 14],
    name: 'O Batedor',
    nameEn: 'The Beat',
    centers: ['g', 'sacral'],
    circuitry: 'individual',
    keynote: 'Uma Chave Mestra',
    description: 'Direção e resposta ao chamado'
  },
  {
    id: '28-38',
    gates: [28, 38],
    name: 'Luta',
    nameEn: 'The Channel of Struggle',
    centers: ['spleen', 'root'],
    circuitry: 'individual',
    keynote: 'Teimosia',
    description: 'Luta pelo significado individual'
  },
  {
    id: '57-20',
    gates: [57, 20],
    name: 'Onda Cerebral',
    nameEn: 'Brain Wave',
    centers: ['spleen', 'throat'],
    circuitry: 'integration',
    keynote: 'Penetração',
    description: 'Clareza intuitiva expressa no agora'
  },
  {
    id: '3-60',
    gates: [3, 60],
    name: 'Mutação',
    nameEn: 'The Channel of Mutation',
    centers: ['sacral', 'root'],
    circuitry: 'individual',
    keynote: 'Pulso de Energia',
    description: 'Mutação através de limitação'
  },
  {
    id: '39-55',
    gates: [39, 55],
    name: 'Emotividade',
    nameEn: 'The Channel of Emoting',
    centers: ['root', 'solar'],
    circuitry: 'individual',
    keynote: 'Mudança de Humor',
    description: 'Espírito provocativo que gera mudança'
  },

  // CIRCUITO COLETIVO - COMPREENSÃO (7 canais)
  {
    id: '64-47',
    gates: [64, 47],
    name: 'Abstração',
    nameEn: 'The Channel of Abstraction',
    centers: ['head', 'ajna'],
    circuitry: 'collective',
    keynote: 'Uma Mente Mental',
    description: 'Confusão mental que leva à realização'
  },
  {
    id: '11-56',
    gates: [11, 56],
    name: 'Curiosidade',
    nameEn: 'The Channel of Curiosity',
    centers: ['ajna', 'throat'],
    circuitry: 'collective',
    keynote: 'Um Pesquisador',
    description: 'Ideias estimulantes compartilhadas'
  },
  {
    id: '35-36',
    gates: [35, 36],
    name: 'Transitoriedade',
    nameEn: 'The Channel of Transitoriness',
    centers: ['throat', 'solar'],
    circuitry: 'collective',
    keynote: 'Um Mariposa',
    description: 'Busca por novas experiências'
  },
  {
    id: '29-46',
    gates: [29, 46],
    name: 'Descoberta',
    nameEn: 'The Channel of Discovery',
    centers: ['sacral', 'g'],
    circuitry: 'collective',
    keynote: 'Sucede Onde Outros Falham',
    description: 'Comprometimento corporal total'
  },
  {
    id: '13-33',
    gates: [13, 33],
    name: 'O Filho Pródigo',
    nameEn: 'The Prodigal',
    centers: ['g', 'throat'],
    circuitry: 'collective',
    keynote: 'Uma Testemunha',
    description: 'Ouvir e compartilhar experiências'
  },
  {
    id: '42-53',
    gates: [42, 53],
    name: 'Maturação',
    nameEn: 'The Channel of Maturation',
    centers: ['sacral', 'root'],
    circuitry: 'collective',
    keynote: 'Desenvolvimento Equilibrado',
    description: 'Ciclos de começo e fim'
  },
  {
    id: '30-41',
    gates: [30, 41],
    name: 'Reconhecimento',
    nameEn: 'The Channel of Recognition',
    centers: ['solar', 'root'],
    circuitry: 'collective',
    keynote: 'Sentimentos Focados',
    description: 'Fantasia emocional e desejo'
  },

  // CIRCUITO COLETIVO - LÓGICA (7 canais)
  {
    id: '63-4',
    gates: [63, 4],
    name: 'Lógica',
    nameEn: 'The Channel of Logic',
    centers: ['head', 'ajna'],
    circuitry: 'collective',
    keynote: 'Uma Mente Lógica',
    description: 'Dúvida que leva à formulação'
  },
  {
    id: '17-62',
    gates: [17, 62],
    name: 'Aceitação',
    nameEn: 'The Channel of Acceptance',
    centers: ['ajna', 'throat'],
    circuitry: 'collective',
    keynote: 'Um Ser Organizacional',
    description: 'Opiniões detalhadas e estruturadas'
  },
  {
    id: '7-31',
    gates: [7, 31],
    name: 'O Alfa',
    nameEn: 'The Alpha',
    centers: ['g', 'throat'],
    circuitry: 'collective',
    keynote: 'Para o Bem ou Para o Mal',
    description: 'Liderança e influência'
  },
  {
    id: '15-5',
    gates: [15, 5],
    name: 'Ritmo',
    nameEn: 'The Channel of Rhythm',
    centers: ['g', 'sacral'],
    circuitry: 'collective',
    keynote: 'Estar no Fluxo',
    description: 'Ritmos naturais e padrões'
  },
  {
    id: '9-52',
    gates: [9, 52],
    name: 'Concentração',
    nameEn: 'The Channel of Concentration',
    centers: ['sacral', 'root'],
    circuitry: 'collective',
    keynote: 'Determinação',
    description: 'Foco e quietude para completar tarefas'
  },
  {
    id: '18-58',
    gates: [18, 58],
    name: 'Julgamento',
    nameEn: 'The Channel of Judgment',
    centers: ['spleen', 'root'],
    circuitry: 'collective',
    keynote: 'Insatisfação',
    description: 'Alegria em corrigir e melhorar'
  },
  {
    id: '48-16',
    gates: [48, 16],
    name: 'Talento',
    nameEn: 'The Channel of the Wavelength',
    centers: ['spleen', 'throat'],
    circuitry: 'collective',
    keynote: 'Talento',
    description: 'Profundidade expressa com entusiasmo'
  },

  // CIRCUITO TRIBAL - DEFESA (4 canais)
  {
    id: '44-26',
    gates: [44, 26],
    name: 'Rendição',
    nameEn: 'The Channel of Surrender',
    centers: ['spleen', 'heart'],
    circuitry: 'tribal',
    keynote: 'Uma Transmissora',
    description: 'Alertar o ego para oportunidades'
  },
  {
    id: '21-45',
    gates: [21, 45],
    name: 'O Canal do Dinheiro',
    nameEn: 'The Money Line',
    centers: ['heart', 'throat'],
    circuitry: 'tribal',
    keynote: 'Uma Materialista',
    description: 'Controle e liderança material'
  },
  {
    id: '50-27',
    gates: [50, 27],
    name: 'Preservação',
    nameEn: 'The Channel of Preservation',
    centers: ['spleen', 'sacral'],
    circuitry: 'tribal',
    keynote: 'Uma Cuidadora',
    description: 'Cuidado e valores instintivos'
  },
  {
    id: '32-54',
    gates: [32, 54],
    name: 'Transformação',
    nameEn: 'The Channel of Transformation',
    centers: ['spleen', 'root'],
    circuitry: 'tribal',
    keynote: 'Sendo Dirigida',
    description: 'Ambição instintiva para subir'
  },

  // CIRCUITO TRIBAL - EGO (4 canais)
  {
    id: '40-37',
    gates: [40, 37],
    name: 'Comunidade',
    nameEn: 'The Channel of Community',
    centers: ['heart', 'solar'],
    circuitry: 'tribal',
    keynote: 'Uma Parte que Busca o Todo',
    description: 'Negociação emocional na família'
  },
  {
    id: '26-44',
    gates: [26, 44],
    name: 'Rendição',
    nameEn: 'Surrender',
    centers: ['heart', 'spleen'],
    circuitry: 'tribal',
    keynote: 'Transmissão',
    description: 'Reconhecer padrões para transmitir'
  },
  {
    id: '6-59',
    gates: [6, 59],
    name: 'Intimidade',
    nameEn: 'The Channel of Intimacy',
    centers: ['solar', 'sacral'],
    circuitry: 'tribal',
    keynote: 'Focado na Reprodução',
    description: 'Intimidade emocional e reprodução'
  },
  {
    id: '19-49',
    gates: [19, 49],
    name: 'Síntese',
    nameEn: 'The Channel of Synthesis',
    centers: ['root', 'solar'],
    circuitry: 'tribal',
    keynote: 'Sendo Sensível',
    description: 'Necessidades emocionais e revolução'
  },
  
  // CANAIS ADICIONAIS
  {
    id: '51-25',
    gates: [51, 25],
    name: 'Iniciação',
    nameEn: 'The Channel of Initiation',
    centers: ['heart', 'g'],
    circuitry: 'individual',
    keynote: 'Precisar Ser Primeiro',
    description: 'Choque que desperta o espírito'
  },
  {
    id: '12-22',
    gates: [12, 22],
    name: 'Abertura',
    nameEn: 'The Channel of Openness',
    centers: ['throat', 'solar'],
    circuitry: 'individual',
    keynote: 'Um Design Social',
    description: 'Expressão emocional social'
  }
];

// Função para encontrar canal entre dois gates
export function findChannel(gate1: number, gate2: number): Channel | undefined {
  return CHANNELS.find(ch => 
    (ch.gates[0] === gate1 && ch.gates[1] === gate2) ||
    (ch.gates[0] === gate2 && ch.gates[1] === gate1)
  );
}

// Função para obter todos os canais que usam um gate específico
export function getChannelsWithGate(gate: number): Channel[] {
  return CHANNELS.filter(ch => ch.gates.includes(gate));
}

// Função para verificar quais canais estão completos (definidos)
export function getActiveChannels(activeGates: number[]): Channel[] {
  return CHANNELS.filter(ch => 
    activeGates.includes(ch.gates[0]) && activeGates.includes(ch.gates[1])
  );
}

// Função para obter canais por circuito
export function getChannelsByCircuitry(circuitry: Channel['circuitry']): Channel[] {
  return CHANNELS.filter(ch => ch.circuitry === circuitry);
}
