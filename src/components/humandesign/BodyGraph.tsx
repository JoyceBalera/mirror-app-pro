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

// Posições dos centros no layout tradicional do Human Design
// Layout baseado em proporções anatômicas corretas
const CENTER_POSITIONS: Record<string, { x: number; y: number }> = {
  head: { x: 200, y: 40 },      // Topo - triângulo apontando para cima
  ajna: { x: 200, y: 100 },     // Abaixo da cabeça - triângulo apontando para baixo
  throat: { x: 200, y: 170 },   // Garganta - quadrado
  g: { x: 200, y: 270 },        // Centro G/Identidade - losango
  heart: { x: 130, y: 230 },    // Coração/Ego - à esquerda, acima do G
  spleen: { x: 90, y: 340 },    // Baço - à esquerda
  sacral: { x: 200, y: 370 },   // Sacral - abaixo do G
  solar: { x: 310, y: 340 },    // Plexo Solar - à direita
  root: { x: 200, y: 460 },     // Raiz - base
};

// Gates por posição em cada centro - ajustados para o novo layout
const GATE_POSITIONS: Record<string, { gate: number; x: number; y: number }[]> = {
  head: [
    { gate: 64, x: 185, y: 18 },
    { gate: 61, x: 200, y: 18 },
    { gate: 63, x: 215, y: 18 },
  ],
  ajna: [
    { gate: 47, x: 175, y: 82 },
    { gate: 24, x: 200, y: 82 },
    { gate: 4, x: 225, y: 82 },
    { gate: 17, x: 175, y: 115 },
    { gate: 43, x: 200, y: 120 },
    { gate: 11, x: 225, y: 115 },
  ],
  throat: [
    { gate: 62, x: 150, y: 155 },
    { gate: 23, x: 175, y: 152 },
    { gate: 56, x: 225, y: 152 },
    { gate: 35, x: 250, y: 155 },
    { gate: 16, x: 148, y: 175 },
    { gate: 20, x: 165, y: 185 },
    { gate: 8, x: 200, y: 182 },
    { gate: 31, x: 188, y: 195 },
    { gate: 33, x: 235, y: 185 },
    { gate: 12, x: 252, y: 175 },
    { gate: 45, x: 150, y: 192 },
  ],
  g: [
    { gate: 7, x: 188, y: 250 },
    { gate: 1, x: 212, y: 250 },
    { gate: 13, x: 225, y: 265 },
    { gate: 25, x: 228, y: 282 },
    { gate: 46, x: 212, y: 295 },
    { gate: 2, x: 188, y: 295 },
    { gate: 15, x: 172, y: 282 },
    { gate: 10, x: 175, y: 265 },
  ],
  heart: [
    { gate: 21, x: 115, y: 212 },
    { gate: 51, x: 140, y: 212 },
    { gate: 26, x: 118, y: 240 },
    { gate: 40, x: 142, y: 245 },
  ],
  spleen: [
    { gate: 48, x: 68, y: 318 },
    { gate: 57, x: 88, y: 318 },
    { gate: 44, x: 108, y: 325 },
    { gate: 50, x: 72, y: 345 },
    { gate: 32, x: 75, y: 365 },
    { gate: 28, x: 95, y: 358 },
    { gate: 18, x: 108, y: 350 },
  ],
  sacral: [
    { gate: 5, x: 175, y: 352 },
    { gate: 14, x: 195, y: 348 },
    { gate: 29, x: 215, y: 352 },
    { gate: 59, x: 235, y: 358 },
    { gate: 9, x: 175, y: 382 },
    { gate: 3, x: 195, y: 388 },
    { gate: 42, x: 215, y: 382 },
    { gate: 27, x: 160, y: 368 },
    { gate: 34, x: 158, y: 350 },
  ],
  solar: [
    { gate: 36, x: 292, y: 318 },
    { gate: 22, x: 312, y: 318 },
    { gate: 37, x: 332, y: 325 },
    { gate: 6, x: 295, y: 348 },
    { gate: 49, x: 312, y: 358 },
    { gate: 55, x: 332, y: 350 },
    { gate: 30, x: 335, y: 365 },
  ],
  root: [
    { gate: 53, x: 175, y: 440 },
    { gate: 60, x: 195, y: 440 },
    { gate: 52, x: 215, y: 440 },
    { gate: 19, x: 248, y: 455 },
    { gate: 39, x: 268, y: 470 },
    { gate: 41, x: 285, y: 485 },
    { gate: 58, x: 130, y: 485 },
    { gate: 38, x: 142, y: 470 },
    { gate: 54, x: 158, y: 455 },
  ],
};

