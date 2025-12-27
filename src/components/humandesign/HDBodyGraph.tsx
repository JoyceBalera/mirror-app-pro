import React, { useMemo } from 'react';
import { centers, gates, channels, mapCenterId, Centers, GateMeta } from '@/data/bodygraphMap';

// Colors - EXACT from gethdchart-web
const purple = '#342973';
const white = '#FFFFFF';
const brokenWhite = '#F5F5F5';
const grey = '#D9D9D9';
const darkGrey = '#31243D';
const red = '#D90A0A';

interface DefinedGateMap {
  isDesign?: boolean;
  isPersonality?: boolean;
  isConnected?: boolean;
}

interface HDBodyGraphProps {
  definedCenters: string[];
  activeChannels: { id: string; gates?: number[]; isComplete: boolean }[];
  activatedGates: number[];
  personalityGates: number[];
  designGates: number[];
}

const HDBodyGraph: React.FC<HDBodyGraphProps> = ({
  definedCenters,
  activeChannels,
  activatedGates,
  personalityGates,
  designGates,
}) => {
  // Build gate map with activation info
  const gateMap = useMemo(() => {
    const map: Record<number, DefinedGateMap> = {};
    
    // Process all activated gates
    activatedGates.forEach(gate => {
      const isDesign = designGates.includes(gate);
      const isPersonality = personalityGates.includes(gate);
      
      // Check if connected (both gates of channel are activated)
      const channelPair = channels.find(([g1, g2]) => g1 === gate || g2 === gate);
      let isConnected = false;
      if (channelPair) {
        const otherGate = channelPair[0] === gate ? channelPair[1] : channelPair[0];
        isConnected = activatedGates.includes(otherGate);
      }
      
      map[gate] = { isDesign, isPersonality, isConnected };
    });
    
    return map;
  }, [activatedGates, designGates, personalityGates]);

  // Get list of open (non-activated) gates
  const openGates = useMemo(() => {
    return Object.keys(gates).map(Number).filter(g => !activatedGates.includes(g));
  }, [activatedGates]);

  // Get list of defined gates
  const definedGates = useMemo(() => {
    return activatedGates;
  }, [activatedGates]);

  // Check if center is defined
  const isCenterDefined = (centerId: Centers): boolean => {
    return definedCenters.some(c => mapCenterId(c) === centerId);
  };

  // Get list of defined center IDs
  const definedCentersList = useMemo(() => {
    return (Object.keys(centers) as Centers[]).filter(isCenterDefined);
  }, [definedCenters]);

  // Generate gate element - EXACT from gethdchart-web
  const generateGate = (gate: number, defined?: boolean) => {
    const gateMeta = gates[gate];
    if (!gateMeta) return null;

    const { x, y } = gateMeta.position;

    return (
      <g key={`gate-${gate}`}>
        <rect 
          x={x} 
          y={y} 
          width={12} 
          height={12} 
          rx={6} 
          fill={defined ? purple : 'none'} 
        />
        <text
          x={x + 6}
          y={y + 8.5}
          fill={defined ? brokenWhite : purple}
          fontFamily="Helvetica, sans-serif"
          fontSize={7}
          textAnchor="middle"
        >
          {gate}
        </text>
      </g>
    );
  };

  // Generate channel segment - EXACT from gethdchart-web
  const generateChannel = (gate: number, gateInfo?: DefinedGateMap) => {
    const { isDesign, isPersonality, isConnected } = gateInfo || {};
    
    const gateMeta = gates[gate];
    if (!gateMeta?.channel) return null;
    
    const { x, y, length, rotate, alwaysRoundCap } = gateMeta.channel;

    let lineStroke = grey;
    if (isPersonality && isDesign) {
      lineStroke = `url(#channelGradient${gate})`;
    } else if (isPersonality) {
      lineStroke = darkGrey;
    } else if (isDesign) {
      lineStroke = red;
    }

    return (
      <React.Fragment key={`channel-${gate}`}>
        {(isPersonality && isDesign) && (
          <defs>
            <linearGradient 
              id={`channelGradient${gate}`} 
              x1={x} 
              y1={y - 3} 
              x2={x} 
              y2={y + 3} 
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={darkGrey} />
              <stop offset="100%" stopColor={red} />
            </linearGradient>
          </defs>
        )}
        <path
          d={`M ${x} ${y} L ${x + length} ${y}`}
          stroke={lineStroke}
          strokeWidth={6}
          transform={rotate ? `rotate(${-rotate}, ${x}, ${y})` : ''}
          strokeLinecap={(isConnected && !alwaysRoundCap) ? 'butt' : 'round'}
        />
      </React.Fragment>
    );
  };

  // Generate center - EXACT from gethdchart-web
  const generateCenter = (name: Centers, isDefined?: boolean, definedGatesList?: number[]) => {
    const centerMeta = centers[name];
    if (!centerMeta) return null;

    const { position, gates: centerGates, vector, color } = centerMeta;
    const fillColor = isDefined ? `#${color}` : white;

    return (
      <g key={`center-${name}`}>
        <path
          d={vector}
          fill={fillColor}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          stroke={`#${color}`}
          transform={`translate(${position.x}, ${position.y})`}
        />
        {centerGates.map((gate) => generateGate(gate, definedGatesList?.includes(gate)))}
      </g>
    );
  };

  // Render human silhouette - stylized standing figure
  const renderHumanSilhouette = () => (
    <g opacity="0.08" fill="#BFAFB2">
      {/* Cabeça oval */}
      <ellipse cx="165" cy="45" rx="28" ry="35" />
      
      {/* Pescoço */}
      <rect x="153" y="75" width="24" height="20" rx="3" />
      
      {/* Tronco superior (ombros largos) */}
      <path d="M 105,95 Q 95,110 100,140 L 100,240 Q 105,250 120,255 L 120,260 Q 125,265 135,265 L 195,265 Q 205,265 210,260 L 210,255 Q 225,250 230,240 L 230,140 Q 235,110 225,95 L 205,95 Q 200,100 195,105 L 165,105 L 135,105 Q 130,100 125,95 Z" />
      
      {/* Quadril */}
      <path d="M 120,265 L 210,265 L 205,360 Q 200,370 190,375 L 190,380 L 140,380 L 140,375 Q 130,370 125,360 Z" />
      
      {/* Perna esquerda */}
      <path d="M 140,380 L 130,380 Q 125,390 123,410 L 120,480 Q 118,510 120,540 L 130,540 Q 133,510 135,480 L 138,410 Q 140,390 140,380 Z" />
      
      {/* Perna direita */}
      <path d="M 190,380 L 200,380 Q 205,390 207,410 L 210,480 Q 212,510 210,540 L 200,540 Q 197,510 195,480 L 192,410 Q 190,390 190,380 Z" />
    </g>
  );

  // Render legend
  const renderLegend = () => (
    <g transform="translate(10, 560)">
      <rect x="0" y="0" width="310" height="55" fill="rgba(255,255,255,0.9)" rx="6" />
      
      {/* Design */}
      <rect x="10" y="10" width="16" height="16" rx="3" fill={red} />
      <text x="30" y="22" fontSize="11" fill="#374151">Design (Inconsciente)</text>
      
      {/* Personality */}
      <rect x="160" y="10" width="16" height="16" rx="3" fill={darkGrey} />
      <text x="180" y="22" fontSize="11" fill="#374151">Personalidade (Consciente)</text>
      
      {/* Both */}
      <rect x="10" y="32" width="16" height="16" rx="3" fill="url(#legendGradient)" />
      <text x="30" y="44" fontSize="11" fill="#374151">Ambos</text>
      
      {/* Defined Center */}
      <rect x="90" y="32" width="16" height="16" rx="3" fill="#F3893F" stroke="#F3893F" strokeWidth="1" />
      <text x="110" y="44" fontSize="11" fill="#374151">Centro Definido</text>
      
      {/* Undefined Center */}
      <rect x="220" y="32" width="16" height="16" rx="3" fill={white} stroke="#F3893F" strokeWidth="1" />
      <text x="240" y="44" fontSize="11" fill="#374151">Indefinido</text>
    </g>
  );

  return (
    <svg 
      width="330" 
      height="620" 
      viewBox="0 0 330 620" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[350px] h-auto"
      style={{ userSelect: 'none' }}
    >
      <defs>
        {/* Legend gradient */}
        <linearGradient id="legendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={darkGrey} />
          <stop offset="100%" stopColor={red} />
        </linearGradient>
      </defs>

      {/* 1. Human silhouette (behind everything) */}
      {renderHumanSilhouette()}

      {/* 2. Open gates channels (gray background) */}
      {openGates.map((gate) => generateChannel(gate))}
      
      {/* 3. Defined gates channels (colored) */}
      {definedGates.map((gate) => generateChannel(gate, gateMap[gate]))}
      
      {/* 3. Centers */}
      {(Object.keys(centers) as Centers[]).map((center) => 
        generateCenter(
          center, 
          definedCentersList.includes(center), 
          definedGates
        )
      )}

      {/* 4. Legend */}
      {renderLegend()}
    </svg>
  );
};

export default HDBodyGraph;
