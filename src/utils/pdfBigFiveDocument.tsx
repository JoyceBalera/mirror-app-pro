import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { sharedStyles, PAGE, CONTENT_WIDTH, COLORS } from './pdfSharedStyles';
import { PageWrapper, SectionTitle, TraitBar, MarkdownText } from './pdfSharedComponents';
import { TRAIT_LABELS } from '@/constants/scoring';
import { facetNames } from '@/utils/scoreCalculator';

export type PDFLanguage = 'pt' | 'es' | 'en';

export interface BigFivePDFData {
  language?: PDFLanguage;
  userName?: string;
  testDate?: Date;
  aiAnalysis?: string;
  traitScores: Record<string, number>;
  facetScores: Record<string, Record<string, number>>;
  classifications: Record<string, string>;
}

interface BigFivePDFDocumentProps {
  data: BigFivePDFData;
}

const DATE_LOCALES: Record<PDFLanguage, string> = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US',
};

const getTranslations = (lang: PDFLanguage) => {
  const translations = {
    pt: {
      headerTitle: 'MAPA DE PERSONALIDADE',
      headerSubtitle: 'Análise Comportamental Big Five',
      introText:
        'Este relatório apresenta uma análise detalhada do seu perfil de personalidade baseado no modelo Big Five, amplamente reconhecido na psicologia como uma das estruturas mais robustas para compreender as principais dimensões da personalidade humana.',
      participantLabel: 'Participante',
      dateLabel: 'Data',
      traitsHeader: 'GRANDES TRAÇOS DE PERSONALIDADE',
      detailHeader: 'DETALHAMENTO POR TRAÇO',
      detailSubtitle: 'Facetas e Scores Individuais',
      scoreLabel: 'Score',
      analysisHeader: 'ANÁLISE PERSONALIZADA',
      analysisSubtitle: 'Interpretação Detalhada do Seu Perfil',
      aboutHeader: 'SOBRE O BIG FIVE',
      aboutText: `O Mapa de Personalidade é baseado no modelo Big Five, um dos modelos de personalidade mais amplamente aceitos e validados na psicologia contemporânea. Ele mede cinco dimensões fundamentais que capturam as principais diferenças na personalidade humana:

Neuroticismo - Tendência a experimentar emoções negativas
Extroversão - Nível de energia e sociabilidade
Abertura - Curiosidade intelectual e criatividade
Amabilidade - Cooperação e consideração pelos outros
Conscienciosidade - Organização e autodisciplina

Cada traço é medido em um espectro, e não há pontuações "boas" ou "más" - apenas diferentes perfis de personalidade que refletem suas tendências naturais e preferências comportamentais.`,
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Criado por Luciana Belenton',
      fileName: 'mapa-personalidade',
      traits: {
        neuroticism: 'Neuroticismo',
        extraversion: 'Extroversão',
        openness: 'Abertura à Experiência',
        agreeableness: 'Amabilidade',
        conscientiousness: 'Conscienciosidade',
      },
      traitClassifications: {
        veryLow: 'Muito Baixo',
        low: 'Baixo',
        medium: 'Médio',
        high: 'Alto',
        veryHigh: 'Muito Alto',
      },
      facetClassifications: {
        veryLow: 'Muito Baixa',
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        veryHigh: 'Muito Alta',
      },
      facetNames: {
        N1: 'Ansiedade',
        N2: 'Hostilidade',
        N3: 'Depressão',
        N4: 'Autoconsciência',
        N5: 'Impulsividade',
        N6: 'Vulnerabilidade',
        E1: 'Calor',
        E2: 'Sociabilidade',
        E3: 'Assertividade',
        E4: 'Atividade',
        E5: 'Busca de Aventuras',
        E6: 'Emoções Positivas',
        O1: 'Fantasia',
        O2: 'Estética',
        O3: 'Sentimentos',
        O4: 'Ações',
        O5: 'Ideias',
        O6: 'Valores',
        A1: 'Confiança',
        A2: 'Franqueza',
        A3: 'Altruísmo',
        A4: 'Aquiescência',
        A5: 'Modéstia',
        A6: 'Sensibilidade',
        C1: 'Competência',
        C2: 'Ordem',
        C3: 'Sentido de Dever',
        C4: 'Esforço por Realização',
        C5: 'Autodisciplina',
        C6: 'Ponderação',
      },
    },
    es: {
      headerTitle: 'MAPA DE PERSONALIDAD',
      headerSubtitle: 'Análisis Conductual Big Five',
      introText:
        'Este informe presenta un análisis detallado de su perfil de personalidad basado en el modelo Big Five, ampliamente reconocido en psicología como una de las estructuras más robustas para compreender las principales dimensiones de la personalidad humana.',
      participantLabel: 'Participante',
      dateLabel: 'Fecha',
      traitsHeader: 'GRANDES RASGOS DE PERSONALIDAD',
      detailHeader: 'DETALLE POR RASGO',
      detailSubtitle: 'Facetas y Puntuaciones Individuales',
      scoreLabel: 'Puntuación',
      analysisHeader: 'ANÁLISIS PERSONALIZADO',
      analysisSubtitle: 'Interpretación Detallada de Su Perfil',
      aboutHeader: 'SOBRE EL BIG FIVE',
      aboutText: `El Mapa de Personalidad está basado en el modelo Big Five, uno de los modelos de personalidad más ampliamente aceptados y validados en la psicología contemporánea. Mide cinco dimensiones fundamentales que capturam las principales diferencias en la personalidad humana:

Neuroticismo - Tendencia a experimentar emociones negativas
Extraversión - Nivel de energía y sociabilidad
Apertura - Curiosidad intelectual y creatividad
Amabilidad - Cooperación y consideración hacia los demás
Responsabilidad - Organización y autodisciplina

Cada rasgo se mide en un espectro, y no hay puntuaciones "buenas" o "malas" - solo diferentes perfiles de personalidad que reflejan sus tendencias naturales y preferencias conductuales.`,
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Creado por Luciana Belenton',
      fileName: 'mapa-personalidad',
      traits: {
        neuroticism: 'Neuroticismo',
        extraversion: 'Extraversión',
        openness: 'Apertura a la Experiencia',
        agreeableness: 'Amabilidad',
        conscientiousness: 'Responsabilidad',
      },
      traitClassifications: {
        veryLow: 'Muy Bajo',
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto',
        veryHigh: 'Muy Alto',
      },
      facetClassifications: {
        veryLow: 'Muy Baja',
        low: 'Baja',
        medium: 'Media',
        high: 'Alta',
        veryHigh: 'Muy Alta',
      },
      facetNames: {
        N1: 'Ansiedad',
        N2: 'Hostilidad',
        N3: 'Depresión',
        N4: 'Autoconciencia',
        N5: 'Impulsividad',
        N6: 'Vulnerabilidad',
        E1: 'Calidez',
        E2: 'Sociabilidad',
        E3: 'Asertividad',
        E4: 'Actividad',
        E5: 'Búsqueda de Aventuras',
        E6: 'Emociones Positivas',
        O1: 'Fantasía',
        O2: 'Estética',
        O3: 'Sentimientos',
        O4: 'Acciones',
        O5: 'Ideas',
        O6: 'Valores',
        A1: 'Confianza',
        A2: 'Franqueza',
        A3: 'Altruismo',
        A4: 'Complacencia',
        A5: 'Modestia',
        A6: 'Sensibilidad',
        C1: 'Competencia',
        C2: 'Orden',
        C3: 'Sentido del Deber',
        C4: 'Esfuerzo por el Logro',
        C5: 'Autodisciplina',
        C6: 'Deliberación',
      },
    },
    en: {
      headerTitle: 'PERSONALITY MAP',
      headerSubtitle: 'Big Five Behavioral Analysis',
      introText:
        'This report presents a detailed analysis of your personality profile based on the Big Five model, widely recognized in psychology as one of the most robust frameworks for understanding the main dimensions of human personality.',
      participantLabel: 'Participant',
      dateLabel: 'Date',
      traitsHeader: 'BIG FIVE PERSONALITY TRAITS',
      detailHeader: 'TRAIT BREAKDOWN',
      detailSubtitle: 'Individual Facets and Scores',
      scoreLabel: 'Score',
      analysisHeader: 'PERSONALIZED ANALYSIS',
      analysisSubtitle: 'Detailed Interpretation of Your Profile',
      aboutHeader: 'ABOUT THE BIG FIVE',
      aboutText: `The Personality Map is based on the Big Five model, one of the most widely accepted and validated personality models in contemporary psychology. It measures five fundamental dimensions that capture the main differences in human personality:

Neuroticism - Tendency to experience negative emotions
Extraversion - Level of energy and sociability
Openness - Intellectual curiosity and creativity
Agreeableness - Cooperation and consideration for others
Conscientiousness - Organization and self-discipline

Each trait is measured on a spectrum, and there are no "good" or "bad" scores - just different personality profiles that reflect your natural tendencies and behavioral preferences.`,
      pageOf: 'Page {{current}} of {{total}}',
      createdBy: 'Created by Luciana Belenton',
      fileName: 'personality-map',
      traits: {
        neuroticism: 'Neuroticism',
        extraversion: 'Extraversion',
        openness: 'Openness to Experience',
        agreeableness: 'Agreeableness',
        conscientiousness: 'Conscientiousness',
      },
      traitClassifications: {
        veryLow: 'Very Low',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        veryHigh: 'Very High',
      },
      facetClassifications: {
        veryLow: 'Very Low',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        veryHigh: 'Very High',
      },
      facetNames: {
        N1: 'Anxiety',
        N2: 'Hostility',
        N3: 'Depression',
        N4: 'Self-Consciousness',
        N5: 'Impulsiveness',
        N6: 'Vulnerability',
        E1: 'Warmth',
        E2: 'Gregariousness',
        E3: 'Assertiveness',
        E4: 'Activity',
        E5: 'Excitement-Seeking',
        E6: 'Positive Emotions',
        O1: 'Fantasy',
        O2: 'Aesthetics',
        O3: 'Feelings',
        O4: 'Actions',
        O5: 'Ideas',
        O6: 'Values',
        A1: 'Trust',
        A2: 'Straightforwardness',
        A3: 'Altruism',
        A4: 'Compliance',
        A5: 'Modesty',
        A6: 'Tender-Mindedness',
        C1: 'Competence',
        C2: 'Order',
        C3: 'Dutifulness',
        C4: 'Achievement Striving',
        C5: 'Self-Discipline',
        C6: 'Deliberation',
      },
    },
  };
  return translations[lang] || translations.pt;
};

