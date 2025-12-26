import { useMemo } from "react";
import { CENTERS } from "@/data/humanDesignCenters";

interface BodyGraphProps {
  definedCenters: string[];
  activeChannels: { id: string; gates: number[]; isComplete: boolean }[];
  activatedGates: number[];
  personalityGates: number[];
  designGates: number[];
}

// Cores padrão do Human Design
const PERSONALITY_COLOR = "#1a1a1a"; // Preto para Personality (consciente)
const DESIGN_COLOR = "#C41E3A"; // Vermelho para Design (inconsciente)
const BOTH_COLOR = "#7B192B"; // Marrom-avermelhado para ambos
const UNDEFINED_COLOR = "#FFFFFF"; // Branco para centros indefinidos
const DEFINED_COLOR = "#D4A574"; // Tan para centros definidos
const STROKE_COLOR = "#333333";
const CHANNEL_UNDEFINED_COLOR = "#E5E5E5";

// Posições precisas dos centros no SVG
const CENTER_POSITIONS: Record<string, { x: number; y: number }> = {
  head: { x: 250, y: 55 },
  ajna: { x: 250, y: 120 },
  throat: { x: 250, y: 195 },
  g: { x: 250, y: 310 },
  heart: { x: 165, y: 280 },
  spleen: { x: 100, y: 370 },
  sacral: { x: 250, y: 420 },
  solar: { x: 340, y: 370 },
  root: { x: 250, y: 520 },
};

// Gates por posição em cada centro (para exibir os números)
const GATE_POSITIONS: Record<string, { gate: number; x: number; y: number }[]> = {
  head: [
    { gate: 64, x: 230, y: 30 },
    { gate: 61, x: 250, y: 30 },
    { gate: 63, x: 270, y: 30 },
  ],
  ajna: [
    { gate: 47, x: 218, y: 100 },
    { gate: 24, x: 238, y: 100 },
    { gate: 4, x: 258, y: 100 },
    { gate: 17, x: 218, y: 138 },
    { gate: 43, x: 250, y: 148 },
    { gate: 11, x: 282, y: 138 },
  ],
  throat: [
    { gate: 62, x: 198, y: 175 },
    { gate: 23, x: 230, y: 172 },
    { gate: 56, x: 270, y: 172 },
    { gate: 35, x: 295, y: 183 },
    { gate: 12, x: 300, y: 205 },
    { gate: 16, x: 198, y: 195 },
    { gate: 20, x: 215, y: 215 },
    { gate: 8, x: 250, y: 210 },
    { gate: 33, x: 285, y: 215 },
    { gate: 31, x: 240, y: 225 },
    { gate: 45, x: 196, y: 220 },
  ],
  g: [
    { gate: 7, x: 235, y: 285 },
    { gate: 1, x: 265, y: 285 },
    { gate: 13, x: 275, y: 305 },
    { gate: 25, x: 280, y: 325 },
    { gate: 46, x: 260, y: 340 },
    { gate: 2, x: 240, y: 340 },
    { gate: 15, x: 220, y: 325 },
    { gate: 10, x: 225, y: 305 },
  ],
  heart: [
    { gate: 21, x: 152, y: 260 },
    { gate: 51, x: 175, y: 260 },
    { gate: 26, x: 155, y: 290 },
    { gate: 40, x: 175, y: 295 },
  ],
  spleen: [
    { gate: 48, x: 78, y: 345 },
    { gate: 57, x: 98, y: 345 },
    { gate: 44, x: 118, y: 355 },
    { gate: 50, x: 82, y: 375 },
    { gate: 32, x: 85, y: 395 },
    { gate: 28, x: 105, y: 390 },
    { gate: 18, x: 118, y: 380 },
  ],
  sacral: [
    { gate: 5, x: 225, y: 400 },
    { gate: 14, x: 245, y: 395 },
    { gate: 29, x: 265, y: 400 },
    { gate: 59, x: 285, y: 410 },
    { gate: 9, x: 225, y: 430 },
    { gate: 3, x: 245, y: 435 },
    { gate: 42, x: 265, y: 430 },
    { gate: 27, x: 210, y: 415 },
    { gate: 34, x: 208, y: 395 },
  ],
  solar: [
    { gate: 36, x: 318, y: 350 },
    { gate: 22, x: 340, y: 345 },
    { gate: 37, x: 360, y: 355 },
    { gate: 6, x: 320, y: 375 },
    { gate: 49, x: 340, y: 385 },
    { gate: 55, x: 362, y: 378 },
    { gate: 30, x: 365, y: 395 },
  ],
  root: [
    { gate: 53, x: 220, y: 498 },
    { gate: 60, x: 240, y: 498 },
    { gate: 52, x: 260, y: 498 },
    { gate: 19, x: 295, y: 510 },
    { gate: 39, x: 315, y: 525 },
    { gate: 41, x: 330, y: 540 },
    { gate: 58, x: 175, y: 540 },
    { gate: 38, x: 188, y: 525 },
    { gate: 54, x: 205, y: 510 },
  ],
};

