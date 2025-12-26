// Human Design - Mapeamento dos 64 Gates
// Baseado no I Ching e na roda do Mandala HD
// O Gate 41 começa em ~58° do zodíaco (Aquário 28°)

// Sequência dos 64 gates na ordem do Mandala HD (começando no Gate 41)
export const GATE_SEQUENCE: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63,  // Aquário/Peixes
  22, 36, 25, 17, 21, 51, 42, 3,   // Áries/Touro
  27, 24, 2, 23, 8, 20, 16, 35,    // Touro/Gêmeos
  45, 12, 15, 52, 39, 53, 62, 56,  // Gêmeos/Câncer
  31, 33, 7, 4, 29, 59, 40, 64,    // Câncer/Leão
  47, 6, 46, 18, 48, 57, 32, 50,   // Leão/Virgem
  28, 44, 1, 43, 14, 34, 9, 5,     // Virgem/Libra
  26, 11, 10, 58, 38, 54, 61, 60   // Libra/Escorpião/Sagitário/Capricórnio
];

// Offset do Mandala HD - Gate 41 começa aproximadamente em 58° absoluto
export const MANDALA_OFFSET = 58.0;

// Graus por gate (360° / 64 gates)
export const DEGREES_PER_GATE = 5.625;

// Graus por linha (5.625° / 6 linhas)
export const DEGREES_PER_LINE = 0.9375;

// Interface para informações de um Gate
export interface GateInfo {
  gate: number;
  name: string;
  nameEn: string;
  center: string;
  iChing: string;
  keynote: string;
}

