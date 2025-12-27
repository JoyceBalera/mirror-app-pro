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

  // Render human silhouette - meditation pose with arms curved UP and OUT
  const renderHumanSilhouette = () => (
    <g opacity="0.3">
      {/* Complete meditation silhouette as single path */}
      <path
        d={`
          M165,20
          C185,20 200,35 200,55 C200,75 185,90 165,90 C145,90 130,75 130,55 C130,35 145,20 165,20
          Z
          
          M165,90
          L165,105
          C140,110 120,115 105,125
          C80,100 50,70 25,55
          C5,42 -10,55 -5,80
          C0,110 25,150 45,200
          C60,240 70,280 75,320
          C80,360 80,400 75,430
          L95,440
          C100,400 105,360 105,320
          C105,250 100,180 110,140
          C120,115 140,105 165,105
          C190,105 210,115 220,140
          C230,180 225,250 225,320
          C225,360 230,400 235,440
          L255,430
          C250,400 250,360 255,320
          C260,280 270,240 285,200
          C305,150 330,110 335,80
          C340,55 325,42 305,55
          C280,70 250,100 225,125
          C210,115 190,110 165,105
          
          M95,440
          L105,455
          C100,470 85,490 65,510
          C45,530 40,545 55,560
          C75,575 130,570 165,555
          C200,570 255,575 275,560
          C290,545 285,530 265,510
          C245,490 230,470 225,455
          L235,440
          L225,455
          C215,480 190,510 165,515
          C140,510 115,480 105,455
          L95,440
        `}
        fill="#e8e0d5"
      />
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