const normalizeKey = (k: string) =>
  k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizeTraitKey = (trait: string): keyof ReturnType<typeof getTranslations>['traits'] | null => {
  const mapping: Record<string, keyof ReturnType<typeof getTranslations>['traits']> = {
    neuroticism: 'neuroticism',
    neuroticismo: 'neuroticism',
    extraversion: 'extraversion',
    extroversao: 'extraversion',
    openness: 'openness',
    abertura: 'openness',
    'abertura a experiencia': 'openness',
    agreeableness: 'agreeableness',
    amabilidade: 'agreeableness',
    conscientiousness: 'conscientiousness',
    conscienciosidade: 'conscientiousness',
  };
  const direct = mapping[trait.toLowerCase()];
  if (direct) return direct;
  return mapping[normalizeKey(trait)] || null;
};

const getTraitLabelLocalized = (trait: string, t: ReturnType<typeof getTranslations>): string => {
  const normalizedKey = normalizeTraitKey(trait);
  if (normalizedKey) return t.traits[normalizedKey];
  return TRAIT_LABELS[trait] || trait;
};

const getFacetLabelLocalized = (facet: string, t: ReturnType<typeof getTranslations>): string => {
  return t.facetNames[facet as keyof typeof t.facetNames] || facetNames[facet] || facet;
};