// Dados completos dos 64 Gates com nomes e centros
export const GATES_DATA: Record<number, GateInfo> = {
  1: { gate: 1, name: "Auto-Expressão", nameEn: "Self-Expression", center: "g", iChing: "O Criativo", keynote: "Criatividade" },
  2: { gate: 2, name: "O Receptivo", nameEn: "The Receptive", center: "g", iChing: "O Receptivo", keynote: "Direção Superior" },
  3: { gate: 3, name: "Ordenar", nameEn: "Ordering", center: "sacral", iChing: "Dificuldade Inicial", keynote: "Inovação" },
  4: { gate: 4, name: "Formulação", nameEn: "Formulization", center: "ajna", iChing: "Imaturidade", keynote: "Mentalização" },
  5: { gate: 5, name: "Padrões Fixos", nameEn: "Fixed Patterns", center: "sacral", iChing: "Espera", keynote: "Ritmos" },
  6: { gate: 6, name: "Atrito", nameEn: "Friction", center: "solar", iChing: "Conflito", keynote: "Intimidade" },
  7: { gate: 7, name: "O Papel do Self", nameEn: "The Role of the Self", center: "g", iChing: "O Exército", keynote: "Liderança" },
  8: { gate: 8, name: "Contribuição", nameEn: "Contribution", center: "throat", iChing: "União", keynote: "Contribuição" },
  9: { gate: 9, name: "O Poder do Pequeno", nameEn: "The Taming Power of the Small", center: "sacral", iChing: "Força Domadora do Pequeno", keynote: "Foco" },
  10: { gate: 10, name: "Comportamento do Self", nameEn: "Behavior of the Self", center: "g", iChing: "Pisar", keynote: "Amor-Próprio" },
  11: { gate: 11, name: "Paz", nameEn: "Peace", center: "ajna", iChing: "Paz", keynote: "Ideias" },
  12: { gate: 12, name: "Cautela", nameEn: "Caution", center: "throat", iChing: "Estagnação", keynote: "Articulação" },
  13: { gate: 13, name: "O Ouvinte", nameEn: "The Listener", center: "g", iChing: "Comunhão", keynote: "Escuta" },
  14: { gate: 14, name: "Habilidades de Poder", nameEn: "Power Skills", center: "sacral", iChing: "Posse Grande", keynote: "Prosperidade" },
  15: { gate: 15, name: "Extremos", nameEn: "Extremes", center: "g", iChing: "Modéstia", keynote: "Fluxo Humano" },
  16: { gate: 16, name: "Habilidades", nameEn: "Skills", center: "throat", iChing: "Entusiasmo", keynote: "Entusiasmo" },
  17: { gate: 17, name: "Opiniões", nameEn: "Opinions", center: "ajna", iChing: "Seguir", keynote: "Opiniões" },
  18: { gate: 18, name: "Correção", nameEn: "Correction", center: "spleen", iChing: "Trabalho no Deteriorado", keynote: "Julgamento" },
  19: { gate: 19, name: "Aproximação", nameEn: "Approach", center: "root", iChing: "Aproximação", keynote: "Querer" },
  20: { gate: 20, name: "O Agora", nameEn: "The Now", center: "throat", iChing: "Contemplação", keynote: "Presença" },
  21: { gate: 21, name: "O Caçador", nameEn: "The Hunter", center: "heart", iChing: "Morder", keynote: "Controle" },
  22: { gate: 22, name: "Abertura", nameEn: "Openness", center: "solar", iChing: "Graça", keynote: "Graça" },
  23: { gate: 23, name: "Assimilação", nameEn: "Assimilation", center: "throat", iChing: "Desintegração", keynote: "Simplicidade" },
  24: { gate: 24, name: "Retorno", nameEn: "Return", center: "ajna", iChing: "Retorno", keynote: "Racionalização" },
  25: { gate: 25, name: "O Inocente", nameEn: "The Innocent", center: "g", iChing: "Inocência", keynote: "Amor Universal" },
  26: { gate: 26, name: "O Domador", nameEn: "The Taming Power of the Great", center: "heart", iChing: "Força Domadora do Grande", keynote: "Egoísmo" },
  27: { gate: 27, name: "Nutrir", nameEn: "Nourishment", center: "sacral", iChing: "Nutrição", keynote: "Cuidado" },
  28: { gate: 28, name: "O Jogador", nameEn: "The Game Player", center: "spleen", iChing: "Preponderância do Grande", keynote: "Luta" },
  29: { gate: 29, name: "Dizer Sim", nameEn: "Saying Yes", center: "sacral", iChing: "O Abismal", keynote: "Compromisso" },
  30: { gate: 30, name: "Sentimentos", nameEn: "Feelings", center: "solar", iChing: "Fogo", keynote: "Desejo" },
  31: { gate: 31, name: "Influência", nameEn: "Influence", center: "throat", iChing: "Influência", keynote: "Liderança" },
  32: { gate: 32, name: "Continuidade", nameEn: "Continuity", center: "spleen", iChing: "Duração", keynote: "Continuidade" },
  33: { gate: 33, name: "Privacidade", nameEn: "Privacy", center: "throat", iChing: "Retirada", keynote: "Retirada" },
  34: { gate: 34, name: "Poder", nameEn: "Power", center: "sacral", iChing: "O Poder do Grande", keynote: "Poder" },
  35: { gate: 35, name: "Mudança", nameEn: "Change", center: "throat", iChing: "Progresso", keynote: "Experiência" },
  36: { gate: 36, name: "Crise", nameEn: "Crisis", center: "solar", iChing: "Obscurecimento da Luz", keynote: "Inexperiência" },
  37: { gate: 37, name: "Amizade", nameEn: "Friendship", center: "solar", iChing: "A Família", keynote: "Família" },
  38: { gate: 38, name: "O Lutador", nameEn: "The Fighter", center: "root", iChing: "Oposição", keynote: "Teimosia" },
  39: { gate: 39, name: "Provocação", nameEn: "Provocation", center: "root", iChing: "Obstrução", keynote: "Provocação" },
  40: { gate: 40, name: "Sozinho", nameEn: "Aloneness", center: "heart", iChing: "Libertação", keynote: "Entrega" },
  41: { gate: 41, name: "Contração", nameEn: "Contraction", center: "root", iChing: "Diminuição", keynote: "Fantasia" },
  42: { gate: 42, name: "Crescimento", nameEn: "Growth", center: "sacral", iChing: "Aumento", keynote: "Crescimento" },
  43: { gate: 43, name: "Insight", nameEn: "Insight", center: "ajna", iChing: "Irromper", keynote: "Insight" },
  44: { gate: 44, name: "Padrões", nameEn: "Patterns", center: "spleen", iChing: "Vindo ao Encontro", keynote: "Alerta" },
  45: { gate: 45, name: "O Rei", nameEn: "The King", center: "throat", iChing: "Reunião", keynote: "Reunião" },
  46: { gate: 46, name: "A Determinação do Self", nameEn: "The Determination of the Self", center: "g", iChing: "Empurrar para Cima", keynote: "Amor ao Corpo" },
  47: { gate: 47, name: "Realização", nameEn: "Realization", center: "ajna", iChing: "Opressão", keynote: "Realização" },
  48: { gate: 48, name: "Profundidade", nameEn: "Depth", center: "spleen", iChing: "O Poço", keynote: "Profundidade" },
  49: { gate: 49, name: "Revolução", nameEn: "Revolution", center: "solar", iChing: "Revolução", keynote: "Princípios" },
  50: { gate: 50, name: "Valores", nameEn: "Values", center: "spleen", iChing: "O Caldeirão", keynote: "Valores" },
  51: { gate: 51, name: "Choque", nameEn: "Shock", center: "heart", iChing: "O Trovão", keynote: "Iniciação" },
  52: { gate: 52, name: "Inatividade", nameEn: "Inaction", center: "root", iChing: "A Montanha", keynote: "Quietude" },
  53: { gate: 53, name: "Começos", nameEn: "Beginnings", center: "root", iChing: "Desenvolvimento", keynote: "Começos" },
  54: { gate: 54, name: "Ambição", nameEn: "Ambition", center: "root", iChing: "A Moça que Casa", keynote: "Ambição" },
  55: { gate: 55, name: "Espírito", nameEn: "Spirit", center: "solar", iChing: "Abundância", keynote: "Espírito" },
  56: { gate: 56, name: "Estímulo", nameEn: "Stimulation", center: "throat", iChing: "O Viajante", keynote: "Estimulação" },
  57: { gate: 57, name: "A Penetração Suave", nameEn: "The Gentle", center: "spleen", iChing: "O Suave", keynote: "Intuição" },
  58: { gate: 58, name: "Alegria", nameEn: "Joy", center: "root", iChing: "O Alegre", keynote: "Vitalidade" },
  59: { gate: 59, name: "Sexualidade", nameEn: "Sexuality", center: "sacral", iChing: "Dispersão", keynote: "Intimidade" },
  60: { gate: 60, name: "Limitação", nameEn: "Limitation", center: "root", iChing: "Limitação", keynote: "Aceitação" },
  61: { gate: 61, name: "Mistério", nameEn: "Mystery", center: "head", iChing: "Verdade Interior", keynote: "Mistério" },
  62: { gate: 62, name: "Detalhe", nameEn: "Detail", center: "throat", iChing: "Preponderância do Pequeno", keynote: "Detalhes" },
  63: { gate: 63, name: "Dúvida", nameEn: "Doubt", center: "head", iChing: "Após a Conclusão", keynote: "Dúvida" },
  64: { gate: 64, name: "Confusão", nameEn: "Confusion", center: "head", iChing: "Antes da Conclusão", keynote: "Confusão" }
};

