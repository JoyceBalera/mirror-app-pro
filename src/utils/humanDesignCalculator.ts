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
  { name: 'Pluto', label: 'Plutão', symbol: '♇' },
];

// ===== FUNÇÕES DE CÁLCULO PLANETÁRIO =====

type TimeOfInterestType = ReturnType<typeof createTimeOfInterest.fromDate>;

async function getPlanetLongitude(planetName: string, toi: TimeOfInterestType): Promise<number> {
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
      longitude = calculateTrueNorthNode(toi);
      break;
    }
    case 'SouthNode': {
      longitude = (calculateTrueNorthNode(toi) + 180) % 360;
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
      longitude = await calculatePlutoGeocentricLongitude(toi);
      break;
    }
    default:
      throw new Error(`Planeta não suportado: ${planetName}`);
  }
  
  return longitude;
}

// Cálculo preciso do True North Node (Nodo Lunar Norte Verdadeiro)
// Baseado na fórmula astronômica de Jean Meeus (Astronomical Algorithms)
// CORREÇÃO: Usa F (argumento de latitude da Lua) nos termos periódicos, não Ω
function calculateTrueNorthNode(toi: TimeOfInterestType): number {
  const jd = toi.getJulianDay();
  const jd2000 = 2451545.0;
  const T = (jd - jd2000) / 36525.0;
  
  // Longitude média do Nodo Norte Ascendente (Meeus, Cap. 47)
  let omega = 125.0445479 
    - 1934.1362891 * T 
    + 0.0020754 * T * T 
    + (T * T * T) / 467441.0 
    - (T * T * T * T) / 60616000.0;
  
  // D = elongação média da Lua
  const D = 297.8501921 
    + 445267.1114034 * T 
    - 0.0018819 * T * T 
    + (T * T * T) / 545868.0 
    - (T * T * T * T) / 113065000.0;
  
  // M = anomalia média do Sol
  const M = 357.5291092 
    + 35999.0502909 * T 
    - 0.0001536 * T * T 
    + (T * T * T) / 24490000.0;
  
  // M' = anomalia média da Lua
  const Mprime = 134.9633964 
    + 477198.8675055 * T 
    + 0.0087414 * T * T 
    + (T * T * T) / 69699.0 
    - (T * T * T * T) / 14712000.0;
  
  // F = argumento de latitude média da Lua (FUNDAMENTAL para True Node!)
  const F = 93.2720950 
    + 483202.0175233 * T 
    - 0.0036539 * T * T 
    - (T * T * T) / 3526000.0 
    + (T * T * T * T) / 863310000.0;
  
  const deg2rad = Math.PI / 180;
  
  // Correções periódicas para converter Mean Node → True Node
  // Os termos usam F (argumento de latitude), NÃO Ω (omega)!
  // Fonte: Meeus, Astronomical Algorithms, Cap. 47
  const correction = 
    - 1.4979 * Math.sin(2 * (D - F) * deg2rad)
    - 0.1500 * Math.sin(M * deg2rad)
    - 0.1226 * Math.sin(2 * D * deg2rad)
    + 0.1176 * Math.sin(2 * F * deg2rad)
    - 0.0801 * Math.sin(2 * (Mprime - F) * deg2rad);
  
  omega += correction;
  
  // Normalizar para 0-360
  let result = omega % 360;
  if (result < 0) result += 360;
  
  return result;
}
// ===== CÁLCULO DE PLUTÃO (Meeus, Cap. 37, Tabela 37.A) =====

// Argumentos periódicos: [coeff_J, coeff_S, coeff_P]
const PLUTO_ARGUMENTS: [number, number, number][] = [
  [0,0,1],[0,0,2],[0,0,3],[0,0,4],[0,0,5],[0,0,6],
  [0,1,-1],[0,1,0],[0,1,1],[0,1,2],[0,1,3],
  [0,2,-2],[0,2,-1],[0,2,0],
  [1,-1,0],[1,-1,1],
  [1,0,-3],[1,0,-2],[1,0,-1],[1,0,0],[1,0,1],[1,0,2],[1,0,3],[1,0,4],
  [1,1,-3],[1,1,-2],[1,1,-1],[1,1,0],[1,1,1],[1,1,3],
  [2,0,-6],[2,0,-5],[2,0,-4],[2,0,-3],[2,0,-2],[2,0,-1],[2,0,0],[2,0,1],[2,0,2],[2,0,3],
  [3,0,-2],[3,0,-1],[3,0,0]
];

