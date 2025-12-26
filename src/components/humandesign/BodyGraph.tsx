import { useMemo } from "react";
import { CENTERS, CENTERS_ORDER } from "@/data/humanDesignCenters";
import { CHANNELS } from "@/data/humanDesignChannels";

interface BodyGraphProps {
  definedCenters: string[];
  activeChannels: { id: string; gates: number[]; isComplete: boolean }[];
  activatedGates: number[];
  personalityGates: number[];
  designGates: number[];
}

// Posições dos centros no SVG (x, y)
const CENTER_POSITIONS: Record<string, { x: number; y: number; shape: 'triangle' | 'square' | 'diamond' }> = {
  head: { x: 200, y: 40, shape: 'triangle' },
  ajna: { x: 200, y: 100, shape: 'triangle' },
  throat: { x: 200, y: 170, shape: 'square' },
  g: { x: 200, y: 260, shape: 'diamond' },
  heart: { x: 130, y: 230, shape: 'triangle' },
  spleen: { x: 70, y: 320, shape: 'triangle' },
  sacral: { x: 200, y: 350, shape: 'square' },
  solar: { x: 270, y: 320, shape: 'triangle' },
  root: { x: 200, y: 440, shape: 'square' },
};

// Conexões entre centros (para desenhar canais)
const CHANNEL_PATHS: Record<string, { from: string; to: string }> = {
  '64-47': { from: 'head', to: 'ajna' },
  '61-24': { from: 'head', to: 'ajna' },
  '63-4': { from: 'head', to: 'ajna' },
  '17-62': { from: 'ajna', to: 'throat' },
  '43-23': { from: 'ajna', to: 'throat' },
  '11-56': { from: 'ajna', to: 'throat' },
  '16-48': { from: 'throat', to: 'spleen' },
  '20-57': { from: 'throat', to: 'spleen' },
  '20-34': { from: 'throat', to: 'sacral' },
  '20-10': { from: 'throat', to: 'g' },
  '31-7': { from: 'throat', to: 'g' },
  '8-1': { from: 'throat', to: 'g' },
  '33-13': { from: 'throat', to: 'g' },
  '45-21': { from: 'throat', to: 'heart' },
  '12-22': { from: 'throat', to: 'solar' },
  '35-36': { from: 'throat', to: 'solar' },
  '21-45': { from: 'heart', to: 'throat' },
  '26-44': { from: 'heart', to: 'spleen' },
  '40-37': { from: 'heart', to: 'solar' },
  '51-25': { from: 'heart', to: 'g' },
  '10-20': { from: 'g', to: 'throat' },
  '10-34': { from: 'g', to: 'sacral' },
  '10-57': { from: 'g', to: 'spleen' },
  '15-5': { from: 'g', to: 'sacral' },
  '46-29': { from: 'g', to: 'sacral' },
  '2-14': { from: 'g', to: 'sacral' },
  '25-51': { from: 'g', to: 'heart' },
  '57-20': { from: 'spleen', to: 'throat' },
  '57-10': { from: 'spleen', to: 'g' },
  '57-34': { from: 'spleen', to: 'sacral' },
  '44-26': { from: 'spleen', to: 'heart' },
  '50-27': { from: 'spleen', to: 'sacral' },
  '32-54': { from: 'spleen', to: 'root' },
  '28-38': { from: 'spleen', to: 'root' },
  '18-58': { from: 'spleen', to: 'root' },
  '48-16': { from: 'spleen', to: 'throat' },
  '34-20': { from: 'sacral', to: 'throat' },
  '34-10': { from: 'sacral', to: 'g' },
  '34-57': { from: 'sacral', to: 'spleen' },
  '5-15': { from: 'sacral', to: 'g' },
  '14-2': { from: 'sacral', to: 'g' },
  '29-46': { from: 'sacral', to: 'g' },
  '27-50': { from: 'sacral', to: 'spleen' },
  '59-6': { from: 'sacral', to: 'solar' },
  '42-53': { from: 'sacral', to: 'root' },
  '3-60': { from: 'sacral', to: 'root' },
  '9-52': { from: 'sacral', to: 'root' },
  '6-59': { from: 'solar', to: 'sacral' },
  '37-40': { from: 'solar', to: 'heart' },
  '22-12': { from: 'solar', to: 'throat' },
  '36-35': { from: 'solar', to: 'throat' },
  '49-19': { from: 'solar', to: 'root' },
  '55-39': { from: 'solar', to: 'root' },
  '30-41': { from: 'solar', to: 'root' },
  '53-42': { from: 'root', to: 'sacral' },
  '60-3': { from: 'root', to: 'sacral' },
  '52-9': { from: 'root', to: 'sacral' },
  '54-32': { from: 'root', to: 'spleen' },
  '38-28': { from: 'root', to: 'spleen' },
  '58-18': { from: 'root', to: 'spleen' },
  '19-49': { from: 'root', to: 'solar' },
  '39-55': { from: 'root', to: 'solar' },
  '41-30': { from: 'root', to: 'solar' },
};

