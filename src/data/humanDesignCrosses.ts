// Incarnation Cross translations by Personality Sun Gate
// The cross theme is determined by the Sun gate of the Personality side.
// The angle (Right/Juxtaposition/Left) is determined by the profile.

interface CrossNames {
  pt: string;
  en: string;
  es: string;
}

// Map: Personality Sun Gate → Cross theme name in 3 languages
const crossByGate: Record<number, CrossNames> = {
  1: { pt: "Esfinge", en: "Sphinx", es: "Esfinge" },
  2: { pt: "Esfinge", en: "Sphinx", es: "Esfinge" },
  3: { pt: "Leis", en: "Laws", es: "Leyes" },
  4: { pt: "Explicação", en: "Explanation", es: "Explicación" },
  5: { pt: "Consciência", en: "Consciousness", es: "Consciencia" },
  6: { pt: "Éden", en: "Eden", es: "Edén" },
  7: { pt: "Esfinge", en: "Sphinx", es: "Esfinge" },
  8: { pt: "Contribuição", en: "Contribution", es: "Contribución" },
  9: { pt: "Planejamento", en: "Planning", es: "Planificación" },
  10: { pt: "Amor", en: "Love", es: "Amor" },
  11: { pt: "Éden", en: "Eden", es: "Edén" },
  12: { pt: "Éden", en: "Eden", es: "Edén" },
  13: { pt: "Esfinge", en: "Sphinx", es: "Esfinge" },
  14: { pt: "Vasos", en: "Vessels", es: "Vasos" },
  15: { pt: "Vasos", en: "Vessels", es: "Vasos" },
  16: { pt: "Planejamento", en: "Planning", es: "Planificación" },
  17: { pt: "Inesperado", en: "the Unexpected", es: "lo Inesperado" },
  18: { pt: "Inesperado", en: "the Unexpected", es: "lo Inesperado" },
  19: { pt: "Quatro Caminhos", en: "the Four Ways", es: "los Cuatro Caminos" },
  20: { pt: "Dorminhoco", en: "the Sleeping Phoenix", es: "el Fénix Dormido" },
  21: { pt: "Inesperado", en: "the Unexpected", es: "lo Inesperado" },
  22: { pt: "Governante", en: "the Ruler", es: "el Gobernante" },
  23: { pt: "Explicação", en: "Explanation", es: "Explicación" },
  24: { pt: "Quatro Caminhos", en: "the Four Ways", es: "los Cuatro Caminos" },
  25: { pt: "Recipiente do Amor", en: "the Vessel of Love", es: "el Recipiente del Amor" },
  26: { pt: "Governante", en: "the Ruler", es: "el Gobernante" },
  27: { pt: "Inesperado", en: "the Unexpected", es: "lo Inesperado" },
  28: { pt: "Inesperado", en: "the Unexpected", es: "lo Inesperado" },
  29: { pt: "Vasos", en: "Vessels", es: "Vasos" },
  30: { pt: "Vasos", en: "Vessels", es: "Vasos" },
  31: { pt: "Inesperado", en: "the Unexpected", es: "lo Inesperado" },
  32: { pt: "Maya", en: "Maya", es: "Maya" },
  33: { pt: "Quatro Caminhos", en: "the Four Ways", es: "los Cuatro Caminos" },
  34: { pt: "Dorminhoco", en: "the Sleeping Phoenix", es: "el Fénix Dormido" },
  35: { pt: "Consciência", en: "Consciousness", es: "Consciencia" },
  36: { pt: "Éden", en: "Eden", es: "Edén" },
  37: { pt: "Planejamento", en: "Planning", es: "Planificación" },
  38: { pt: "Dedicação", en: "Dedication", es: "Dedicación" },
  39: { pt: "Dedicação", en: "Dedication", es: "Dedicación" },
  40: { pt: "Planejamento", en: "Planning", es: "Planificación" },
  41: { pt: "Inesperado", en: "the Unexpected", es: "lo Inesperado" },
  42: { pt: "Maya", en: "Maya", es: "Maya" },
  43: { pt: "Explicação", en: "Explanation", es: "Explicación" },
  44: { pt: "Quatro Caminhos", en: "the Four Ways", es: "los Cuatro Caminos" },
  45: { pt: "Governante", en: "the Ruler", es: "el Gobernante" },
  46: { pt: "Amor", en: "Love", es: "Amor" },
  47: { pt: "Explicação", en: "Explanation", es: "Explicación" },
  48: { pt: "Consciência", en: "Consciousness", es: "Consciencia" },
  49: { pt: "Leis", en: "Laws", es: "Leyes" },
  50: { pt: "Leis", en: "Laws", es: "Leyes" },
  51: { pt: "Penetração", en: "Penetration", es: "Penetración" },
  52: { pt: "Serviço", en: "Service", es: "Servicio" },
  53: { pt: "Penetração", en: "Penetration", es: "Penetración" },
  54: { pt: "Penetração", en: "Penetration", es: "Penetración" },
  55: { pt: "Dorminhoco", en: "the Sleeping Phoenix", es: "el Fénix Dormido" },
  56: { pt: "Leis", en: "Laws", es: "Leyes" },
  57: { pt: "Penetração", en: "Penetration", es: "Penetración" },
  58: { pt: "Serviço", en: "Service", es: "Servicio" },
  59: { pt: "Dorminhoco", en: "the Sleeping Phoenix", es: "el Fénix Dormido" },
  60: { pt: "Leis", en: "Laws", es: "Leyes" },
  61: { pt: "Maya", en: "Maya", es: "Maya" },
  62: { pt: "Maya", en: "Maya", es: "Maya" },
  63: { pt: "Consciência", en: "Consciousness", es: "Consciencia" },
  64: { pt: "Consciência", en: "Consciousness", es: "Consciencia" },
};