// Canais com paths de conexão
const CHANNEL_PATHS: Record<string, { from: string; to: string; path: string }> = {
  '64-47': { from: 'head', to: 'ajna', path: 'M235,70 L230,95' },
  '61-24': { from: 'head', to: 'ajna', path: 'M250,70 L250,95' },
  '63-4': { from: 'head', to: 'ajna', path: 'M265,70 L268,95' },
  '17-62': { from: 'ajna', to: 'throat', path: 'M225,140 L205,165' },
  '43-23': { from: 'ajna', to: 'throat', path: 'M250,145 L250,170' },
  '11-56': { from: 'ajna', to: 'throat', path: 'M275,140 L285,165' },
  '16-48': { from: 'throat', to: 'spleen', path: 'M200,200 C150,280 110,320 100,345' },
  '20-57': { from: 'throat', to: 'spleen', path: 'M210,210 C140,280 100,320 95,345' },
  '20-34': { from: 'throat', to: 'sacral', path: 'M215,220 L210,395' },
  '20-10': { from: 'throat', to: 'g', path: 'M220,220 L225,285' },
  '31-7': { from: 'throat', to: 'g', path: 'M240,225 L235,285' },
  '8-1': { from: 'throat', to: 'g', path: 'M250,220 L250,285' },
  '33-13': { from: 'throat', to: 'g', path: 'M280,220 L275,290' },
  '45-21': { from: 'throat', to: 'heart', path: 'M198,218 L160,255' },
  '12-22': { from: 'throat', to: 'solar', path: 'M295,210 L325,345' },
  '35-36': { from: 'throat', to: 'solar', path: 'M290,190 L318,345' },
  '26-44': { from: 'heart', to: 'spleen', path: 'M155,295 L120,355' },
  '40-37': { from: 'heart', to: 'solar', path: 'M180,295 C220,330 280,340 340,360' },
  '51-25': { from: 'heart', to: 'g', path: 'M175,265 L250,300' },
  '10-34': { from: 'g', to: 'sacral', path: 'M225,330 L210,395' },
  '10-57': { from: 'g', to: 'spleen', path: 'M220,320 C160,350 120,360 100,365' },
  '15-5': { from: 'g', to: 'sacral', path: 'M230,340 L230,395' },
  '46-29': { from: 'g', to: 'sacral', path: 'M250,345 L260,395' },
  '2-14': { from: 'g', to: 'sacral', path: 'M245,345 L248,390' },
  '57-20': { from: 'spleen', to: 'throat', path: 'M95,345 C100,320 140,280 210,210' },
  '57-34': { from: 'spleen', to: 'sacral', path: 'M100,370 C150,390 180,400 210,405' },
  '44-26': { from: 'spleen', to: 'heart', path: 'M120,355 L155,295' },
  '50-27': { from: 'spleen', to: 'sacral', path: 'M90,385 C150,400 180,410 210,415' },
  '32-54': { from: 'spleen', to: 'root', path: 'M90,400 L205,505' },
  '28-38': { from: 'spleen', to: 'root', path: 'M105,395 L190,520' },
  '18-58': { from: 'spleen', to: 'root', path: 'M115,390 L180,530' },
  '48-16': { from: 'spleen', to: 'throat', path: 'M85,350 C100,320 150,280 200,200' },
  '34-57': { from: 'sacral', to: 'spleen', path: 'M210,405 C180,400 150,390 100,370' },
  '34-10': { from: 'sacral', to: 'g', path: 'M210,395 L225,330' },
  '5-15': { from: 'sacral', to: 'g', path: 'M230,395 L230,340' },
  '14-2': { from: 'sacral', to: 'g', path: 'M248,390 L245,345' },
  '29-46': { from: 'sacral', to: 'g', path: 'M260,395 L250,345' },
  '27-50': { from: 'sacral', to: 'spleen', path: 'M210,415 C180,410 150,400 90,385' },
  '59-6': { from: 'sacral', to: 'solar', path: 'M285,415 L320,375' },
  '42-53': { from: 'sacral', to: 'root', path: 'M260,445 L250,490' },
  '3-60': { from: 'sacral', to: 'root', path: 'M250,445 L245,490' },
  '9-52': { from: 'sacral', to: 'root', path: 'M240,445 L255,490' },
  '6-59': { from: 'solar', to: 'sacral', path: 'M320,375 L285,415' },
  '37-40': { from: 'solar', to: 'heart', path: 'M340,360 C280,340 220,330 180,295' },
  '22-12': { from: 'solar', to: 'throat', path: 'M325,345 L295,210' },
  '36-35': { from: 'solar', to: 'throat', path: 'M318,345 L290,190' },
  '49-19': { from: 'solar', to: 'root', path: 'M350,390 L300,515' },
  '55-39': { from: 'solar', to: 'root', path: 'M365,385 L320,530' },
  '30-41': { from: 'solar', to: 'root', path: 'M368,400 L335,545' },
  '53-42': { from: 'root', to: 'sacral', path: 'M250,490 L260,445' },
  '60-3': { from: 'root', to: 'sacral', path: 'M245,490 L250,445' },
  '52-9': { from: 'root', to: 'sacral', path: 'M255,490 L240,445' },
  '54-32': { from: 'root', to: 'spleen', path: 'M205,505 L90,400' },
  '38-28': { from: 'root', to: 'spleen', path: 'M190,520 L105,395' },
  '58-18': { from: 'root', to: 'spleen', path: 'M180,530 L115,390' },
  '19-49': { from: 'root', to: 'solar', path: 'M300,515 L350,390' },
  '39-55': { from: 'root', to: 'solar', path: 'M320,530 L365,385' },
  '41-30': { from: 'root', to: 'solar', path: 'M335,545 L368,400' },
};