// Coeficientes de longitude: [sin_coeff, cos_coeff] em 10^-6 graus
const PLUTO_LON_COEFFS: [number, number][] = [
  [-19799805,19850055],[897144,-4954829],[611149,1211027],[-341243,-189585],
  [129287,-34992],[-38164,30893],[20442,-9987],[-4063,-5071],
  [-6016,-3336],[-3956,3039],[-667,3572],[1276,501],[1152,-917],[630,-1277],
  [2571,-459],[899,-1449],[-1016,1043],[-2343,-1012],[7042,788],
  [1199,-338],[418,-67],[120,-274],[-60,-159],[-82,-29],
  [-36,-29],[-40,7],[-14,22],[4,13],[5,2],[-1,0],
  [2,0],[-4,5],[4,-7],[14,24],[-49,-34],[163,-48],
  [9,-24],[-4,1],[-3,1],[1,3],[-3,-1],[5,-3],[0,0]
];

// Coeficientes de latitude: [sin_coeff, cos_coeff] em 10^-6 graus
const PLUTO_LAT_COEFFS: [number, number][] = [
  [-5452852,-14974862],[3527812,1672790],[-1050748,327647],[178690,-292153],
  [18650,100340],[-30697,-25823],[4878,11248],[226,-64],
  [2030,-836],[69,-604],[-247,-567],[-57,1],[-122,175],[-49,-164],
  [-197,199],[-25,217],[589,-248],[-269,711],[185,193],
  [315,807],[-130,-43],[5,3],[2,17],[2,5],
  [2,3],[3,1],[2,-1],[1,-1],[0,-1],[0,0],
  [0,-2],[2,2],[-7,0],[10,-8],[-3,20],[6,5],
  [14,17],[-2,0],[0,0],[0,0],[0,1],[0,0],[1,0]
];

// Coeficientes de raio vetor: [sin_coeff, cos_coeff] em 10^-7 AU
const PLUTO_RAD_COEFFS: [number, number][] = [
  [66865439,68951812],[-11827535,-332538],[1593179,-1438890],[-18444,483220],
  [-65977,-85431],[31174,-6032],[-5794,22161],[4601,4032],
  [-1729,234],[-415,702],[239,723],[67,-67],[1034,-451],[-129,504],
  [480,-231],[2,-441],[-3359,265],[7856,-7832],[36,45763],
  [8663,8547],[-809,-769],[263,-144],[-126,32],[-35,-16],
  [-19,-4],[-15,8],[-4,12],[5,6],[3,1],[6,-2],
  [2,2],[-2,-2],[14,13],[-63,13],[136,-236],[273,1065],
  [251,149],[-25,-9],[9,-2],[-8,7],[2,-10],[19,35],[10,3]
];

/**
 * Calcula a posição heliocêntrica de Plutão usando Meeus Cap. 37 (Tabela 37.A)
 * Válido para 1885-2099
 */
function calculatePlutoHeliocentric(T: number): { lon: number; lat: number; r: number } {
  const J = 34.35 + 3034.9057 * T;
  const S = 50.08 + 1222.1138 * T;
  const P = 238.96 + 144.96 * T;
  
  const deg2rad = Math.PI / 180;
  
  let corrLon = 0;
  let corrLat = 0;
  let corrRad = 0;
  
  for (let i = 0; i < PLUTO_ARGUMENTS.length; i++) {
    const [jc, sc, pc] = PLUTO_ARGUMENTS[i];
    const alpha = (jc * J + sc * S + pc * P) * deg2rad;
    const sinA = Math.sin(alpha);
    const cosA = Math.cos(alpha);
    
    corrLon += PLUTO_LON_COEFFS[i][0] * sinA + PLUTO_LON_COEFFS[i][1] * cosA;
    corrLat += PLUTO_LAT_COEFFS[i][0] * sinA + PLUTO_LAT_COEFFS[i][1] * cosA;
    corrRad += PLUTO_RAD_COEFFS[i][0] * sinA + PLUTO_RAD_COEFFS[i][1] * cosA;
  }
  
  const lon = 238.958116 + 144.96 * T + corrLon / 1000000;
  const lat = -3.908239 + corrLat / 1000000;
  const r = 40.7241346 + corrRad / 10000000;
  
  return { lon, lat, r };
}