const BodyGraph = ({ 
  definedCenters, 
  activeChannels, 
  activatedGates,
  personalityGates,
  designGates 
}: BodyGraphProps) => {
  
  const completeChannels = useMemo(() => {
    return activeChannels.filter(ch => ch.isComplete);
  }, [activeChannels]);

  const renderCenter = (centerId: string) => {
    const pos = CENTER_POSITIONS[centerId];
    const center = CENTERS[centerId];
    const isDefined = definedCenters.includes(centerId);
    
    const fillColor = isDefined ? center.color : '#FFFFFF';
    const strokeColor = '#333333';
    const size = 35;

    if (pos.shape === 'triangle') {
      // Triângulo apontando para cima ou para baixo
      const points = centerId === 'head' || centerId === 'ajna' || centerId === 'heart'
        ? `${pos.x},${pos.y - size/2} ${pos.x - size/2},${pos.y + size/2} ${pos.x + size/2},${pos.y + size/2}`
        : `${pos.x - size/2},${pos.y - size/2} ${pos.x + size/2},${pos.y - size/2} ${pos.x},${pos.y + size/2}`;
      
      return (
        <g key={centerId}>
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={2}
            className="transition-all duration-300"
          />
          <text
            x={pos.x}
            y={pos.y + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={isDefined ? '#FFFFFF' : '#333333'}
          >
            {center.label.substring(0, 3)}
          </text>
        </g>
      );
    }

    if (pos.shape === 'diamond') {
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x},${pos.y - size/1.5} ${pos.x + size/1.5},${pos.y} ${pos.x},${pos.y + size/1.5} ${pos.x - size/1.5},${pos.y}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={2}
            className="transition-all duration-300"
          />
          <text
            x={pos.x}
            y={pos.y + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={isDefined ? '#FFFFFF' : '#333333'}
          >
            G
          </text>
        </g>
      );
    }

    // Quadrado
    return (
      <g key={centerId}>
        <rect
          x={pos.x - size/2}
          y={pos.y - size/2}
          width={size}
          height={size}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={2}
          rx={4}
          className="transition-all duration-300"
        />
        <text
          x={pos.x}
          y={pos.y + 4}
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill={isDefined ? '#FFFFFF' : '#333333'}
        >
          {center.label.substring(0, 3)}
        </text>
      </g>
    );
  };

  const renderChannel = (channelId: string, isComplete: boolean) => {
    const path = CHANNEL_PATHS[channelId];
    if (!path) return null;

    const from = CENTER_POSITIONS[path.from];
    const to = CENTER_POSITIONS[path.to];
    if (!from || !to) return null;

    // Determinar cor baseada nas ativações
    const gates = channelId.split('-').map(Number);
    const hasPersonality = gates.some(g => personalityGates.includes(g));
    const hasDesign = gates.some(g => designGates.includes(g));
    
    let strokeColor = '#CCCCCC';
    let strokeWidth = 1;
    
    if (isComplete) {
      if (hasPersonality && hasDesign) {
        strokeColor = '#7B192B'; // Striped effect - usando cor escura
      } else if (hasPersonality) {
        strokeColor = '#000000'; // Preto para personalidade
      } else if (hasDesign) {
        strokeColor = '#C41E3A'; // Vermelho para design
      }
      strokeWidth = 4;
    } else if (hasPersonality || hasDesign) {
      strokeColor = hasPersonality ? '#666666' : '#E57373';
      strokeWidth = 2;
    }

    return (
      <line
        key={channelId}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-300"
      />
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-[#BFAFB2]">
      <svg 
        viewBox="0 0 400 500" 
        className="w-full max-w-[300px] mx-auto"
        style={{ height: 'auto' }}
      >
        {/* Renderizar canais primeiro (atrás dos centros) */}
        <g className="channels">
          {Object.keys(CHANNEL_PATHS).map(channelId => {
            const isComplete = completeChannels.some(ch => ch.id === channelId);
            return renderChannel(channelId, isComplete);
          })}
        </g>

        {/* Renderizar centros */}
        <g className="centers">
          {CENTERS_ORDER.map(centerId => renderCenter(centerId))}
        </g>
      </svg>
      
      {/* Legenda */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-black rounded-sm"></div>
          <span>Personalidade</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-[#C41E3A] rounded-sm"></div>
          <span>Design</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-1 bg-[#7B192B]"></div>
          <span>Canal Completo</span>
        </div>
      </div>
    </div>
  );
};

export default BodyGraph;
