// BodyGraph Map - Precise definitions from robxcodes/gethdchart-web
// Centers, Gates, and Channels with exact positions and SVG vectors

export interface CenterData {
  id: string;
  name: string;
  translate: string;
  size: { width: number; height: number };
  vector: string;
  color: string;
}

export interface GateData {
  gate: number;
  center: string;
  x: number;
  y: number;
  channel?: {
    x: number;
    y: number;
    length: number;
    rotate: number;
  };
}

export interface ChannelData {
  id: string;
  gates: [number, number];
}

// Standard colors for each center type
export const CENTER_COLORS = {
  head: '#F9E79F',      // Yellow - Head
  mind: '#82E0AA',      // Green - Ajna/Mind  
  throat: '#F5B041',    // Orange - Throat
  g: '#F9E79F',         // Yellow - G Center
  heart: '#F1948A',     // Pink - Heart/Will
  spleen: '#F5B041',    // Orange - Spleen
  esp: '#F5B041',       // Orange - Solar Plexus (ESP)
  sacral: '#F1948A',    // Pink - Sacral
  root: '#F5B041',      // Orange - Root
};

// Center definitions with precise SVG vectors
export const CENTERS: CenterData[] = [
  {
    id: 'head',
    name: 'Head',
    translate: '135, 0',
    size: { width: 63, height: 56 },
    vector: 'M31.5 0L63 56H0L31.5 0Z',
    color: CENTER_COLORS.head,
  },
  {
    id: 'mind',
    name: 'Ajna',
    translate: '135, 71',
    size: { width: 63, height: 56 },
    vector: 'M0 0H63L31.5 56L0 0Z',
    color: CENTER_COLORS.mind,
  },
  {
    id: 'throat',
    name: 'Throat',
    translate: '126, 140',
    size: { width: 80, height: 80 },
    vector: 'M40 0L80 40L40 80L0 40L40 0Z',
    color: CENTER_COLORS.throat,
  },
  {
    id: 'g',
    name: 'G Center',
    translate: '126, 248',
    size: { width: 80, height: 80 },
    vector: 'M40 0L80 40L40 80L0 40L40 0Z',
    color: CENTER_COLORS.g,
  },
  {
    id: 'heart',
    name: 'Heart',
    translate: '50, 241',
    size: { width: 64, height: 56 },
    vector: 'M0 28L32 0L64 28L32 56L0 28Z',
    color: CENTER_COLORS.heart,
  },
  {
    id: 'spleen',
    name: 'Spleen',
    translate: '16, 310',
    size: { width: 64, height: 56 },
    vector: 'M0 28L32 0L64 28L32 56L0 28Z',
    color: CENTER_COLORS.spleen,
  },
  {
    id: 'esp',
    name: 'Solar Plexus',
    translate: '252, 310',
    size: { width: 64, height: 56 },
    vector: 'M0 28L32 0L64 28L32 56L0 28Z',
    color: CENTER_COLORS.esp,
  },
  {
    id: 'sacral',
    name: 'Sacral',
    translate: '131, 374',
    size: { width: 70, height: 70 },
    vector: 'M0 0H70V70H0V0Z',
    color: CENTER_COLORS.sacral,
  },
  {
    id: 'root',
    name: 'Root',
    translate: '131, 482',
    size: { width: 70, height: 70 },
    vector: 'M0 0H70V70H0V0Z',
    color: CENTER_COLORS.root,
  },
];

