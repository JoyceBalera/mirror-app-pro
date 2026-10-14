import ptTranslations from '../locales/pt/translation.json';

// Human Design Theory - Multi-language support for PDF generation
// This content is inserted directly in the PDF before the AI personalized analysis

export type PDFLanguage = 'pt' | 'es' | 'en';

export interface TheorySection {
  title: string;
  content: string;
}

export interface CenterTheory {
  id: string;
  name: string;
  function: string;
  importanceForWomen: string;
}

// Helper to get translations from i18n JSON structure
// This is used when we have access to the full translation object
export interface HDPdfTranslations {
  pageOf: string;
  createdBy: string;
  headerTitle: string;
  headerSubtitle: string;
  introText: string;
  birthDataTitle: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  profileTitle: string;
  energyType: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  bodygraphTitle: string;
  bodygraphFallback: string;
  summaryTemplate: string;
  centersIntroTitle: string;
  centersTitle: string;
  centersIntro: string;
  functionLabel: string;
  importanceLabel: string;
  centersNote: string;
  structureTitle: string;
  advancedVariablesTheory: string;
  yourCentersTitle: string;
  definedCenters: string;
  definedCentersDesc: string;
  openCenters: string;
  openCentersDesc: string;
  noCentersDefined: string;
  allCentersDefined: string;
  powerChannels: string;
  noChannels: string;
  yourVariablesTitle: string;
  digestion: string;
  environment: string;
  motivation: string;
  perspective: string;
  sense: string;
  analysisTitle: string;
  analysisSubtitle: string;
  fileName: string;
  centers: Record<string, string>;
  theory: {
    intro: TheorySection;
    centersTheory: Array<{
      id: string;
      name: string;
      function: string;
      importance: string;
    }>;
    elements: TheorySection[];
    variables: TheorySection[];
    gatesChannels: TheorySection;
    closing: TheorySection;
  };
}

// Date locale mapping
export const DATE_LOCALES: Record<PDFLanguage, string> = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US'
};

// Get center names for a specific language
export const getCenterNames = (translations: HDPdfTranslations): Record<string, string> => {
  return translations.centers;
};

// Get intro section from translations
export const getIntroSection = (translations: HDPdfTranslations): TheorySection => {
  return translations.theory.intro;
};

// Get centers theory from translations
export const getCentersTheory = (translations: HDPdfTranslations): CenterTheory[] => {
  return translations.theory.centersTheory.map(center => ({
    id: center.id,
    name: center.name,
    function: center.function,
    importanceForWomen: center.importance
  }));
};

// Get elements theory from translations
export const getElementsTheory = (translations: HDPdfTranslations): TheorySection[] => {
  return translations.theory.elements;
};

// Get advanced variables theory from translations
export const getAdvancedVariablesTheory = (translations: HDPdfTranslations): TheorySection[] => {
  return translations.theory.variables;
};

// Get gates and channels theory from translations
export const getGatesChannelsTheory = (translations: HDPdfTranslations): TheorySection => {
  return translations.theory.gatesChannels;
};

// Get closing theory from translations
export const getClosingTheory = (translations: HDPdfTranslations): TheorySection => {
  return translations.theory.closing;
};

// ============ LEGACY EXPORTS (for backwards compatibility) ============
// These are kept for any code that still imports them directly

const legacyTheory = ptTranslations.hdPdf.theory;
export const INTRO_SECTION: TheorySection = legacyTheory.intro;
export const CENTERS_THEORY: CenterTheory[] = legacyTheory.centersTheory.map(center => ({
  id: center.id, name: center.name, function: center.function, importanceForWomen: center.importance,
}));
export const ELEMENTS_THEORY: TheorySection[] = legacyTheory.elements;
export const ADVANCED_VARIABLES_THEORY: TheorySection[] = legacyTheory.variables;
export const GATES_CHANNELS_THEORY: TheorySection = legacyTheory.gatesChannels;
export const CLOSING_THEORY: TheorySection = legacyTheory.closing;
