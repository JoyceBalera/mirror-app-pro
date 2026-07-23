import React from 'react';
import { Document, Text, View } from '@react-pdf/renderer';
import { sharedStyles, CONTENT_WIDTH, COLORS } from './pdfSharedStyles';
import { PageWrapper, SectionTitle, InfoCard, TraitBar, BodygraphImage, MarkdownText } from './pdfSharedComponents';

export type PDFLanguage = 'pt' | 'es' | 'en';

export interface IntegratedPDFData {
  language?: 'pt' | 'es' | 'en';
  userName?: string;
  testDate?: Date;
  traitScores: Record<string, number>;
  traitClassifications: Record<string, string>;
  energyType: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  incarnationCross: string;
  definedCenters: string[];
  openCenters: string[];
  activeChannels?: any[];
  ai_analysis: string;
  bodygraph_image?: string;
}

export type { IntegratedPDFData as IntegratedPDFDataType };

interface IntegratedPDFDocumentProps {
  data: IntegratedPDFData;
}

const DATE_LOCALES: Record<PDFLanguage, string> = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US',
};

const getTranslations = (lang: PDFLanguage) => {
  const translations = {
    pt: {
      headerTitle: 'BLUEPRINT PESSOAL',
      headerSubtitle: 'Mapa de Personalidade + Arquitetura Pessoal',
      introText:
        'Este relatório apresenta uma visão integrada do seu perfil, cruzando os resultados do seu Mapa de Personalidade com a sua Arquitetura Pessoal, revelando padrões únicos de comportamento e tomada de decisão.',
      participantLabel: 'Participante',
      dateLabel: 'Data',
      personalityMapTitle: 'MAPA DE PERSONALIDADE',
      personalArchitectureTitle: 'ARQUITETURA PESSOAL',
      bodygraphTitle: 'SEU BODYGRAPH',
      bodygraphFallback: 'Imagem do Bodygraph não disponível',
      activeChannels: 'Canais Ativos',
      noChannels: 'Nenhum canal completo',
      analysisTitle: 'ANÁLISE INTEGRADA',
      analysisSubtitle: 'Interpretação Detalhada do Seu Perfil',
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Criado por Luciana Belenton',
      fileName: 'Blueprint_Pessoal',
      hdLabels: {
        energyType: 'Tipo Energético',
        strategy: 'Estratégia',
        authority: 'Autoridade',
        profile: 'Perfil',
        definition: 'Definição',
        incarnationCross: 'Cruz de Encarnação',
      },
      centersSection: {
        defined: 'Definidos',
        open: 'Abertos',
        none: 'Nenhum',
      },
      classifications: {
        low: 'Baixo',
        medium: 'Médio',
        high: 'Alto',
      },
      traits: {
        Neuroticismo: 'Neuroticismo',
        Extroversão: 'Extroversão',
        'Abertura à Experiência': 'Abertura',
        Amabilidade: 'Amabilidade',
        Conscienciosidade: 'Conscienciosidade',
      },
    },
    es: {
      headerTitle: 'BLUEPRINT PERSONAL',
      headerSubtitle: 'Mapa de Personalidad + Arquitectura Personal',
      introText:
        'Este informe presenta una visión integrada de tu perfil, cruzando los resultados de tu Mapa de Personalidad con tu Arquitectura Personal, revelando patrones únicos de comportamiento y toma de decisiones.',
      participantLabel: 'Participante',
      dateLabel: 'Fecha',
      personalityMapTitle: 'MAPA DE PERSONALIDAD',
      personalArchitectureTitle: 'ARQUITECTURA PERSONAL',
      bodygraphTitle: 'TU BODYGRAPH',
      bodygraphFallback: 'Imagen del Bodygraph no disponible',
      activeChannels: 'Canales Activos',
      noChannels: 'Ningún canal completo',
      analysisTitle: 'ANÁLISIS INTEGRADO',
      analysisSubtitle: 'Interpretación Detallada de Tu Perfil',
      pageOf: 'Página {{current}} de {{total}}',
      createdBy: 'Creado por Luciana Belenton',
      fileName: 'Blueprint_Personal',
      hdLabels: {
        energyType: 'Tipo Energético',
        strategy: 'Estrategia',
        authority: 'Autoridad',
        profile: 'Perfil',
        definition: 'Definición',
        incarnationCross: 'Cruz de Encarnación',
      },
      centersSection: {
        defined: 'Definidos',
        open: 'Abiertos',
        none: 'Ninguno',
      },
      classifications: {
        low: 'Bajo',
        medium: 'Medio',
        high: 'Alto',
      },
      traits: {
        Neuroticismo: 'Neuroticismo',
        Extroversão: 'Extraversión',
        'Abertura à Experiência': 'Apertura',
        Amabilidade: 'Amabilidad',
        Conscienciosidade: 'Responsabilidad',
      },
    },
    en: {
      headerTitle: 'PERSONAL BLUEPRINT',
      headerSubtitle: 'Personality Map + Personal Architecture',
      introText:
        'This report presents an integrated view of your profile, combining the results of your Personality Map with your Personal Architecture, revealing unique patterns of behavior and decision-making.',
      participantLabel: 'Participant',
      dateLabel: 'Date',
      personalityMapTitle: 'PERSONALITY MAP',
      personalArchitectureTitle: 'PERSONAL ARCHITECTURE',
      bodygraphTitle: 'YOUR BODYGRAPH',
      bodygraphFallback: 'Bodygraph image not available',
      activeChannels: 'Active Channels',
      noChannels: 'No complete channels',
      analysisTitle: 'INTEGRATED ANALYSIS',
      analysisSubtitle: 'Detailed Interpretation of Your Profile',
      pageOf: 'Page {{current}} of {{total}}',
      createdBy: 'Created by Luciana Belenton',
      fileName: 'Personal_Blueprint',
      hdLabels: {
        energyType: 'Energy Type',
        strategy: 'Strategy',
        authority: 'Authority',
        profile: 'Profile',
        definition: 'Definition',
        incarnationCross: 'Incarnation Cross',
      },
      centersSection: {
        defined: 'Defined',
        open: 'Open',
        none: 'None',
      },
      classifications: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      },
      traits: {
        Neuroticismo: 'Neuroticism',
        Extroversão: 'Extraversion',
        'Abertura à Experiência': 'Openness',
        Amabilidade: 'Agreeableness',
        Conscienciosidade: 'Conscientiousness',
      },
    },
  };
  return translations[lang] || translations.pt;
};

