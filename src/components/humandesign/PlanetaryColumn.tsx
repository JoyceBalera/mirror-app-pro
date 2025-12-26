import { GATES_DATA } from "@/data/humanDesignGates";

interface Activation {
  planet: string;
  planetLabel: string;
  gate: number;
  line: number;
  color?: number;
  tone?: number;
  base?: number;
}

interface PlanetaryColumnProps {
  title: string;
  activations: Activation[];
  variant: 'personality' | 'design';
}

// Símbolos planetários
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉',
  earth: '⊕',
  moon: '☽',
  north_node: '☊',
  south_node: '☋',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '⛢',
  neptune: '♆',
  pluto: '♇',
};

// Ordem dos planetas
const PLANET_ORDER = [
  'sun', 'earth', 'north_node', 'south_node', 
  'moon', 'mercury', 'venus', 'mars', 
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
];

const PlanetaryColumn = ({ title, activations, variant }: PlanetaryColumnProps) => {
  const isDesign = variant === 'design';
  
  // Ordenar ativações pela ordem dos planetas
  const sortedActivations = [...activations].sort((a, b) => {
    const indexA = PLANET_ORDER.indexOf(a.planet);
    const indexB = PLANET_ORDER.indexOf(b.planet);
    return indexA - indexB;
  });

  const bgColor = isDesign ? 'bg-[#7B192B]' : 'bg-black';
  const textColor = 'text-white';
  const accentColor = isDesign ? 'text-red-200' : 'text-gray-300';

  return (
    <div className={`${bgColor} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/20">
        <h3 className={`font-bold text-center ${textColor}`}>
          {title}
        </h3>
        <p className={`text-xs text-center ${accentColor}`}>
          {isDesign ? '(Inconsciente)' : '(Consciente)'}
        </p>
      </div>

      {/* Ativações */}
      <div className="divide-y divide-white/10">
        {sortedActivations.map((activation, idx) => {
          const gateInfo = GATES_DATA[activation.gate];
          const symbol = PLANET_SYMBOLS[activation.planet] || activation.planetLabel;
          
          return (
            <div 
              key={idx} 
              className="px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              {/* Planeta */}
              <div className="flex items-center gap-2 min-w-[80px]">
                <span className="text-lg" title={activation.planetLabel}>
                  {symbol}
                </span>
                <span className={`text-xs ${accentColor}`}>
                  {activation.planetLabel}
                </span>
              </div>

              {/* Gate e Linha */}
              <div className="flex items-center gap-1">
                <span className={`font-bold ${textColor}`}>
                  {activation.gate}
                </span>
                <span className={`text-sm ${accentColor}`}>
                  .{activation.line}
                </span>
              </div>

              {/* Seta de direção (se disponível) */}
              <div className="w-6 text-center">
                {activation.color && (
                  <span className={`text-xs ${accentColor}`}>
                    {activation.color <= 3 ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer com contagem */}
      <div className={`px-4 py-2 border-t border-white/20 ${accentColor} text-xs text-center`}>
        {activations.length} ativações
      </div>
    </div>
  );
};

export default PlanetaryColumn;