const getTraitClassificationLocalized = (score: number, t: ReturnType<typeof getTranslations>): string => {
  if (score <= 108) return t.traitClassifications.veryLow;
  if (score <= 156) return t.traitClassifications.low;
  if (score <= 198) return t.traitClassifications.medium;
  if (score <= 246) return t.traitClassifications.high;
  return t.traitClassifications.veryHigh;
};

const getFacetClassificationLocalized = (score: number, t: ReturnType<typeof getTranslations>): string => {
  if (score <= 18) return t.facetClassifications.veryLow;
  if (score <= 26) return t.facetClassifications.low;
  if (score <= 33) return t.facetClassifications.medium;
  if (score <= 41) return t.facetClassifications.high;
  return t.facetClassifications.veryHigh;
};

const CoverPage: React.FC<{ data: BigFivePDFData; t: ReturnType<typeof getTranslations> }> = ({
  data,
  t,
}) => {
  const testDate = data.testDate || new Date();
  const dateStr = testDate.toLocaleDateString(DATE_LOCALES[data.language || 'pt']);

  return (
    <PageWrapper
      headerTitle={t.headerTitle}
      headerSubtitle={t.headerSubtitle}
      footerPageText={t.pageOf.replace('{{current}}', '1').replace('{{total}}', '{{total}}')}
      footerCredit={t.createdBy}
    >
      <View style={sharedStyles.introBox}>
        <Text style={sharedStyles.normalText}>{t.introText}</Text>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          {data.userName && (
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: COLORS.carmim }}>
              {t.participantLabel}: {data.userName}
            </Text>
          )}
          <Text
            style={{
              fontSize: 9,
              color: COLORS.lightText,
              marginLeft: data.userName ? 20 : 0,
            }}
          >
            {t.dateLabel}: {dateStr}
          </Text>
        </View>
      </View>
    </PageWrapper>
  );
};