/**
 * Calcula a longitude eclíptica geocêntrica de Plutão
 * Converte de heliocêntrica para geocêntrica usando a posição do Sol
 */
async function calculatePlutoGeocentricLongitude(toi: TimeOfInterestType): Promise<number> {
  const jd = toi.getJulianDay();
  const T = (jd - 2451545.0) / 36525.0;
  
  // Posição heliocêntrica de Plutão
  const pluto = calculatePlutoHeliocentric(T);
  const deg2rad = Math.PI / 180;
  const rad2deg = 180 / Math.PI;
  
  // Posição do Sol (geocêntrica) para obter a posição da Terra (heliocêntrica)
  const sun = createSun(toi);
  const sunCoords = await sun.getGeocentricEclipticSphericalDateCoordinates();
  
  // Longitude heliocêntrica da Terra = longitude geocêntrica do Sol + 180°
  const earthLon = (sunCoords.lon + 180) % 360;
  const earthR = 1.0; // ~1 AU (simplificação aceitável)
  
  // Converter coordenadas heliocêntricas de Plutão para cartesianas
  const plutoLonRad = pluto.lon * deg2rad;
  const plutoLatRad = pluto.lat * deg2rad;
  const xp = pluto.r * Math.cos(plutoLatRad) * Math.cos(plutoLonRad);
  const yp = pluto.r * Math.cos(plutoLatRad) * Math.sin(plutoLonRad);
  
  // Converter coordenadas heliocêntricas da Terra para cartesianas
  const earthLonRad = earthLon * deg2rad;
  const xe = earthR * Math.cos(earthLonRad);
  const ye = earthR * Math.sin(earthLonRad);
  
  // Vetor geocêntrico de Plutão
  const dx = xp - xe;
  const dy = yp - ye;
  
  // Longitude eclíptica geocêntrica
  let geoLon = Math.atan2(dy, dx) * rad2deg;
  if (geoLon < 0) geoLon += 360;
  
  return geoLon;
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

/**
 * Calcula a Design Date com precisão de minutos usando iteração por timestamp.
 * O Design é quando o Sol estava exatamente 88° antes da posição no nascimento.
 * Usa velocidade média do Sol (~0.985647°/dia) para convergir rapidamente.
 */
export async function calculateDesignDate(birthDate: Date): Promise<Date> {
  const toi = createTimeOfInterest.fromDate(birthDate);
  const sun = createSun(toi);
  const birthSunCoords = await sun.getGeocentricEclipticSphericalDateCoordinates();
  const birthSunLong = birthSunCoords.lon;
  
  // Longitude alvo = Sol nascimento - 88°
  const targetLong = (birthSunLong - 88 + 360) % 360;
  
  // Velocidade média do Sol: ~0.985647° por dia
  const SUN_DEGREES_PER_DAY = 0.985647;
  const MS_PER_DAY = 86400000;
  
  // Estimativa inicial: 88° / velocidade = ~89.27 dias antes
  let designTimestamp = birthDate.getTime() - (88 / SUN_DEGREES_PER_DAY) * MS_PER_DAY;
  
  // Refinamento iterativo usando timestamp (preserva hora/minuto)
  for (let i = 0; i < 15; i++) {
    const testDate = new Date(designTimestamp);
    const testToi = createTimeOfInterest.fromDate(testDate);
    const testSun = createSun(testToi);
    const testCoords = await testSun.getGeocentricEclipticSphericalDateCoordinates();
    const testLong = testCoords.lon;
    
    // Calcular diferença angular considerando wrap-around
    let diffDeg = targetLong - testLong;
    if (diffDeg > 180) diffDeg -= 360;
    if (diffDeg < -180) diffDeg += 360;
    
    // Se estamos próximos o suficiente (< 0.01° = ~15 minutos de precisão)
    if (Math.abs(diffDeg) < 0.01) break;
    
    // Converter diferença angular em fração de dia e ajustar timestamp
    const deltaDays = diffDeg / SUN_DEGREES_PER_DAY;
    designTimestamp += deltaDays * MS_PER_DAY;
  }
  
  return new Date(designTimestamp);
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

// Canais que conectam diretamente um motor ao Throat
const MOTOR_TO_THROAT_CHANNELS: string[] = [
  '21-45',  // Heart → Throat
  '12-22',  // Throat ↔ Solar (Abertura)
  '35-36',  // Throat ↔ Solar (Transitoriedade)
  '48-16',  // Spleen → Throat (Talento) - Spleen não é motor!
  '20-57',  // Throat ↔ Spleen - Spleen não é motor!
  '57-20',  // Mesmo canal
  // Canais Solar → Throat
  // Canais Root → Throat (não existem diretos)
  // Canais Sacral → Throat indiretos
];

function determineType(centers: CenterDefinition[], channels: ChannelActivation[]): { type: string; strategy: string } {
  const sacralCenter = centers.find(c => c.id === 'sacral');
  const throatCenter = centers.find(c => c.id === 'throat');
  
  const sacralDefined = sacralCenter?.defined ?? false;
  const throatDefined = throatCenter?.defined ?? false;
  
  const definedCenters = centers.filter(c => c.defined);
  const activeChannels = channels.filter(ch => ch.isComplete);
  
  // Reflector: Nenhum centro definido
  if (definedCenters.length === 0) {
    return { type: 'Refletor', strategy: 'Esperar um ciclo lunar (28 dias)' };
  }
  
  // Função para verificar se há caminho de um motor até o Throat através de canais ativos
  const hasMotorToThroatConnection = (): boolean => {
    // Centros motores: Root, Sacral, Solar Plexus, Heart/Ego
    const motorCenterIds = ['root', 'sacral', 'solar', 'heart'];
    
    // Para cada motor definido, verificar se há caminho até o Throat
    for (const motorId of motorCenterIds) {
      const motorCenter = centers.find(c => c.id === motorId);
      if (!motorCenter?.defined) continue;
      
      // BFS para encontrar caminho até o Throat
      const visited = new Set<string>();
      const queue: string[] = [motorId];
      
      while (queue.length > 0) {
        const currentCenterId = queue.shift()!;
        
        if (currentCenterId === 'throat') {
          return true;
        }
        
        if (visited.has(currentCenterId)) continue;
        visited.add(currentCenterId);
        
        // Encontrar centros conectados através de canais ativos
        for (const ch of activeChannels) {
          if (ch.centers[0] === currentCenterId && !visited.has(ch.centers[1])) {
            queue.push(ch.centers[1]);
          }
          if (ch.centers[1] === currentCenterId && !visited.has(ch.centers[0])) {
            queue.push(ch.centers[0]);
          }
        }
      }
    }
    
    return false;
  };
  
  // Verificar se motor está conectado ao Throat (direto ou indiretamente)
  const motorToThroat = hasMotorToThroatConnection();
  
  // Manifestor: Motor (NÃO Sacral) conectado ao Throat E Sacral NÃO definido
  // O motor pode ser: Heart, Solar, ou Root (mas não via Sacral)
  if (!sacralDefined && throatDefined && motorToThroat) {
    // Confirmar que a conexão não passa pelo Sacral
    // Um Manifestor tem motor conectado ao Throat SEM usar o Sacral
    return { type: 'Manifestor', strategy: 'Informar antes de agir' };
  }
  
  // Generator ou Manifesting Generator: Sacral definido
  if (sacralDefined) {
    // MG: Sacral definido E motor conectado ao Throat
    // O Sacral é um motor, então se há conexão do Sacral ao Throat = MG
    if (motorToThroat) {
      return { type: 'Gerador Manifestante', strategy: 'Responder e então informar' };
    }
    return { type: 'Gerador', strategy: 'Esperar para responder' };
  }
  
  // Projector: Tem centros definidos, mas não Sacral, e motor NÃO conectado ao Throat
  // Ou não tem motor definido
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
