// Human Design Calculator
// Usa astronomy-bundle para cálculos planetários
// Implementa conversão de longitude para Gates do Human Design

import { createTimeOfInterest } from 'astronomy-bundle/time';
import { createSun } from 'astronomy-bundle/sun';
import { createMoon } from 'astronomy-bundle/moon';
import { 
  createMercury, 
  createVenus, 
  createMars, 
  createJupiter, 
  createSaturn, 
  createUranus, 
  createNeptune
} from 'astronomy-bundle/planets';

import { longitudeToGate, GATES_DATA } from '@/data/humanDesignGates';
import { CENTERS, MOTOR_CENTERS, getGateCenter } from '@/data/humanDesignCenters';
import { CHANNELS, getActiveChannels } from '@/data/humanDesignChannels';

// ===== INTERFACES =====

export interface PlanetaryActivation {
  planet: string;
  planetLabel: string;
  longitude: number;
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
  gateInfo?: {
    name: string;
    center: string;
    keynote: string;
  };
}

export interface CenterDefinition {
  id: string;
  name: string;
  label: string;
  defined: boolean;
  gates: number[];
  activeGates: number[];
}

export interface ChannelActivation {
  id: string;
  gates: [number, number];
  name: string;
  centers: [string, string];
  isComplete: boolean;
}

export interface HumanDesignChart {
  // Dados de nascimento
  birthDate: Date;
  birthLocation: { lat: number; lon: number; name: string };
  designDate: Date;
  
  // Ativações planetárias
  personality: PlanetaryActivation[];  // Momento do nascimento (consciente)
  design: PlanetaryActivation[];       // 88° antes (inconsciente)
  
  // Síntese
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  
  // Estrutura
  centers: CenterDefinition[];
  channels: ChannelActivation[];
  allActivatedGates: number[];
}

// ===== PLANETAS PARA CÁLCULO =====

const PLANETS = [
  { name: 'Sun', label: 'Sol', symbol: '☉' },
  { name: 'Earth', label: 'Terra', symbol: '⊕' },
  { name: 'Moon', label: 'Lua', symbol: '☽' },
  { name: 'NorthNode', label: 'Nodo Norte', symbol: '☊' },
  { name: 'SouthNode', label: 'Nodo Sul', symbol: '☋' },
  { name: 'Mercury', label: 'Mercúrio', symbol: '☿' },
  { name: 'Venus', label: 'Vênus', symbol: '♀' },
  { name: 'Mars', label: 'Marte', symbol: '♂' },
  { name: 'Jupiter', label: 'Júpiter', symbol: '♃' },
  { name: 'Saturn', label: 'Saturno', symbol: '♄' },
  { name: 'Uranus', label: 'Urano', symbol: '♅' },
  { name: 'Neptune', label: 'Netuno', symbol: '♆' },
];

// ===== FUNÇÕES DE CÁLCULO PLANETÁRIO =====