const TraitsPage: React.FC<{ data: BigFivePDFData; t: ReturnType<typeof getTranslations> }> = ({
  data,
  t,
}) => {
  const normalizedScores: Record<string, number> = {};
  Object.entries(data.traitScores).forEach(([key, val]) => {
    const nk = normalizeKey(key);
    const ptMapping: Record<string, string> = {
      neuroticismo: 'neuroticism',
      extroversao: 'extraversion',
      abertura: 'openness',
      'abertura a experiencia': 'openness',
      amabilidade: 'agreeableness',
      conscienciosidade: 'conscientiousness',
    };
    const mapped = ptMapping[nk] || nk;
    normalizedScores[mapped] = val;
  });

  const traitOrder = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'];
  const traitEntries = traitOrder
    .filter((trait) => normalizedScores[trait] !== undefined)
    .map((trait) => [trait, normalizedScores[trait]] as [string, number]);

  return (
    <PageWrapper
      headerTitle={t.traitsHeader}
      footerPageText={t.pageOf}
      footerCredit={t.createdBy}
    >
      <View style={{ marginTop: 8 }}>
        {traitEntries.map(([trait, score]) => (
          <TraitBar
            key={trait}
            label={getTraitLabelLocalized(trait, t)}
            score={score}
            classification={getTraitClassificationLocalized(score, t)}
          />
        ))}
      </View>
    </PageWrapper>
  );
};