// Canais com paths de conexão - ajustados para as novas posições
const CHANNEL_PATHS: Record<string, { from: string; to: string; path: string }> = {
  // Head -> Ajna
  '64-47': { from: 'head', to: 'ajna', path: 'M185,55 L178,75' },
  '61-24': { from: 'head', to: 'ajna', path: 'M200,55 L200,75' },
  '63-4': { from: 'head', to: 'ajna', path: 'M215,55 L222,75' },
  
  // Ajna -> Throat
  '17-62': { from: 'ajna', to: 'throat', path: 'M178,120 L155,145' },
  '43-23': { from: 'ajna', to: 'throat', path: 'M200,125 L200,145' },
  '11-56': { from: 'ajna', to: 'throat', path: 'M222,120 L245,145' },
  
  // Throat -> Spleen
  '16-48': { from: 'throat', to: 'spleen', path: 'M150,180 C120,240 95,280 78,315' },
  '20-57': { from: 'throat', to: 'spleen', path: 'M160,190 C110,250 85,290 85,315' },
  
  // Throat -> G
  '20-10': { from: 'throat', to: 'g', path: 'M168,195 L175,245' },
  '31-7': { from: 'throat', to: 'g', path: 'M190,200 L188,245' },
  '8-1': { from: 'throat', to: 'g', path: 'M200,195 L200,245' },
  '33-13': { from: 'throat', to: 'g', path: 'M232,190 L225,250' },
  
  // Throat -> Sacral
  '20-34': { from: 'throat', to: 'sacral', path: 'M165,195 L160,345' },
  
  // Throat -> Heart
  '45-21': { from: 'throat', to: 'heart', path: 'M150,192 L122,210' },
  
  // Throat -> Solar
  '12-22': { from: 'throat', to: 'solar', path: 'M250,180 L305,315' },
  '35-36': { from: 'throat', to: 'solar', path: 'M248,160 L295,315' },
  
  // Heart -> Spleen
  '26-44': { from: 'heart', to: 'spleen', path: 'M118,245 L105,320' },
  
  // Heart -> Solar
  '40-37': { from: 'heart', to: 'solar', path: 'M145,248 C200,290 260,310 325,330' },
  
  // Heart -> G
  '51-25': { from: 'heart', to: 'g', path: 'M145,218 L172,255' },
  
  // G -> Sacral
  '10-34': { from: 'g', to: 'sacral', path: 'M175,290 L160,345' },
  '15-5': { from: 'g', to: 'sacral', path: 'M178,295 L178,348' },
  '2-14': { from: 'g', to: 'sacral', path: 'M192,300 L195,345' },
  '46-29': { from: 'g', to: 'sacral', path: 'M210,300 L212,348' },
  
  // G -> Spleen
  '10-57': { from: 'g', to: 'spleen', path: 'M172,280 C130,310 100,320 90,335' },
  
  // Spleen -> Throat (reverse paths)
  '57-20': { from: 'spleen', to: 'throat', path: 'M85,315 C85,290 110,250 160,190' },
  '48-16': { from: 'spleen', to: 'throat', path: 'M78,315 C95,280 120,240 150,180' },
  
  // Spleen -> Sacral
  '57-34': { from: 'spleen', to: 'sacral', path: 'M95,340 C130,355 145,358 158,355' },
  '50-27': { from: 'spleen', to: 'sacral', path: 'M82,355 C120,370 145,375 158,372' },
  
  // Spleen -> Heart
  '44-26': { from: 'spleen', to: 'heart', path: 'M105,320 L118,245' },
  
  // Spleen -> Root
  '32-54': { from: 'spleen', to: 'root', path: 'M80,370 L155,445' },
  '28-38': { from: 'spleen', to: 'root', path: 'M95,365 L145,465' },
  '18-58': { from: 'spleen', to: 'root', path: 'M105,358 L135,478' },
  
  // Sacral -> Spleen
  '34-57': { from: 'sacral', to: 'spleen', path: 'M158,355 C145,358 130,355 95,340' },
  '27-50': { from: 'sacral', to: 'spleen', path: 'M158,372 C145,375 120,370 82,355' },
  
  // Sacral -> G (reverse)
  '34-10': { from: 'sacral', to: 'g', path: 'M160,345 L175,290' },
  '5-15': { from: 'sacral', to: 'g', path: 'M178,348 L178,295' },
  '14-2': { from: 'sacral', to: 'g', path: 'M195,345 L192,300' },
  '29-46': { from: 'sacral', to: 'g', path: 'M212,348 L210,300' },
  
  // Sacral -> Solar
  '59-6': { from: 'sacral', to: 'solar', path: 'M238,362 L292,352' },
  '6-59': { from: 'solar', to: 'sacral', path: 'M292,352 L238,362' },
  
  // Sacral -> Root
  '42-53': { from: 'sacral', to: 'root', path: 'M212,395 L200,435' },
  '3-60': { from: 'sacral', to: 'root', path: 'M198,395 L198,435' },
  '9-52': { from: 'sacral', to: 'root', path: 'M182,390 L205,435' },
  
  // Solar -> Heart
  '37-40': { from: 'solar', to: 'heart', path: 'M325,330 C260,310 200,290 145,248' },
  
  // Solar -> Throat
  '22-12': { from: 'solar', to: 'throat', path: 'M305,315 L250,180' },
  '36-35': { from: 'solar', to: 'throat', path: 'M295,315 L248,160' },
  
  // Solar -> Root
  '49-19': { from: 'solar', to: 'root', path: 'M315,365 L252,460' },
  '55-39': { from: 'solar', to: 'root', path: 'M330,358 L272,475' },
  '30-41': { from: 'solar', to: 'root', path: 'M338,372 L288,488' },
  
  // Root -> Sacral
  '53-42': { from: 'root', to: 'sacral', path: 'M200,435 L212,395' },
  '60-3': { from: 'root', to: 'sacral', path: 'M198,435 L198,395' },
  '52-9': { from: 'root', to: 'sacral', path: 'M205,435 L182,390' },
  
  // Root -> Spleen
  '54-32': { from: 'root', to: 'spleen', path: 'M155,445 L80,370' },
  '38-28': { from: 'root', to: 'spleen', path: 'M145,465 L95,365' },
  '58-18': { from: 'root', to: 'spleen', path: 'M135,478 L105,358' },
  
  // Root -> Solar
  '19-49': { from: 'root', to: 'solar', path: 'M252,460 L315,365' },
  '39-55': { from: 'root', to: 'solar', path: 'M272,475 L330,358' },
  '41-30': { from: 'root', to: 'solar', path: 'M288,488 L338,372' },
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

  // Silhueta humana estilizada tradicional
  const renderHumanSilhouette = () => (
    <g className="silhouette" opacity="0.15">
      {/* Cabeça */}
      <circle cx="200" cy="35" r="25" fill="#8B7355" />
      {/* Pescoço */}
      <rect x="190" y="55" width="20" height="25" fill="#8B7355" rx="5" />
      {/* Tronco */}
      <path 
        d="M140,80 Q120,150 130,250 L130,380 Q160,420 200,430 Q240,420 270,380 L270,250 Q280,150 260,80 Z" 
        fill="#8B7355"
      />
      {/* Braços */}
      <path d="M140,90 Q80,150 60,280 Q55,300 70,310 Q90,305 100,280 Q115,180 140,130" fill="#8B7355" />
      <path d="M260,90 Q320,150 340,280 Q345,300 330,310 Q310,305 300,280 Q285,180 260,130" fill="#8B7355" />
      {/* Pernas */}
      <path d="M160,380 Q150,450 145,520 L165,520 Q170,450 175,400" fill="#8B7355" />
      <path d="M240,380 Q250,450 255,520 L235,520 Q230,450 225,400" fill="#8B7355" />
    </g>
  );

  const renderCenter = (centerId: string) => {
    const pos = CENTER_POSITIONS[centerId];
    const isDefined = definedCenters.includes(centerId);
    
    const fillColor = isDefined ? DEFINED_COLOR : UNDEFINED_COLOR;
    
    // Formas específicas para cada centro conforme padrão HD
    if (centerId === 'head') {
      // Triângulo apontando para CIMA
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x},${pos.y - 25} ${pos.x - 22},${pos.y + 12} ${pos.x + 22},${pos.y + 12}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'ajna') {
      // Triângulo apontando para BAIXO
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x - 25},${pos.y - 15} ${pos.x + 25},${pos.y - 15} ${pos.x},${pos.y + 22}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'throat') {
      // Quadrado
      return (
        <g key={centerId}>
          <rect
            x={pos.x - 50}
            y={pos.y - 25}
            width={100}
            height={50}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
            rx={3}
          />
        </g>
      );
    }
    
    if (centerId === 'g') {
      // Losango (diamante)
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x},${pos.y - 32} ${pos.x + 32},${pos.y} ${pos.x},${pos.y + 32} ${pos.x - 32},${pos.y}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'heart') {
      // Triângulo pequeno apontando para baixo
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x - 18},${pos.y - 15} ${pos.x + 18},${pos.y - 15} ${pos.x},${pos.y + 18}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'spleen') {
      // Triângulo apontando para a DIREITA
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x - 18},${pos.y - 25} ${pos.x + 25},${pos.y} ${pos.x - 18},${pos.y + 25}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'solar') {
      // Triângulo apontando para a ESQUERDA
      return (
        <g key={centerId}>
          <polygon
            points={`${pos.x + 18},${pos.y - 25} ${pos.x - 25},${pos.y} ${pos.x + 18},${pos.y + 25}`}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
          />
        </g>
      );
    }
    
    if (centerId === 'sacral') {
      // Quadrado
      return (
        <g key={centerId}>
          <rect
            x={pos.x - 45}
            y={pos.y - 25}
            width={90}
            height={45}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
            rx={3}
          />
        </g>
      );
    }
    
    if (centerId === 'root') {
      // Quadrado
      return (
        <g key={centerId}>
          <rect
            x={pos.x - 50}
            y={pos.y - 25}
            width={100}
            height={45}
            fill={fillColor}
            stroke={STROKE_COLOR}
            strokeWidth={1.5}
            rx={3}
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
                r={9}
                fill={hasColor ? gateColorInfo.fill : DEFINED_COLOR}
                stroke={STROKE_COLOR}
                strokeWidth={0.5}
              />
            )}
            <text
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontSize="7"
              fontWeight={isActive ? "bold" : "normal"}
              fill={isActive && hasColor ? "#fff" : "#555"}
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

      const strokeWidth = channelColorInfo.type === 'complete' ? 4 : 2.5;
      
      // Canal misto: renderiza padrão tracejado
      if (channelColorInfo.color === 'mixed') {
        return (
          <g key={channelId}>
            <path
              d={path}
              fill="none"
              stroke={DESIGN_COLOR}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              d={path}
              fill="none"
              stroke={PERSONALITY_COLOR}
              strokeWidth={strokeWidth / 2}
              strokeLinecap="round"
              strokeDasharray="6,6"
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
    <g className="legend" transform="translate(10, 510)">
      {/* Fundo da legenda */}
      <rect x="0" y="0" width="380" height="30" fill="white" opacity="0.95" rx="4" stroke="#ddd" strokeWidth="0.5" />
      
      {/* Design (Vermelho) */}
      <circle cx="15" cy="15" r="5" fill={DESIGN_COLOR} />
      <text x="25" y="18" fontSize="9" fill="#333">Design</text>
      
      {/* Personality (Preto) */}
      <circle cx="90" cy="15" r="5" fill={PERSONALITY_COLOR} />
      <text x="100" y="18" fontSize="9" fill="#333">Personality</text>
      
      {/* Ambos */}
      <circle cx="185" cy="15" r="5" fill={BOTH_COLOR} />
      <text x="195" y="18" fontSize="9" fill="#333">Ambos</text>
      
      {/* Centro Definido */}
      <rect x="255" y="10" width="10" height="10" fill={DEFINED_COLOR} stroke={STROKE_COLOR} strokeWidth="0.5" rx="1" />
      <text x="270" y="18" fontSize="9" fill="#333">Definido</text>
      
      {/* Centro Indefinido */}
      <rect x="330" y="10" width="10" height="10" fill={UNDEFINED_COLOR} stroke={STROKE_COLOR} strokeWidth="0.5" rx="1" />
      <text x="345" y="18" fontSize="9" fill="#333">Aberto</text>
    </g>
  );

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 400 550" 
        className="w-full max-w-[380px] mx-auto"
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
