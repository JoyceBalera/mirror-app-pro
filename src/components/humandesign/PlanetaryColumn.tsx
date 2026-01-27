import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const isDesign = variant === 'design';
  
  // Ordenar ativações pela ordem dos planetas
  const sortedActivations = [...activations].sort((a, b) => {
    const indexA = PLANET_ORDER.indexOf(a.planet);
    const indexB = PLANET_ORDER.indexOf(b.planet);
    return indexA - indexB;
  });

  // Get translated title
  const translatedTitle = variant === 'personality' 
    ? t('planetaryColumn.personality') 
    : t('planetaryColumn.design');

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {translatedTitle}
        </h3>
      </div>

      {/* Ativações */}
      <div className="space-y-1.5">
        {sortedActivations.map((activation, idx) => {
          const symbol = PLANET_SYMBOLS[activation.planet] || activation.planetLabel;
          // Get translated planet name
          const planetName = t(`planets.${activation.planet}`, { defaultValue: activation.planetLabel });
          
          // Determinar seta de direção baseada na linha
          let arrow = '';
          if (activation.color) {
            if (activation.color <= 2) arrow = '→';
            else if (activation.color >= 5) arrow = '←';
          }
          
          return (
            <div 
              key={idx} 
              className="flex items-center justify-between gap-2 px-3 py-1.5 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
            >
              {/* Símbolo + Gate.Linha */}
              <div className="flex items-center gap-2">
                <span className="text-base opacity-70" title={planetName}>
                  {symbol}
                </span>
                <span className="font-medium text-foreground">
                  {activation.gate}
                  <span className="text-muted-foreground">.{activation.line}</span>
                </span>
              </div>

              {/* Seta de direção */}
              {arrow && (
                <span className="text-muted-foreground text-sm">
                  {arrow}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Setas indicadoras de fluxo */}
      <div className="flex justify-center mt-3 gap-1">
        {isDesign ? (
          <>
            <span className="text-muted-foreground">→</span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">→</span>
            <span className="text-muted-foreground">←</span>
          </>
        )}
      </div>
    </div>
  );
};

export default PlanetaryColumn;