// Gate definitions with positions and channel connections
export const GATES: GateData[] = [
  // Head Center Gates
  { gate: 64, center: 'head', x: 153, y: 44, channel: { x: 166, y: 55, length: 18, rotate: 90 } },
  { gate: 61, center: 'head', x: 173, y: 44, channel: { x: 186, y: 55, length: 18, rotate: 90 } },
  { gate: 63, center: 'head', x: 193, y: 44, channel: { x: 206, y: 55, length: 18, rotate: 90 } },
  
  // Mind/Ajna Center Gates
  { gate: 47, center: 'mind', x: 153, y: 83, channel: { x: 166, y: 72, length: 18, rotate: -90 } },
  { gate: 24, center: 'mind', x: 173, y: 83, channel: { x: 186, y: 72, length: 18, rotate: -90 } },
  { gate: 4, center: 'mind', x: 193, y: 83, channel: { x: 206, y: 72, length: 18, rotate: -90 } },
  { gate: 17, center: 'mind', x: 153, y: 115, channel: { x: 166, y: 126, length: 16, rotate: 90 } },
  { gate: 43, center: 'mind', x: 173, y: 115, channel: { x: 186, y: 126, length: 16, rotate: 90 } },
  { gate: 11, center: 'mind', x: 193, y: 115, channel: { x: 206, y: 126, length: 16, rotate: 90 } },
  
  // Throat Center Gates
  { gate: 62, center: 'throat', x: 153, y: 152, channel: { x: 166, y: 141, length: 16, rotate: -90 } },
  { gate: 23, center: 'throat', x: 173, y: 152, channel: { x: 186, y: 141, length: 16, rotate: -90 } },
  { gate: 56, center: 'throat', x: 193, y: 152, channel: { x: 206, y: 141, length: 16, rotate: -90 } },
  { gate: 16, center: 'throat', x: 133, y: 172, channel: { x: 127, y: 180, length: 23, rotate: -148 } },
  { gate: 20, center: 'throat', x: 153, y: 192, channel: { x: 153, y: 207, length: 37, rotate: -160 } },
  { gate: 31, center: 'throat', x: 133, y: 192, channel: { x: 135, y: 207, length: 42, rotate: 180 } },
  { gate: 8, center: 'throat', x: 173, y: 207, channel: { x: 186, y: 218, length: 32, rotate: 90 } },
  { gate: 33, center: 'throat', x: 193, y: 192, channel: { x: 208, y: 207, length: 42, rotate: 180 } },
  { gate: 35, center: 'throat', x: 213, y: 172, channel: { x: 227, y: 183, length: 55, rotate: 150 } },
  { gate: 12, center: 'throat', x: 213, y: 192, channel: { x: 227, y: 203, length: 47, rotate: 135 } },
  { gate: 45, center: 'throat', x: 153, y: 172, channel: { x: 153, y: 186, length: 55, rotate: -155 } },
  
  // G Center Gates
  { gate: 1, center: 'g', x: 173, y: 260, channel: { x: 186, y: 249, length: 32, rotate: -90 } },
  { gate: 7, center: 'g', x: 133, y: 280, channel: { x: 135, y: 266, length: 59, rotate: 0 } },
  { gate: 13, center: 'g', x: 213, y: 280, channel: { x: 208, y: 266, length: 59, rotate: 0 } },
  { gate: 10, center: 'g', x: 153, y: 300, channel: { x: 153, y: 280, length: 73, rotate: -27 } },
  { gate: 15, center: 'g', x: 173, y: 316, channel: { x: 186, y: 327, length: 49, rotate: 90 } },
  { gate: 46, center: 'g', x: 133, y: 300, channel: { x: 127, y: 307, length: 28, rotate: 32 } },
  { gate: 2, center: 'g', x: 193, y: 300, channel: { x: 210, y: 307, length: 28, rotate: -32 } },
  { gate: 25, center: 'g', x: 213, y: 300, channel: { x: 227, y: 287, length: 50, rotate: -35 } },
  
  // Heart Center Gates
  { gate: 26, center: 'heart', x: 75, y: 253, channel: { x: 96, y: 253, length: 31, rotate: -50 } },
  { gate: 51, center: 'heart', x: 95, y: 253, channel: { x: 110, y: 249, length: 26, rotate: -25 } },
  { gate: 21, center: 'heart', x: 75, y: 273, channel: { x: 100, y: 271, length: 55, rotate: -22 } },
  { gate: 40, center: 'heart', x: 95, y: 285, channel: { x: 87, y: 297, length: 26, rotate: 63 } },
  
  // Spleen Center Gates  
  { gate: 48, center: 'spleen', x: 33, y: 322, channel: { x: 50, y: 315, length: 80, rotate: -58 } },
  { gate: 57, center: 'spleen', x: 53, y: 322, channel: { x: 66, y: 322, length: 67, rotate: -90 } },
  { gate: 44, center: 'spleen', x: 73, y: 322, channel: { x: 80, y: 314, length: 27, rotate: -58 } },
  { gate: 50, center: 'spleen', x: 33, y: 342, channel: { x: 27, y: 350, length: 67, rotate: 45 } },
  { gate: 32, center: 'spleen', x: 53, y: 354, channel: { x: 66, y: 364, length: 67, rotate: 90 } },
  { gate: 28, center: 'spleen', x: 73, y: 342, channel: { x: 86, y: 355, length: 33, rotate: 65 } },
  { gate: 18, center: 'spleen', x: 33, y: 362, channel: { x: 45, y: 408, length: 66, rotate: 60 } },
  
  // Solar Plexus (ESP) Center Gates
  { gate: 36, center: 'esp', x: 269, y: 322, channel: { x: 270, y: 310, length: 70, rotate: -35 } },
  { gate: 22, center: 'esp', x: 289, y: 322, channel: { x: 287, y: 308, length: 80, rotate: -55 } },
  { gate: 37, center: 'esp', x: 269, y: 342, channel: { x: 258, y: 333, length: 55, rotate: 20 } },
  { gate: 6, center: 'esp', x: 289, y: 342, channel: { x: 300, y: 355, length: 33, rotate: -65 } },
  { gate: 49, center: 'esp', x: 269, y: 362, channel: { x: 260, y: 355, length: 67, rotate: 45 } },
  { gate: 55, center: 'esp', x: 289, y: 362, channel: { x: 300, y: 372, length: 67, rotate: -90 } },
  { gate: 30, center: 'esp', x: 309, y: 342, channel: { x: 295, y: 408, length: 66, rotate: -60 } },
  
  // Sacral Center Gates
  { gate: 34, center: 'sacral', x: 133, y: 386, channel: { x: 127, y: 378, length: 73, rotate: -153 } },
  { gate: 5, center: 'sacral', x: 153, y: 386, channel: { x: 166, y: 375, length: 49, rotate: -90 } },
  { gate: 14, center: 'sacral', x: 193, y: 386, channel: { x: 206, y: 375, length: 49, rotate: -90 } },
  { gate: 29, center: 'sacral', x: 213, y: 386, channel: { x: 217, y: 377, length: 30, rotate: -63 } },
  { gate: 27, center: 'sacral', x: 133, y: 406, channel: { x: 123, y: 418, length: 41, rotate: 45 } },
  { gate: 59, center: 'sacral', x: 153, y: 418, channel: { x: 163, y: 432, length: 45, rotate: 72 } },
  { gate: 9, center: 'sacral', x: 173, y: 432, channel: { x: 186, y: 443, length: 41, rotate: 90 } },
  { gate: 3, center: 'sacral', x: 193, y: 418, channel: { x: 176, y: 432, length: 45, rotate: -72 } },
  { gate: 42, center: 'sacral', x: 213, y: 406, channel: { x: 220, y: 418, length: 41, rotate: -45 } },
  
  // Root Center Gates
  { gate: 53, center: 'root', x: 133, y: 494, channel: { x: 123, y: 482, length: 41, rotate: -45 } },
  { gate: 60, center: 'root', x: 153, y: 494, channel: { x: 163, y: 480, length: 45, rotate: -72 } },
  { gate: 52, center: 'root', x: 173, y: 480, channel: { x: 186, y: 469, length: 41, rotate: -90 } },
  { gate: 19, center: 'root', x: 193, y: 494, channel: { x: 176, y: 480, length: 45, rotate: 72 } },
  { gate: 39, center: 'root', x: 213, y: 494, channel: { x: 220, y: 482, length: 41, rotate: 45 } },
  { gate: 58, center: 'root', x: 133, y: 518, channel: { x: 120, y: 518, length: 67, rotate: -135 } },
  { gate: 38, center: 'root', x: 153, y: 530, channel: { x: 163, y: 544, length: 67, rotate: -90 } },
  { gate: 54, center: 'root', x: 193, y: 530, channel: { x: 176, y: 544, length: 67, rotate: 90 } },
  { gate: 41, center: 'root', x: 213, y: 518, channel: { x: 220, y: 518, length: 67, rotate: 135 } },
];

