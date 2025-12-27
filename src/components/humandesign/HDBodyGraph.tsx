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

  // Render human silhouette - filled meditation pose aligned with centers
  const renderHumanSilhouette = () => (
    <g opacity="0.35">
      {/* Head - aligned with Head center (~165, 40) */}
      <ellipse cx="165" cy="35" rx="28" ry="32" fill="#d4c8b8" />
      
      {/* Neck */}
      <rect x="155" y="65" width="20" height="25" fill="#d4c8b8" />
      
      {/* Torso - covers Throat, G, Heart, Spleen, Solar Plexus, Sacral */}
      <path
        d="M165,90 
           C200,90 220,110 225,140
           C230,170 225,250 225,320
           C225,380 210,420 200,450
           L165,460
           L130,450
           C120,420 105,380 105,320
           C105,250 100,170 105,140
           C110,110 130,90 165,90"
        fill="#d4c8b8"
      />
      
      {/* Left arm - curved outward from shoulder, aligned with Spleen side */}
      <path
        d="M105,130
           C70,150 40,200 25,280
           C15,340 20,400 40,450
           C55,485 80,500 110,490
           C130,480 140,450 135,420
           C130,390 120,350 115,320"
        fill="#d4c8b8"
      />
      
      {/* Right arm - curved outward from shoulder, aligned with ESP side */}
      <path
        d="M225,130
           C260,150 290,200 305,280
           C315,340 310,400 290,450
           C275,485 250,500 220,490
           C200,480 190,450 195,420
           C200,390 210,350 215,320"
        fill="#d4c8b8"
      />
      
      {/* Left leg - meditation pose, crossed */}
      <path
        d="M130,450
           C115,470 95,490 75,510
           C55,530 50,545 60,555
           C80,570 140,560 165,545"
        fill="#d4c8b8"
      />
      
      {/* Right leg - meditation pose, crossed */}
      <path
        d="M200,450
           C215,470 235,490 255,510
           C275,530 280,545 270,555
           C250,570 190,560 165,545"
        fill="#d4c8b8"
      />
      
      {/* Hands resting on knees */}
      <ellipse cx="50" cy="470" rx="18" ry="22" fill="#d4c8b8" />
      <ellipse cx="280" cy="470" rx="18" ry="22" fill="#d4c8b8" />
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