// Função para converter longitude eclíptica para Gate e Linha
export function longitudeToGate(longitude: number): { gate: number; line: number; color: number; tone: number; base: number } {
  // Normalizar longitude para 0-360
  let normalizedLong = longitude % 360;
  if (normalizedLong < 0) normalizedLong += 360;
  
  // Aplicar offset do Mandala (Gate 41 começa em ~58°)
  const adjustedLong = (normalizedLong - MANDALA_OFFSET + 360) % 360;
  
  // Calcular índice do gate na sequência
  const gateIndex = Math.floor(adjustedLong / DEGREES_PER_GATE);
  const gate = GATE_SEQUENCE[gateIndex % 64];
  
  // Calcular posição dentro do gate
  const withinGate = adjustedLong % DEGREES_PER_GATE;
  
  // Linha (1-6): cada gate tem 6 linhas
  const line = Math.min(Math.floor(withinGate / DEGREES_PER_LINE) + 1, 6);
  
  // Cor (1-6): subdivisão da linha
  const withinLine = withinGate % DEGREES_PER_LINE;
  const degreesPerColor = DEGREES_PER_LINE / 6;
  const color = Math.min(Math.floor(withinLine / degreesPerColor) + 1, 6);
  
  // Tom (1-6): subdivisão da cor
  const withinColor = withinLine % degreesPerColor;
  const degreesPerTone = degreesPerColor / 6;
  const tone = Math.min(Math.floor(withinColor / degreesPerTone) + 1, 6);
  
  // Base (1-5): subdivisão do tom
  const withinTone = withinColor % degreesPerTone;
  const degreesPerBase = degreesPerTone / 5;
  const base = Math.min(Math.floor(withinTone / degreesPerBase) + 1, 5);
  
  return { gate, line, color, tone, base };
}

// Obter informações de um gate específico
export function getGateInfo(gate: number): GateInfo | undefined {
  return GATES_DATA[gate];
}