type Translations = ReturnType<typeof getTranslations>;

const getClassificationLabel = (classification: string, t: Translations): string => {
  const normalized = (classification || '').toLowerCase();
  if (normalized === 'low' || normalized === 'baixo' || normalized === 'bajo') return t.classifications.low;
  if (normalized === 'high' || normalized === 'alto') return t.classifications.high;
  return t.classifications.medium;
};

const traitKeyVariants: Array<{ displayKey: keyof Translations['traits']; lookupKeys: string[] }> = [
  { displayKey: 'Neuroticismo', lookupKeys: ['neuroticism', 'Neuroticismo', 'neuroticismo'] },
  { displayKey: 'Extroversão', lookupKeys: ['extraversion', 'Extroversão', 'extroversão'] },
  {
    displayKey: 'Abertura à Experiência',
    lookupKeys: ['openness', 'Abertura à Experiência', 'abertura à experiência', 'Abertura', 'abertura'],
  },
  { displayKey: 'Amabilidade', lookupKeys: ['agreeableness', 'Amabilidade', 'amabilidade'] },
  { displayKey: 'Conscienciosidade', lookupKeys: ['conscientiousness', 'Conscienciosidade', 'conscienciosidade'] },
];

const CoverPage: React.FC<{ data: IntegratedPDFData; t: Translations }> = ({ data, t }) => {
  const testDate = data.testDate || new Date();
  const dateStr = testDate.toLocaleDateString(DATE_LOCALES[data.language || 'pt']);

  return (
    <PageWrapper
      headerTitle={t.headerTitle}
      headerSubtitle={t.headerSubtitle}
      footerPageText={t.pageOf}
      footerCredit={t.createdBy}
    >
      <View style={sharedStyles.introBox} wrap={false}>
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

const BigFivePage: React.FC<{ data: IntegratedPDFData; t: Translations }> = ({ data, t }) => {
  return (
    <PageWrapper headerTitle={t.personalityMapTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <View style={{ marginTop: 4 }}>
        {traitKeyVariants.map(({ displayKey, lookupKeys }) => {
          const matchedKey = lookupKeys.find((k) => data.traitScores[k] !== undefined);
          const score = matchedKey ? data.traitScores[matchedKey] : 0;
          const classification = matchedKey ? data.traitClassifications[matchedKey] || 'medium' : 'medium';
          const classLabel = getClassificationLabel(classification, t);
          const translatedTrait = t.traits[displayKey] || displayKey;

          return (
            <TraitBar key={displayKey} label={translatedTrait} score={score} classification={classLabel} />
          );
        })}
      </View>
    </PageWrapper>
  );
};

const HumanDesignPage: React.FC<{ data: IntegratedPDFData; t: Translations }> = ({ data, t }) => {
  const hdItems = [
    { label: t.hdLabels.energyType, value: data.energyType || 'N/A', highlight: true },
    { label: t.hdLabels.strategy, value: data.strategy || 'N/A', highlight: false },
    { label: t.hdLabels.authority, value: data.authority || 'N/A', highlight: false },
    { label: t.hdLabels.profile, value: data.profile || 'N/A', highlight: false },
    { label: t.hdLabels.definition, value: data.definition || 'N/A', highlight: false },
    { label: t.hdLabels.incarnationCross, value: data.incarnationCross || 'N/A', highlight: false },
  ];

  const definedCenters = data.definedCenters || [];
  const openCenters = data.openCenters || [];
  const definedText = definedCenters.length > 0 ? definedCenters.join(', ') : t.centersSection.none;
  const openText = openCenters.length > 0 ? openCenters.join(', ') : t.centersSection.none;

  const channels = data.activeChannels || [];

  return (
    <PageWrapper
      headerTitle={t.personalArchitectureTitle}
      footerPageText={t.pageOf}
      footerCredit={t.createdBy}
    >
      <View style={sharedStyles.infoGrid}>
        {hdItems.map((item, idx) => (
          <View key={idx} wrap={false} style={{ width: CONTENT_WIDTH / 2 - 4 }}>
            <InfoCard label={item.label} value={item.value} highlight={item.highlight} />
          </View>
        ))}
      </View>

      <View style={{ marginTop: 12 }} wrap={false}>
        <SectionTitle title={t.centersSection.defined} />
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.normalText}>{definedText}</Text>
        </View>
      </View>

      <View wrap={false}>
        <SectionTitle title={t.centersSection.open} />
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.normalText}>{openText}</Text>
        </View>
      </View>

      <View wrap={false}>
        <SectionTitle title={t.activeChannels} />
        <View style={sharedStyles.card}>
          {channels.length > 0 ? (
            channels.map((channel, idx) => (
              <Text key={idx} style={sharedStyles.normalText}>
                {'\u2022 '}
                {typeof channel === 'string'
                  ? channel
                  : channel?.name || channel?.label || JSON.stringify(channel)}
              </Text>
            ))
          ) : (
            <Text style={sharedStyles.normalText}>{t.noChannels}</Text>
          )}
        </View>
      </View>
    </PageWrapper>
  );
};

const BodygraphPage: React.FC<{ data: IntegratedPDFData; t: Translations }> = ({ data, t }) => {
  const channels = data.activeChannels || [];

  return (
    <PageWrapper headerTitle={t.bodygraphTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <BodygraphImage image={data.bodygraph_image} fallbackText={t.bodygraphFallback} />

      <View wrap={false} style={{ marginTop: 8 }}>
        <SectionTitle title={t.activeChannels} />
        <View style={sharedStyles.card}>
          {channels.length > 0 ? (
            channels.map((channel, idx) => (
              <Text key={idx} style={sharedStyles.normalText}>
                {'\u2022 '}
                {typeof channel === 'string'
                  ? channel
                  : channel?.name || channel?.label || JSON.stringify(channel)}
              </Text>
            ))
          ) : (
            <Text style={sharedStyles.normalText}>{t.noChannels}</Text>
          )}
        </View>
      </View>
    </PageWrapper>
  );
};

const AnalysisPage: React.FC<{ data: IntegratedPDFData; t: Translations }> = ({ data, t }) => {
  if (!data.ai_analysis) return null;
  return (
    <PageWrapper
      headerTitle={t.analysisTitle}
      headerSubtitle={t.analysisSubtitle}
      footerPageText={t.pageOf}
      footerCredit={t.createdBy}
    >
      <MarkdownText text={data.ai_analysis} />
    </PageWrapper>
  );
};

export const IntegratedPDFDocument: React.FC<IntegratedPDFDocumentProps> = ({ data }) => {
  const t = getTranslations(data.language || 'pt');

  return (
    <Document>
      <CoverPage data={data} t={t} />
      <BigFivePage data={data} t={t} />
      <HumanDesignPage data={data} t={t} />
      <BodygraphPage data={data} t={t} />
      <AnalysisPage data={data} t={t} />
    </Document>
  );
};

export const getIntegratedFileName = (data: IntegratedPDFData): string => {
  const t = getTranslations(data.language || 'pt');
  const dateStr = (data.testDate || new Date())
    .toLocaleDateString(DATE_LOCALES[data.language || 'pt'])
    .replace(/\//g, '-');
  return data.userName
    ? `${t.fileName}_${data.userName.toLowerCase().replace(/\s+/g, '-')}-${dateStr}.pdf`
    : `${t.fileName}-${dateStr}.pdf`;
};