async function getPlanetLongitude(planetName: string, toi: TimeOfInterest): Promise<number> {
  let longitude: number;
  
  switch (planetName) {
    case 'Sun': {
      const sun = createSun(toi);
      const coords = await sun.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Earth': {
      // Terra está sempre oposta ao Sol (180°)
      const sun = createSun(toi);
      const coords = await sun.getGeocentricEclipticSphericalDateCoordinates();
      longitude = (coords.lon + 180) % 360;
      break;
    }
    case 'Moon': {
      const moon = createMoon(toi);
      const coords = await moon.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'NorthNode': {
      // Aproximação do Nodo Lunar Norte
      longitude = calculateLunarNodeApprox(toi, 'north');
      break;
    }
    case 'SouthNode': {
      // Nodo Sul = Nodo Norte + 180°
      longitude = (calculateLunarNodeApprox(toi, 'north') + 180) % 360;
      break;
    }
    case 'Mercury': {
      const planet = createMercury(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Venus': {
      const planet = createVenus(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Mars': {
      const planet = createMars(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Jupiter': {
      const planet = createJupiter(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Saturn': {
      const planet = createSaturn(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Uranus': {
      const planet = createUranus(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Neptune': {
      const planet = createNeptune(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    case 'Pluto': {
      const planet = createPluto(toi);
      const coords = await planet.getGeocentricEclipticSphericalDateCoordinates();
      longitude = coords.lon;
      break;
    }
    default:
      throw new Error(`Planeta não suportado: ${planetName}`);
  }
  
  return longitude;
}

// Aproximação matemática do Nodo Lunar Norte
// Baseado no ciclo de 18.6 anos dos nodos
function calculateLunarNodeApprox(toi: TimeOfInterest, node: 'north' | 'south'): number {
  const jd = toi.getJulianDay();
  const jd2000 = 2451545.0; // J2000.0 epoch
  const daysSinceJ2000 = jd - jd2000;
  
  // O nodo lunar regride ~19.34° por ano
  // Época J2000: Nodo Norte em ~125.04°
  const initialNodeLong = 125.04;
  const yearsSinceJ2000 = daysSinceJ2000 / 365.25;
  const nodeLongitude = (initialNodeLong - (19.34 * yearsSinceJ2000)) % 360;
  
  // Normalizar para 0-360
  let result = nodeLongitude < 0 ? nodeLongitude + 360 : nodeLongitude;
  
  if (node === 'south') {
    result = (result + 180) % 360;
  }
  
  return result;
}

// ===== CÁLCULO DAS POSIÇÕES PLANETÁRIAS =====

export async function calculatePlanetaryPositions(date: Date): Promise<PlanetaryActivation[]> {
  const toi = createTimeOfInterest.fromDate(date);
  const activations: PlanetaryActivation[] = [];
  
  for (const planet of PLANETS) {
    try {
      const longitude = await getPlanetLongitude(planet.name, toi);
      const { gate, line, color, tone, base } = longitudeToGate(longitude);
      const gateData = GATES_DATA[gate];
      
      activations.push({
        planet: planet.name,
        planetLabel: planet.label,
        longitude,
        gate,
        line,
        color,
        tone,
        base,
        gateInfo: gateData ? {
          name: gateData.name,
          center: gateData.center,
          keynote: gateData.keynote
        } : undefined
      });
    } catch (error) {
      console.error(`Erro ao calcular ${planet.name}:`, error);
    }
  }
  
  return activations;
}

// ===== CÁLCULO DA DATA DO DESIGN =====

export async function calculateDesignDate(birthDate: Date): Promise<Date> {
  // O Design é calculado quando o Sol estava 88° antes da posição no nascimento
  // Aproximação: ~88-89 dias antes (Sol move ~1°/dia)
  
  const toi = createTimeOfInterest.fromDate(birthDate);
  const sun = createSun(toi);
  const birthSunCoords = await sun.getGeocentricEclipticSphericalDateCoordinates();
  const birthSunLong = birthSunCoords.lon;
  
  // Longitude alvo = Sol nascimento - 88°
  const targetLong = (birthSunLong - 88 + 360) % 360;
  
  // Estimativa inicial: ~88.5 dias antes
  let designDate = new Date(birthDate);
  designDate.setDate(designDate.getDate() - 88);
  
  // Refinamento iterativo (busca binária simplificada)
  for (let i = 0; i < 10; i++) {
    const testToi = createTimeOfInterest.fromDate(designDate);
    const testSun = createSun(testToi);
    const testCoords = await testSun.getGeocentricEclipticSphericalDateCoordinates();
    const testLong = testCoords.lon;
    
    // Calcular diferença considerando a volta do zodíaco
    let diff = targetLong - testLong;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    // Se estamos próximos o suficiente (< 0.1°), pare
    if (Math.abs(diff) < 0.1) break;
    
    // Ajustar: ~1 dia por grau
    const daysToAdjust = diff;
    designDate.setDate(designDate.getDate() + daysToAdjust);
  }
  
  return designDate;
}

// ===== DETERMINAÇÃO DOS CENTROS =====

function determineCenters(allActiveGates: number[], activeChannels: ChannelActivation[]): CenterDefinition[] {
  const centers: CenterDefinition[] = [];
  
  // Um centro só está definido se faz parte de um canal completo
  const gatesInCompleteChannels = new Set<number>();
  activeChannels.filter(ch => ch.isComplete).forEach(ch => {
    gatesInCompleteChannels.add(ch.gates[0]);
    gatesInCompleteChannels.add(ch.gates[1]);
  });
  
  for (const [centerId, centerData] of Object.entries(CENTERS)) {
    const activeGatesInCenter = centerData.gates.filter(g => gatesInCompleteChannels.has(g));
    
    centers.push({
      id: centerId,
      name: centerData.name,
      label: centerData.label,
      defined: activeGatesInCenter.length > 0,
      gates: centerData.gates,
      activeGates: allActiveGates.filter(g => centerData.gates.includes(g))
    });
  }
  
  return centers;
}

// ===== DETERMINAÇÃO DOS CANAIS =====

function determineChannels(allActiveGates: number[]): ChannelActivation[] {
  return CHANNELS.map(channel => ({
    id: channel.id,
    gates: channel.gates,
    name: channel.name,
    centers: channel.centers,
    isComplete: allActiveGates.includes(channel.gates[0]) && allActiveGates.includes(channel.gates[1])
  }));
}

// ===== DETERMINAÇÃO DO TIPO =====

function determineType(centers: CenterDefinition[], channels: ChannelActivation[]): { type: string; strategy: string } {
  const sacralCenter = centers.find(c => c.id === 'sacral');
  const throatCenter = centers.find(c => c.id === 'throat');
  
  const sacralDefined = sacralCenter?.defined ?? false;
  const throatDefined = throatCenter?.defined ?? false;
  
  const definedCenters = centers.filter(c => c.defined);
  const activeChannels = channels.filter(ch => ch.isComplete);
  
  // Reflector: Nenhum centro definido
  if (definedCenters.length === 0) {
    return { type: 'Reflector', strategy: 'Esperar um ciclo lunar (28 dias)' };
  }
  
  // Verificar se algum motor está conectado ao Throat
  const motorConnectedToThroat = activeChannels.some(ch => {
    const center1 = ch.centers[0];
    const center2 = ch.centers[1];
    const isMotor1 = MOTOR_CENTERS.includes(center1);
    const isMotor2 = MOTOR_CENTERS.includes(center2);
    const isThroat1 = center1 === 'throat';
    const isThroat2 = center2 === 'throat';
    
    return (isMotor1 && isThroat2) || (isMotor2 && isThroat1);
  });
  
  // Também verificar conexão indireta ao Throat
  const checkIndirectConnection = (startCenters: string[], targetCenter: string): boolean => {
    const visited = new Set<string>();
    const queue = [...startCenters];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === targetCenter) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      
      // Encontrar canais conectados a este centro
      activeChannels.forEach(ch => {
        if (ch.centers[0] === current && !visited.has(ch.centers[1])) {
          queue.push(ch.centers[1]);
        }
        if (ch.centers[1] === current && !visited.has(ch.centers[0])) {
          queue.push(ch.centers[0]);
        }
      });
    }
    return false;
  };
  
  const definedMotors = MOTOR_CENTERS.filter(motor => 
    centers.find(c => c.id === motor)?.defined
  );
  
  const motorToThroat = motorConnectedToThroat || 
    (definedMotors.length > 0 && checkIndirectConnection(definedMotors, 'throat'));
  
  // Manifestor: Motor conectado ao Throat SEM Sacral definido
  if (!sacralDefined && throatDefined && motorToThroat) {
    return { type: 'Manifestor', strategy: 'Informar antes de agir' };
  }
  
  // Generator ou Manifesting Generator: Sacral definido
  if (sacralDefined) {
    // MG: Sacral + motor conectado ao Throat
    if (motorToThroat) {
      return { type: 'Gerador Manifestante', strategy: 'Responder e então informar' };
    }
    return { type: 'Gerador', strategy: 'Esperar para responder' };
  }
  
  // Projector: Tem centros definidos, mas não Sacral
  return { type: 'Projetor', strategy: 'Esperar pelo convite' };
}

// ===== DETERMINAÇÃO DA AUTORIDADE =====

function determineAuthority(centers: CenterDefinition[], type: string): string {
  if (type === 'Reflector') {
    return 'Lunar';
  }
  
  // Ordem de prioridade para autoridade
  const authorityOrder: { center: string; authority: string }[] = [
    { center: 'solar', authority: 'Emocional' },
    { center: 'sacral', authority: 'Sacral' },
    { center: 'spleen', authority: 'Esplênica' },
    { center: 'heart', authority: 'Ego' },
    { center: 'g', authority: 'Auto-Projetada' },
    { center: 'ajna', authority: 'Mental' },
    { center: 'head', authority: 'Mental' }
  ];
  
  for (const { center, authority } of authorityOrder) {
    const centerData = centers.find(c => c.id === center);
    if (centerData?.defined) {
      // Projetores não podem ter Autoridade Sacral
      if (type === 'Projetor' && authority === 'Sacral') continue;
      return authority;
    }
  }
  
  return 'Sem Autoridade Interna';
}

// ===== DETERMINAÇÃO DO PERFIL =====

function determineProfile(personality: PlanetaryActivation[], design: PlanetaryActivation[]): string {
  const personalitySun = personality.find(p => p.planet === 'Sun');
  const designSun = design.find(p => p.planet === 'Sun');
  
  if (!personalitySun || !designSun) return '?/?';
  
  return `${personalitySun.line}/${designSun.line}`;
}

// ===== DETERMINAÇÃO DA DEFINIÇÃO =====

function determineDefinition(centers: CenterDefinition[], channels: ChannelActivation[]): string {
  const definedCenters = centers.filter(c => c.defined);
  const activeChannels = channels.filter(ch => ch.isComplete);
  
  if (definedCenters.length === 0) return 'Nenhuma';
  if (definedCenters.length === 1) return 'Única';
  
  // Construir grafo de conectividade
  const graph: Map<string, Set<string>> = new Map();
  
  // Inicializar nós
  definedCenters.forEach(c => graph.set(c.id, new Set()));
  
  // Adicionar arestas dos canais ativos
  activeChannels.forEach(ch => {
    const [center1, center2] = ch.centers;
    if (graph.has(center1) && graph.has(center2)) {
      graph.get(center1)!.add(center2);
      graph.get(center2)!.add(center1);
    }
  });
  
  // Contar componentes conectados usando BFS
  const visited = new Set<string>();
  let components = 0;
  
  for (const center of definedCenters) {
    if (visited.has(center.id)) continue;
    
    // BFS para marcar todos os conectados
    const queue = [center.id];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      
      const neighbors = graph.get(current);
      if (neighbors) {
        neighbors.forEach(n => {
          if (!visited.has(n)) queue.push(n);
        });
      }
    }
    components++;
  }
  
  switch (components) {
    case 1: return 'Única';
    case 2: return 'Dividida';
    case 3: return 'Tripla Dividida';
    case 4: return 'Quádrupla Dividida';
    default: return `${components}x Dividida`;
  }
}

// ===== CRUZ DA ENCARNAÇÃO =====

function calculateIncarnationCross(personality: PlanetaryActivation[], design: PlanetaryActivation[]): string {
  const pSun = personality.find(p => p.planet === 'Sun');
  const pEarth = personality.find(p => p.planet === 'Earth');
  const dSun = design.find(p => p.planet === 'Sun');
  const dEarth = design.find(p => p.planet === 'Earth');
  
  if (!pSun || !pEarth || !dSun || !dEarth) return 'Indefinida';
  
  // A Cruz é definida pelos 4 gates do Sol e Terra (Personalidade e Design)
  return `${pSun.gate}/${pEarth.gate} | ${dSun.gate}/${dEarth.gate}`;
}

// ===== FUNÇÃO PRINCIPAL =====

export async function calculateHumanDesignChart(
  birthDateTime: Date,
  location: { lat: number; lon: number; name: string }
): Promise<HumanDesignChart> {
  
  // 1. Calcular data do Design (88° solar arc antes)
  const designDate = await calculateDesignDate(birthDateTime);
  
  // 2. Calcular posições planetárias para ambas as datas
  const [personality, design] = await Promise.all([
    calculatePlanetaryPositions(birthDateTime),
    calculatePlanetaryPositions(designDate)
  ]);
  
  // 3. Coletar todos os gates únicos ativados
  const allGates = [...personality, ...design].map(a => a.gate);
  const uniqueGates = [...new Set(allGates)];
  
  // 4. Determinar canais ativos
  const channels = determineChannels(uniqueGates);
  
  // 5. Determinar centros definidos
  const centers = determineCenters(uniqueGates, channels);
  
  // 6. Calcular tipo, autoridade, etc.
  const { type, strategy } = determineType(centers, channels);
  const authority = determineAuthority(centers, type);
  const profile = determineProfile(personality, design);
  const definition = determineDefinition(centers, channels);
  const incarnationCross = calculateIncarnationCross(personality, design);
  
  return {
    birthDate: birthDateTime,
    birthLocation: location,
    designDate,
    personality,
    design,
    type,
    strategy,
    authority,
    profile,
    definition,
    incarnationCross,
    centers,
    channels,
    allActivatedGates: uniqueGates
  };
}