// Determine the angle from profile lines
function getAngle(profile: string | null | undefined, lang: string): string {
  if (!profile) return '';
  
  // Extract first line number from profile like "4/6" or "1/3 - Description"
  const match = profile.match(/^(\d)\/(\d)/);
  if (!match) return '';
  
  const line1 = parseInt(match[1]);
  const line2 = parseInt(match[2]);

  // Right Angle: 1/3, 1/4, 2/4, 2/5, 3/5, 3/6
  // Juxtaposition: 4/6
  // Left Angle: 4/1, 5/1, 5/2, 6/2, 6/3
  
  if (line1 === 4 && line2 === 6) {
    return lang === 'pt' ? 'Cruz da Justaposição' :
           lang === 'es' ? 'Cruz de la Yuxtaposición' :
           'Juxtaposition Cross';
  }
  
  if (line1 >= 4) {
    return lang === 'pt' ? 'Cruz do Ângulo Esquerdo' :
           lang === 'es' ? 'Cruz del Ángulo Izquierdo' :
           'Left Angle Cross';
  }
  
  return lang === 'pt' ? 'Cruz do Ângulo Direito' :
         lang === 'es' ? 'Cruz del Ángulo Derecho' :
         'Right Angle Cross';
}

/**
 * Translate an Incarnation Cross from gate numbers to a localized name.
 * Input format: "14/8 | 29/30" (pSun/pEarth | dSun/dEarth)
 * Also supports legacy Portuguese name format for mock data.
 */
export function translateCross(
  crossValue: string | null | undefined,
  language: string,
  profile?: string | null
): string {
  if (!crossValue) return 'N/A';
  
  const lang = language === 'en' ? 'en' : language === 'es' ? 'es' : 'pt';
  
  // Try gate number format: "14/8 | 29/30"
  const gateMatch = crossValue.match(/^(\d+)\/(\d+)\s*\|\s*(\d+)\/(\d+)$/);
  if (gateMatch) {
    const sunGate = parseInt(gateMatch[1]);
    const crossTheme = crossByGate[sunGate];
    
    if (crossTheme) {
      const angle = getAngle(profile, lang);
      const theme = crossTheme[lang as keyof CrossNames];
      
      if (angle) {
        // Format: "Right Angle Cross of Explanation (14/8 | 29/30)"
        const connector = lang === 'en' ? ' of ' : 
                         lang === 'es' ? ' de ' : ' d';
        
        // Handle Portuguese connectors (da, do, das, dos, de)
        let fullName: string;
        if (lang === 'pt') {
          fullName = `${angle} ${getPtConnector(theme)}${theme}`;
        } else {
          fullName = `${angle}${connector}${theme}`;
        }
        
        return fullName;
      }
      
      // No profile available, just show theme name
      return lang === 'pt' ? `Cruz ${getPtConnector(theme)}${theme}` :
             lang === 'en' ? `Cross of ${theme}` :
             `Cruz de ${theme}`;
    }
    
    // Unknown gate, return raw value
    return crossValue;
  }
  
  // Fallback: return raw value (legacy format or unrecognized)
  return crossValue;
}

// Portuguese connectors for cross themes
function getPtConnector(theme: string): string {
  const connectors: Record<string, string> = {
    "Esfinge": "da ",
    "Leis": "das ",
    "Explicação": "da ",
    "Consciência": "da ",
    "Éden": "do ",
    "Contribuição": "da ",
    "Planejamento": "do ",
    "Amor": "do ",
    "Vasos": "dos ",
    "Inesperado": "do ",
    "Quatro Caminhos": "dos ",
    "Dorminhoco": "do ",
    "Governante": "do ",
    "Recipiente do Amor": "do ",
    "Maya": "de ",
    "Dedicação": "da ",
    "Penetração": "da ",
    "Serviço": "do ",
  };
  return connectors[theme] || 'de ';
}