const FacetsPage: React.FC<{ data: BigFivePDFData; t: ReturnType<typeof getTranslations> }> = ({
  data,
  t,
}) => {
  const ptMapping: Record<string, string> = {
    neuroticismo: 'neuroticism',
    extroversao: 'extraversion',
    abertura: 'openness',
    'abertura a experiencia': 'openness',
    amabilidade: 'agreeableness',
    conscienciosidade: 'conscientiousness',
  };

  const normalizedScores: Record<string, number> = {};
  Object.entries(data.traitScores).forEach(([key, val]) => {
    const nk = normalizeKey(key);
    const mapped = ptMapping[nk] || nk;
    normalizedScores[mapped] = val;
  });

  const traitOrder = ['neuroticism', 'extraversion', 'openness', 'agreeableness', 'conscientiousness'];
  const traitEntries = traitOrder
    .filter((trait) => normalizedScores[trait] !== undefined)
    .map((trait) => [trait, normalizedScores[trait]] as [string, number]);

  return (
    <PageWrapper
      headerTitle={t.detailHeader}
      headerSubtitle={t.detailSubtitle}
      footerPageText={t.pageOf}
      footerCredit={t.createdBy}
    >
      {traitEntries.map(([trait, traitScore]) => {
        let traitFacets = data.facetScores[trait] || {};
        if (Object.keys(traitFacets).length === 0) {
          const originalKey = Object.keys(data.facetScores).find((k) => {
            const nk = normalizeKey(k);
            return ptMapping[nk] === trait || nk === trait;
          });
          if (originalKey) traitFacets = data.facetScores[originalKey];
        }
        const facetEntries = Object.entries(traitFacets);

        return (
          <View key={trait} wrap={false} style={{ marginBottom: 12 }}>
            <View style={sharedStyles.sectionLine} />
            <Text style={sharedStyles.sectionTitle}>{getTraitLabelLocalized(trait, t)}</Text>
            <Text style={sharedStyles.smallText}>
              {t.scoreLabel}: {traitScore} • {getTraitClassificationLocalized(traitScore, t)}
            </Text>
            {facetEntries.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                {facetEntries.map(([facetKey, facetScore]) => {
                  const classification = getFacetClassificationLocalized(facetScore, t);
                  const badgeColor =
                    facetScore <= 26 ? COLORS.warning : facetScore >= 33 ? COLORS.success : COLORS.carmim;
                  return (
                    <View
                      key={facetKey}
                      style={{
                        width: CONTENT_WIDTH / 2 - 3,
                        backgroundColor: COLORS.offWhite,
                        borderRadius: 4,
                        padding: 6,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View>
                        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: COLORS.darkText }}>
                          {getFacetLabelLocalized(facetKey, t)}
                        </Text>
                        <Text style={{ fontSize: 8, color: COLORS.lightText }}>{facetScore}</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: badgeColor,
                          borderRadius: 3,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ fontSize: 7, color: COLORS.white, fontFamily: 'Helvetica-Bold' }}>
                          {classification}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </PageWrapper>
  );
};

const AnalysisPage: React.FC<{ data: BigFivePDFData; t: ReturnType<typeof getTranslations> }> = ({
  data,
  t,
}) => {
  if (!data.aiAnalysis) return null;
  return (
    <PageWrapper
      headerTitle={t.analysisHeader}
      headerSubtitle={t.analysisSubtitle}
      footerPageText={t.pageOf}
      footerCredit={t.createdBy}
    >
      <MarkdownText text={data.aiAnalysis} />
    </PageWrapper>
  );
};

const AboutPage: React.FC<{ data: BigFivePDFData; t: ReturnType<typeof getTranslations> }> = ({
  t,
}) => (
  <PageWrapper
    headerTitle={t.aboutHeader}
    footerPageText={t.pageOf}
    footerCredit={t.createdBy}
  >
    <View style={sharedStyles.introBox}>
      <MarkdownText text={t.aboutText} />
    </View>
  </PageWrapper>
);

export const BigFivePDFDocument: React.FC<BigFivePDFDocumentProps> = ({ data }) => {
  const t = getTranslations(data.language || 'pt');

  return (
    <Document>
      <CoverPage data={data} t={t} />
      <TraitsPage data={data} t={t} />
      <FacetsPage data={data} t={t} />
      <AnalysisPage data={data} t={t} />
      <AboutPage data={data} t={t} />
    </Document>
  );
};

export const getBigFiveFileName = (data: BigFivePDFData): string => {
  const t = getTranslations(data.language || 'pt');
  const dateStr = (data.testDate || new Date())
    .toLocaleDateString(DATE_LOCALES[data.language || 'pt'])
    .replace(/\//g, '-');
  return data.userName
    ? `${t.fileName}-${data.userName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`
    : `${t.fileName}-${dateStr}.pdf`;
};