const BodyGraph = ({ 
  definedCenters, 
  activeChannels, 
  activatedGates,
  personalityGates,
  designGates 
}: BodyGraphProps) => {
  
  const completeChannels = useMemo(() => {
    return activeChannels.filter(ch => ch.isComplete).map(ch => ch.id);
  }, [activeChannels]);

  // Determina a cor do gate baseado em Personality vs Design
  const getGateColor = (gate: number): { fill: string; type: 'personality' | 'design' | 'both' | 'none' } => {
    const isPersonality = personalityGates.includes(gate);
    const isDesign = designGates.includes(gate);
    
    if (isPersonality && isDesign) return { fill: BOTH_COLOR, type: 'both' };
    if (isDesign) return { fill: DESIGN_COLOR, type: 'design' };
    if (isPersonality) return { fill: PERSONALITY_COLOR, type: 'personality' };
    return { fill: "transparent", type: 'none' };
  };

  // Determina a cor do canal baseado nos gates que o compõem
  const getChannelColor = (channelId: string): { color: string; type: 'complete' | 'partial' | 'inactive' } => {
    const gates = channelId.split('-').map(Number);
    const isComplete = completeChannels.includes(channelId);
    
    if (!isComplete) {
      const hasAnyGate = gates.some(g => activatedGates.includes(g));
      if (!hasAnyGate) return { color: CHANNEL_UNDEFINED_COLOR, type: 'inactive' };
      
      // Canal parcialmente ativo
      const designActive = gates.some(g => designGates.includes(g));
      const personalityActive = gates.some(g => personalityGates.includes(g));
      
      if (designActive && personalityActive) return { color: BOTH_COLOR, type: 'partial' };
      if (designActive) return { color: DESIGN_COLOR, type: 'partial' };
      if (personalityActive) return { color: PERSONALITY_COLOR, type: 'partial' };
      return { color: CHANNEL_UNDEFINED_COLOR, type: 'inactive' };
    }
    
    // Canal completo
    const gate1Color = getGateColor(gates[0]);
    const gate2Color = getGateColor(gates[1]);
    
    // Se ambos os gates são de tipos diferentes, é misto
    if (gate1Color.type !== gate2Color.type) {
      // Um é personality e outro é design = canal misto
      const hasDesign = gate1Color.type === 'design' || gate2Color.type === 'design';
      const hasPersonality = gate1Color.type === 'personality' || gate2Color.type === 'personality';
      if (hasDesign && hasPersonality) return { color: 'mixed', type: 'complete' };
    }
    
    // Ambos são do mesmo tipo ou um é "both"
    if (gate1Color.type === 'both' || gate2Color.type === 'both') return { color: BOTH_COLOR, type: 'complete' };
    if (gate1Color.type === 'design' || gate2Color.type === 'design') return { color: DESIGN_COLOR, type: 'complete' };
    return { color: PERSONALITY_COLOR, type: 'complete' };
  };

  const isGateActivated = (gate: number) => {
    return activatedGates.includes(gate);
  };

  const renderHumanSilhouette = () => (
    <ellipse 
      cx="250" 
      cy="300" 
      rx="170" 
      ry="280" 
      fill="#F5E6D3" 
      opacity="0.4"
      stroke="#E5D4C0"
      strokeWidth="1"
    />
  );

  const renderCenter = (centerId: string) => {
    const pos = CENTER_POSITIONS[centerId];
    const isDefined = definedCenters.includes(centerId);
    
    const fillColor = isDefined ? DEFINED_COLOR : UNDEFINED_COLOR;
    
    // Formas específicas para cada centro
    if (centerId === 'head') {
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x},${pos.y - 30} ${pos.x - 25},${pos.y + 15} ${pos.x + 25},${pos.y + 15}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'ajna') {
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x - 28},${pos.y - 18} ${pos.x + 28},${pos.y - 18} ${pos.x},${pos.y + 25}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'throat') {
      return (
        <g key={centerId}>
          <rect
            x={pos.x - 55}
            y={pos.y - 28}
            width={110}
            height={55}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
            rx={4}
          />
        </g>
      );
    }
    
    if (centerId === 'g') {
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x},${pos.y - 35} ${pos.x + 35},${pos.y} ${pos.x},${pos.y + 35} ${pos.x - 35},${pos.y}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'heart') {
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x},${pos.y - 22} ${pos.x + 22},${pos.y + 12} ${pos.x - 22},${pos.y + 12}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'spleen') {
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x + 25},${pos.y - 25} ${pos.x + 25},${pos.y + 25} ${pos.x - 25},${pos.y}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'solar') {
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x - 25},${pos.y - 25} ${pos.x - 25},${pos.y + 25} ${pos.x + 25},${pos.y}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'sacral') {
      return (
        <g key={centerId}>
          <rect
            x={pos.x - 48}
            y={pos.y - 30}
            width={96}
            height={50}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
            rx={4}
          />
        </g>
      );
    }
    
    if (centerId === 'root') {
      return (
        <g key={centerId}>
          <rect
            x={pos.x - 55}
            y={pos.y - 30}
            width={110}
            height={50}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
            rx={4}
          />
        </g>
      );
    }
    
    return null;
  };

  const renderGateNumbers = () => {
    const allGates: JSX.Element[] = [];
    
    Object.entries(GATE_POSITIONS).forEach(([centerId, gates]) => {
      gates.forEach(({ gate, x, y }) => {
        const isActive = isGateActivated(gate);
        const gateColorInfo = getGateColor(gate);
        const hasColor = gateColorInfo.type !== 'none';
        
        allGates.push(
          <g key={`gate-${gate}`}>
            {isActive && (
              <circle
                cx={x}
                cy={y}
                r={10}
                fill={hasColor ? gateColorInfo.fill : DEFINED_COLOR}
                stroke={STROKE_COLOR}
                strokeWidth={0.5}
              />
            )}
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              fontSize="8"
              fontWeight={isActive ? "bold" : "normal"}
              fill={isActive && hasColor ? "#fff" : "#333"}
            >
              {gate}
            </text>
          </g>
        );
      });
    });
    
    return allGates;
  };

  const renderChannels = () => {
    return Object.entries(CHANNEL_PATHS).map(([channelId, { path }]) => {
      const channelColorInfo = getChannelColor(channelId);
      
      if (channelColorInfo.type === 'inactive') {
        return (
          <path
            key={channelId}
            d={path}
            fill="none"
            stroke={CHANNEL_UNDEFINED_COLOR}
            strokeWidth={2}
          />
        );
      }

      const strokeWidth = channelColorInfo.type === 'complete' ? 5 : 3;
      
      // Canal misto: renderiza duas linhas lado a lado
      if (channelColorInfo.color === 'mixed') {
        return (
          <g key={channelId}>
            <path
              d={path}
              fill="none"
              stroke={DESIGN_COLOR}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray="8,4"
            />
            <path
              d={path}
              fill="none"
              stroke={PERSONALITY_COLOR}
              strokeWidth={strokeWidth / 2}
              strokeLinecap="round"
              strokeDasharray="4,8"
              strokeDashoffset="4"
            />
          </g>
        );
      }

      return (
        <path
          key={channelId}
          d={path}
          fill="none"
          stroke={channelColorInfo.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    });
  };

  // Legenda visual
  const renderLegend = () => (
    <g className="legend" transform="translate(10, 560)">
      {/* Fundo da legenda */}
      <rect x="0" y="0" width="480" height="35" fill="white" opacity="0.9" rx="4" />
      
      {/* Design (Vermelho) */}
      <circle cx="20" cy="17" r="6" fill={DESIGN_COLOR} />
      <text x="32" y="21" fontSize="10" fill="#333">Design (Inconsciente)</text>
      
      {/* Personality (Preto) */}
      <circle cx="160" cy="17" r="6" fill={PERSONALITY_COLOR} />
      <text x="172" y="21" fontSize="10" fill="#333">Personality (Consciente)</text>
      
      {/* Ambos */}
      <circle cx="320" cy="17" r="6" fill={BOTH_COLOR} />
      <text x="332" y="21" fontSize="10" fill="#333">Ambos</text>
      
      {/* Centro Definido */}
      <rect x="400" y="11" width="12" height="12" fill={DEFINED_COLOR} stroke={STROKE_COLOR} strokeWidth="0.5" rx="2" />
      <text x="418" y="21" fontSize="10" fill="#333">Definido</text>
    </g>
  );

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 500 610" 
        className="w-full max-w-[400px] mx-auto"
        style={{ height: 'auto' }}
      >
        {/* Silhueta humana de fundo */}
        {renderHumanSilhouette()}
        
        {/* Canais (atrás dos centros) */}
        <g className="channels">
          {renderChannels()}
        </g>

        {/* Centros */}
        <g className="centers">
          {Object.keys(CENTER_POSITIONS).map(centerId => renderCenter(centerId))}
        </g>

        {/* Números dos gates */}
        <g className="gates">
          {renderGateNumbers()}
        </g>

        {/* Legenda */}
        {renderLegend()}
      </svg>
    </div>
  );
};

export default BodyGraph;
