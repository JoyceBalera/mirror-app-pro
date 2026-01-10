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
    expected_type: "Gerador Manifestante",
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

// Demo Human Design result for preview (pre-calculated)
export const DEMO_HD_RESULT = {
  energy_type: "Gerador Manifestante",
  strategy: "Esperar para Responder e Informar",
  authority: "Sacral",
  profile: "3/5 - Mártir Herege",
  definition: "Split",
  incarnation_cross: "Cruz da Explicação",
  centers: {
    head: true,
    ajna: true,
    throat: true,
    g: false,
    heart: false,
    sacral: true,
    spleen: true,
    solar: false,
    root: true,
  },
  channels: [
    { gates: [34, 57], name: "Canal do Poder" },
    { gates: [20, 34], name: "Canal do Carisma" },
    { gates: [9, 52], name: "Canal da Concentração" },
  ],
  activated_gates: [1, 9, 10, 20, 34, 38, 48, 52, 57, 58, 63, 64],
  personality_activations: [
    { planet: "Sun", gate: 63, line: 4, color: 2, tone: 3 },
    { planet: "Earth", gate: 64, line: 4, color: 5, tone: 2 },
    { planet: "North Node", gate: 20, line: 3, color: 1, tone: 4 },
    { planet: "South Node", gate: 34, line: 3, color: 4, tone: 1 },
    { planet: "Moon", gate: 1, line: 2, color: 3, tone: 5 },
    { planet: "Mercury", gate: 10, line: 5, color: 2, tone: 3 },
    { planet: "Venus", gate: 58, line: 1, color: 6, tone: 2 },
    { planet: "Mars", gate: 38, line: 6, color: 1, tone: 4 },
    { planet: "Jupiter", gate: 48, line: 2, color: 5, tone: 6 },
    { planet: "Saturn", gate: 57, line: 4, color: 3, tone: 1 },
    { planet: "Uranus", gate: 9, line: 3, color: 4, tone: 5 },
    { planet: "Neptune", gate: 52, line: 1, color: 2, tone: 2 },
    { planet: "Pluto", gate: 34, line: 5, color: 6, tone: 3 },
  ],
  design_activations: [
    { planet: "Sun", gate: 34, line: 2, color: 1, tone: 4 },
    { planet: "Earth", gate: 20, line: 2, color: 4, tone: 1 },
    { planet: "North Node", gate: 57, line: 5, color: 2, tone: 6 },
    { planet: "South Node", gate: 9, line: 5, color: 5, tone: 3 },
    { planet: "Moon", gate: 52, line: 4, color: 3, tone: 2 },
    { planet: "Mercury", gate: 48, line: 1, color: 6, tone: 5 },
    { planet: "Venus", gate: 38, line: 3, color: 1, tone: 1 },
    { planet: "Mars", gate: 58, line: 2, color: 4, tone: 4 },
    { planet: "Jupiter", gate: 10, line: 6, color: 2, tone: 2 },
    { planet: "Saturn", gate: 1, line: 1, color: 5, tone: 6 },
    { planet: "Uranus", gate: 64, line: 2, color: 3, tone: 3 },
    { planet: "Neptune", gate: 63, line: 5, color: 6, tone: 1 },
    { planet: "Pluto", gate: 20, line: 4, color: 1, tone: 5 },
  ],
  birth_date: "1879-03-14",
  birth_time: "11:30",
  birth_location: "Ulm, Baden-Württemberg, Alemanha",
};
