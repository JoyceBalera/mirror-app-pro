// Pre-defined profiles for Human Design demo testing
export interface DemoProfile {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  expected_type: string;
  description: string;
}

export const DEMO_PROFILES: Record<string, DemoProfile> = {
  einstein: {
    name: "Albert Einstein",
    birth_date: "1879-03-14",
    birth_time: "11:30",
    birth_location: "Ulm, Baden-Württemberg, Alemanha",
    expected_type: "Gerador", // Validated against humandesignforsuccess.com
    description: "Físico teórico, desenvolvedor da Teoria da Relatividade",
  },
  exemplo_br: {
    name: "Exemplo Brasileiro",
    birth_date: "1990-08-15",
    birth_time: "08:45",
    birth_location: "São Paulo, SP, Brasil",
    expected_type: "Projetor",
    description: "Perfil de teste com data brasileira recente",
  },
  manifestor: {
    name: "Exemplo Manifestor",
    birth_date: "1985-01-20",
    birth_time: "14:30",
    birth_location: "Rio de Janeiro, RJ, Brasil",
    expected_type: "Manifestor",
    description: "Perfil para testar tipo Manifestor",
  },
  generator: {
    name: "Exemplo Gerador",
    birth_date: "1992-06-10",
    birth_time: "06:15",
    birth_location: "Belo Horizonte, MG, Brasil",
    expected_type: "Gerador",
    description: "Perfil para testar tipo Gerador puro",
  },
  reflector: {
    name: "Exemplo Reflector",
    birth_date: "1988-12-21",
    birth_time: "23:55",
    birth_location: "Porto Alegre, RS, Brasil",
    expected_type: "Reflector",
    description: "Perfil para testar tipo Reflector (raro)",
  },
};

// Demo Human Design result for preview 
// UPDATED: Based on actual calculation validation (Einstein chart)
// Reference: humandesignforsuccess.com/albert-einstein/
export const DEMO_HD_RESULT = {
  energy_type: "Gerador",
  strategy: "Esperar para Responder",
  authority: "Emocional",
  profile: "1/4 - Investigador Oportunista",
  definition: "Dividida",
  incarnation_cross: "Cruz do Éden",
  centers: {
    head: false,
    ajna: false,
    throat: false,
    g: true,
    heart: true,
    sacral: true,
    spleen: false,
    solar: true,
    root: true,
  },
  channels: [
    { gates: [25, 51], name: "Canal da Iniciação" },
    { gates: [30, 41], name: "Canal da Fantasia" },
    { gates: [6, 59], name: "Canal da Intimidade" },
  ],
  activated_gates: [5, 6, 10, 11, 12, 14, 17, 24, 25, 27, 30, 31, 36, 38, 41, 46, 51, 59, 60],
  personality_activations: [
    { planet: "Sun", gate: 36, line: 1, color: 2, tone: 3 },
    { planet: "Earth", gate: 6, line: 1, color: 5, tone: 2 },
    { planet: "Moon", gate: 5, line: 4, color: 1, tone: 4 },
    { planet: "North Node", gate: 41, line: 1, color: 4, tone: 1 },
    { planet: "South Node", gate: 31, line: 1, color: 3, tone: 5 },
    { planet: "Mercury", gate: 25, line: 6, color: 2, tone: 3 },
    { planet: "Venus", gate: 51, line: 2, color: 6, tone: 2 },
    { planet: "Mars", gate: 60, line: 1, color: 1, tone: 4 },
    { planet: "Jupiter", gate: 30, line: 4, color: 5, tone: 6 },
    { planet: "Saturn", gate: 17, line: 1, color: 3, tone: 1 },
    { planet: "Uranus", gate: 59, line: 2, color: 4, tone: 5 },
    { planet: "Neptune", gate: 24, line: 1, color: 2, tone: 2 },
  ],
  design_activations: [
    { planet: "Sun", gate: 11, line: 4, color: 1, tone: 4 },
    { planet: "Earth", gate: 12, line: 4, color: 4, tone: 1 },
    { planet: "Moon", gate: 46, line: 3, color: 2, tone: 6 },
    { planet: "North Node", gate: 41, line: 6, color: 5, tone: 3 },
    { planet: "South Node", gate: 31, line: 6, color: 3, tone: 2 },
    { planet: "Mercury", gate: 38, line: 3, color: 6, tone: 5 },
    { planet: "Venus", gate: 10, line: 1, color: 1, tone: 1 },
    { planet: "Mars", gate: 14, line: 1, color: 4, tone: 4 },
    { planet: "Jupiter", gate: 41, line: 6, color: 2, tone: 2 },
    { planet: "Saturn", gate: 36, line: 5, color: 5, tone: 6 },
    { planet: "Uranus", gate: 59, line: 5, color: 3, tone: 3 },
    { planet: "Neptune", gate: 27, line: 6, color: 6, tone: 1 },
  ],
  birth_date: "1879-03-14",
  birth_time: "11:30",
  birth_location: "Ulm, Baden-Württemberg, Alemanha",
};
