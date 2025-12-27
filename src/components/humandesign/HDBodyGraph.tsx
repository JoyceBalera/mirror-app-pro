import React, { useMemo } from 'react';
import { CENTERS, GATES, CHANNELS, mapCenterId, getGateData, CENTER_COLORS } from '@/data/bodygraphMap';

// Colors for different activation types
const PERSONALITY_COLOR = '#1a1a1a'; // Black
const DESIGN_COLOR = '#DC2626';      // Red
const UNDEFINED_COLOR = '#FFFFFF';   // White (for centers)
const STROKE_COLOR = '#4a4a4a';      // Dark gray for strokes

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
  // Determine gate color based on personality/design activation
  const getGateColor = (gate: number): { fill: string; type: 'personality' | 'design' | 'both' | 'none' } => {
    const isPersonality = personalityGates.includes(gate);
    const isDesign = designGates.includes(gate);
    
    if (isPersonality && isDesign) {
      return { fill: 'url(#bothGradient)', type: 'both' };
    } else if (isPersonality) {
      return { fill: PERSONALITY_COLOR, type: 'personality' };
    } else if (isDesign) {
      return { fill: DESIGN_COLOR, type: 'design' };
    }
    return { fill: '#d1d5db', type: 'none' }; // Gray for inactive
  };

  // Check if gate is activated
  const isGateActivated = (gate: number): boolean => {
    return activatedGates.includes(gate);
  };

  // Check if center is defined
  const isCenterDefined = (centerId: string): boolean => {
    const mappedId = mapCenterId(centerId);
    return definedCenters.some(c => mapCenterId(c) === mappedId);
  };

  // Get complete channels (both gates activated)
  const completeChannels = useMemo(() => {
    return CHANNELS.filter(channel => {
      const [gate1, gate2] = channel.gates;
      return activatedGates.includes(gate1) && activatedGates.includes(gate2);
    });
  }, [activatedGates]);

  // Get channel color based on gate activations
  const getChannelColor = (gate1: number, gate2: number): string => {
    const gate1Color = getGateColor(gate1);
    const gate2Color = getGateColor(gate2);
    
    // If both are the same type
    if (gate1Color.type === gate2Color.type && gate1Color.type !== 'none') {
      return gate1Color.fill;
    }
    
    // If one is personality and one is design
    if ((gate1Color.type === 'personality' && gate2Color.type === 'design') ||
        (gate1Color.type === 'design' && gate2Color.type === 'personality')) {
      return 'url(#channelGradient)';
    }
    
    // If one is both
    if (gate1Color.type === 'both' || gate2Color.type === 'both') {
      return 'url(#bothGradient)';
    }
    
    // Return the one that's activated
    return gate1Color.type !== 'none' ? gate1Color.fill : gate2Color.fill;
  };

  // Render a single center
  const renderCenter = (center: typeof CENTERS[0]) => {
    const isDefined = isCenterDefined(center.id);
    const fillColor = isDefined ? center.color : UNDEFINED_COLOR;
    const [translateX, translateY] = center.translate.split(',').map(s => parseFloat(s.trim()));

    return (
      <g 
        key={center.id} 
        transform={`translate(${translateX}, ${translateY})`}
      >
        <path
          d={center.vector}
          fill={fillColor}
          stroke={STROKE_COLOR}
          strokeWidth="1.5"
        />
      </g>
    );
  };

  // Render a channel line using length and rotate
  const renderChannel = (channel: typeof CHANNELS[0]) => {
    const gate1Data = getGateData(channel.gates[0]);
    const gate2Data = getGateData(channel.gates[1]);
    
    if (!gate1Data?.channel || !gate2Data?.channel) return null;
    
    const isComplete = completeChannels.some(c => c.id === channel.id);
    if (!isComplete) return null;

    const color = getChannelColor(channel.gates[0], channel.gates[1]);
    
    // Use gate1's channel data for the line
    const { x, y, length, rotate } = gate1Data.channel;
    
    return (
      <g key={channel.id}>
        <line
          x1={x}
          y1={y}
          x2={x + length * Math.cos(rotate * Math.PI / 180)}
          y2={y + length * Math.sin(rotate * Math.PI / 180)}
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>
    );
  };

  // Render a gate indicator
  const renderGate = (gateData: typeof GATES[0]) => {
    const isActivated = isGateActivated(gateData.gate);
    const { fill, type } = getGateColor(gateData.gate);
    
    if (!isActivated) {
      // Inactive gate - just show number
      return (
        <g key={gateData.gate}>
          <text
            x={gateData.x}
            y={gateData.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#9ca3af"
            fontWeight="400"
          >
            {gateData.gate}
          </text>
        </g>
      );
    }

    // Activated gate - show with background
    return (
      <g key={gateData.gate}>
        <rect
          x={gateData.x - 10}
          y={gateData.y - 8}
          width="20"
          height="16"
          rx="3"
          fill={fill}
          stroke={type === 'both' ? DESIGN_COLOR : 'none'}
          strokeWidth={type === 'both' ? 1 : 0}
        />
        <text
          x={gateData.x}
          y={gateData.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill={type === 'personality' || type === 'both' ? '#FFFFFF' : '#FFFFFF'}
          fontWeight="600"
        >
          {gateData.gate}
        </text>
      </g>
    );
  };

  // Render human silhouette behind the body graph
  const renderHumanSilhouette = () => (
    <g className="human-silhouette" opacity="0.15">
      {/* Head */}
      <ellipse cx="166" cy="25" rx="35" ry="30" fill="#8B7355" />
      
      {/* Neck */}
      <rect x="151" y="50" width="30" height="25" fill="#8B7355" />
      
      {/* Shoulders and upper body */}
      <path
        d="M166 75 
           C 166 75, 100 85, 60 120
           C 40 140, 30 180, 35 250
           L 35 350
           C 35 360, 40 370, 50 375
           L 75 385
           C 85 388, 90 395, 90 405
           L 90 545
           C 90 555, 85 560, 75 560
           L 55 565
           C 50 567, 48 575, 50 580
           L 70 595
           C 80 600, 90 595, 95 590
           L 115 575
           C 120 570, 130 570, 135 575
           L 135 540
           C 135 520, 140 500, 150 490
           L 166 480"
        fill="#8B7355"
      />
      <path
        d="M166 75 
           C 166 75, 232 85, 272 120
           C 292 140, 302 180, 297 250
           L 297 350
           C 297 360, 292 370, 282 375
           L 257 385
           C 247 388, 242 395, 242 405
           L 242 545
           C 242 555, 247 560, 257 560
           L 277 565
           C 282 567, 284 575, 282 580
           L 262 595
           C 252 600, 242 595, 237 590
           L 217 575
           C 212 570, 202 570, 197 575
           L 197 540
           C 197 520, 192 500, 182 490
           L 166 480"
        fill="#8B7355"
      />
      
      {/* Torso center fill */}
      <ellipse cx="166" cy="180" rx="65" ry="45" fill="#8B7355" />
      <ellipse cx="166" cy="290" rx="55" ry="50" fill="#8B7355" />
      <ellipse cx="166" cy="400" rx="45" ry="55" fill="#8B7355" />
      <ellipse cx="166" cy="480" rx="35" ry="30" fill="#8B7355" />
    </g>
  );

  // Render legend
  const renderLegend = () => (
    <g transform="translate(10, 560)">
      <rect x="0" y="0" width="310" height="55" fill="rgba(255,255,255,0.9)" rx="6" />
      
      {/* Design */}
      <rect x="10" y="10" width="16" height="16" rx="3" fill={DESIGN_COLOR} />
      <text x="30" y="22" fontSize="11" fill="#374151">Design (Inconsciente)</text>
      
      {/* Personality */}
      <rect x="160" y="10" width="16" height="16" rx="3" fill={PERSONALITY_COLOR} />
      <text x="180" y="22" fontSize="11" fill="#374151">Personalidade (Consciente)</text>
      
      {/* Both */}
      <rect x="10" y="32" width="16" height="16" rx="3" fill="url(#bothGradient)" />
      <text x="30" y="44" fontSize="11" fill="#374151">Ambos</text>
      
      {/* Defined Center */}
      <rect x="90" y="32" width="16" height="16" rx="3" fill={CENTER_COLORS.throat} stroke={STROKE_COLOR} strokeWidth="1" />
      <text x="110" y="44" fontSize="11" fill="#374151">Centro Definido</text>
      
      {/* Undefined Center */}
      <rect x="220" y="32" width="16" height="16" rx="3" fill={UNDEFINED_COLOR} stroke={STROKE_COLOR} strokeWidth="1" />
      <text x="240" y="44" fontSize="11" fill="#374151">Indefinido</text>
    </g>
  );

  return (
    <svg 
      viewBox="0 0 332 620" 
      className="w-full max-w-[350px] h-auto"
    >
      <defs>
        {/* Gradient for both personality and design */}
        <linearGradient id="bothGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={PERSONALITY_COLOR} />
          <stop offset="50%" stopColor={PERSONALITY_COLOR} />
          <stop offset="50%" stopColor={DESIGN_COLOR} />
          <stop offset="100%" stopColor={DESIGN_COLOR} />
        </linearGradient>
        
        {/* Gradient for channels with mixed activations */}
        <linearGradient id="channelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={PERSONALITY_COLOR} />
          <stop offset="100%" stopColor={DESIGN_COLOR} />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="332" height="620" fill="transparent" />
      
      {/* Human silhouette behind everything */}
      {renderHumanSilhouette()}
      
      {/* Render channels first (behind centers) */}
      <g className="channels">
        {CHANNELS.map(channel => renderChannel(channel))}
      </g>
      
      {/* Render centers */}
      <g className="centers">
        {CENTERS.map(center => renderCenter(center))}
      </g>
      
      {/* Render gates */}
      <g className="gates">
        {GATES.map(gate => renderGate(gate))}
      </g>
      
      {/* Render legend */}
      {renderLegend()}
    </svg>
  );
};

export default HDBodyGraph;