// Channel definitions - pairs of gates that form channels
export const CHANNELS: ChannelData[] = [
  // Head to Mind
  { id: '64-47', gates: [64, 47] },
  { id: '61-24', gates: [61, 24] },
  { id: '63-4', gates: [63, 4] },
  
  // Mind to Throat
  { id: '17-62', gates: [17, 62] },
  { id: '43-23', gates: [43, 23] },
  { id: '11-56', gates: [11, 56] },
  
  // Throat to G
  { id: '31-7', gates: [31, 7] },
  { id: '8-1', gates: [8, 1] },
  { id: '33-13', gates: [33, 13] },
  
  // Throat to other centers
  { id: '20-34', gates: [20, 34] },
  { id: '20-57', gates: [20, 57] },
  { id: '20-10', gates: [20, 10] },
  { id: '16-48', gates: [16, 48] },
  { id: '35-36', gates: [35, 36] },
  { id: '12-22', gates: [12, 22] },
  { id: '45-21', gates: [45, 21] },
  
  // G to Sacral
  { id: '15-5', gates: [15, 5] },
  { id: '2-14', gates: [2, 14] },
  { id: '46-29', gates: [46, 29] },
  
  // Heart connections
  { id: '26-44', gates: [26, 44] },
  { id: '51-25', gates: [51, 25] },
  { id: '21-45', gates: [21, 45] },
  { id: '40-37', gates: [40, 37] },
  
  // Spleen to Root
  { id: '32-54', gates: [32, 54] },
  { id: '28-38', gates: [28, 38] },
  { id: '18-58', gates: [18, 58] },
  { id: '50-27', gates: [50, 27] },
  { id: '57-34', gates: [57, 34] },
  { id: '44-26', gates: [44, 26] },
  { id: '48-16', gates: [48, 16] },
  
  // ESP connections
  { id: '6-59', gates: [6, 59] },
  { id: '37-40', gates: [37, 40] },
  { id: '36-35', gates: [36, 35] },
  { id: '22-12', gates: [22, 12] },
  { id: '49-19', gates: [49, 19] },
  { id: '55-39', gates: [55, 39] },
  { id: '30-41', gates: [30, 41] },
  
  // Sacral to Root
  { id: '53-42', gates: [53, 42] },
  { id: '60-3', gates: [60, 3] },
  { id: '52-9', gates: [52, 9] },
  { id: '19-49', gates: [19, 49] },
  { id: '39-55', gates: [39, 55] },
  { id: '41-30', gates: [41, 30] },
  
  // Additional channels
  { id: '10-34', gates: [10, 34] },
  { id: '10-57', gates: [10, 57] },
  { id: '25-51', gates: [25, 51] },
  { id: '29-46', gates: [29, 46] },
  { id: '59-6', gates: [59, 6] },
  { id: '27-50', gates: [27, 50] },
  { id: '3-60', gates: [3, 60] },
  { id: '9-52', gates: [9, 52] },
  { id: '42-53', gates: [42, 53] },
  { id: '38-28', gates: [38, 28] },
  { id: '54-32', gates: [54, 32] },
  { id: '58-18', gates: [58, 18] },
];

// Helper function to get gate data
export function getGateData(gateNumber: number): GateData | undefined {
  return GATES.find(g => g.gate === gateNumber);
}

// Helper function to get center data
export function getCenterData(centerId: string): CenterData | undefined {
  // Map from our IDs to robxcodes IDs
  const idMap: Record<string, string> = {
    'ajna': 'mind',
    'solar': 'esp',
    'solarplexus': 'esp',
  };
  const mappedId = idMap[centerId.toLowerCase()] || centerId.toLowerCase();
  return CENTERS.find(c => c.id === mappedId);
}

// Helper function to find channel by gates
export function findChannelByGates(gate1: number, gate2: number): ChannelData | undefined {
  return CHANNELS.find(
    ch => (ch.gates[0] === gate1 && ch.gates[1] === gate2) || 
          (ch.gates[0] === gate2 && ch.gates[1] === gate1)
  );
}

// Map center IDs from our system to robxcodes system
export function mapCenterId(centerId: string): string {
  const idMap: Record<string, string> = {
    'ajna': 'mind',
    'solar': 'esp',
    'solarplexus': 'esp',
  };
  return idMap[centerId.toLowerCase()] || centerId.toLowerCase();
}
