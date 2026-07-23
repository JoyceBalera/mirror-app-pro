import React from 'react';
import { Document, View, Text } from '@react-pdf/renderer';
import { sharedStyles, COLORS, CONTENT_WIDTH } from './pdfSharedStyles';
import { PageWrapper, SectionTitle, InfoCard, BodygraphImage, MarkdownText } from './pdfSharedComponents';
import {
  getCenterNames,
  getIntroSection,
  getCentersTheory,
  getElementsTheory,
  getAdvancedVariablesTheory,
  getGatesChannelsTheory,
  getClosingTheory,
  HDPdfTranslations,
} from '@/data/humanDesignTheory';
import { translateCross } from '@/data/humanDesignCrosses';

import ptTranslations from '@/locales/pt/translation.json';
import esTranslations from '@/locales/es/translation.json';
import enTranslations from '@/locales/en/translation.json';

export interface HDPDFData {
  language?: 'pt' | 'es' | 'en';
  user_name?: string;
  birth_date: string; // YYYY-MM-DD
  birth_time: string;
  birth_location: string;
  energy_type: string;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition: string | null;
  incarnation_cross: string | null;
  centers: Record<string, boolean>;
  channels: Array<{ id: string; name?: string; isComplete?: boolean }>;
  personality_activations: any[];
  design_activations: any[];
  variables?: {
    digestion?: { primary?: string; level?: string; description?: string };
    environment?: { primary?: string; level?: string; description?: string };
    motivation?: { primary?: string; level?: string; description?: string };
    perspective?: { primary?: string; level?: string; description?: string };
    designSense?: { primary?: string; level?: string; description?: string };
  };
  ai_analysis_full: string;
  bodygraph_image?: string;
}


interface HDPDFDocumentProps {
  data: HDPDFData;
}

const DATE_LOCALES: Record<'pt' | 'es' | 'en', string> = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US',
};

const translationMap = {
  pt: ptTranslations,
  es: esTranslations,
  en: enTranslations,
};

const getTranslations = (language: 'pt' | 'es' | 'en'): HDPdfTranslations => {
  const map = translationMap[language] || translationMap.pt;
  return (map as any).hdPdf as HDPdfTranslations;
};

const formatDate = (dateStr: string, language: 'pt' | 'es' | 'en'): string => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, (month || 1) - 1, day || 1);
    return d.toLocaleDateString(DATE_LOCALES[language]);
  } catch {
    return dateStr;
  }
};

// ============= Cover Page =============

const CoverPage: React.FC<{ data: HDPDFData; t: HDPdfTranslations }> = ({ data, t }) => {
  const language = data.language || 'pt';
  const dateStr = formatDate(data.birth_date, language);
  const crossDisplay = translateCross(data.incarnation_cross, language, data.profile);

  return (
    <PageWrapper
      headerTitle={t.headerTitle}
      headerSubtitle={t.headerSubtitle}
      footerPageText={t.pageOf.replace('{{current}}', '1').replace('{{total}}', '{{total}}')}
      footerCredit={t.createdBy}
    >
      <View style={sharedStyles.introBox} wrap={false}>
        <Text style={sharedStyles.normalText}>{t.introText}</Text>
      </View>

      <View style={{ marginTop: 12 }} wrap={false}>
        <SectionTitle title={t.birthDataTitle} />
        {data.user_name && (
          <Text style={[sharedStyles.normalText, { marginBottom: 4 }]}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{'Participante: '}</Text>
            {data.user_name}
          </Text>
        )}
        <Text style={sharedStyles.normalText}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{`${t.birthDate}: `}</Text>
          {dateStr}
        </Text>
        <Text style={sharedStyles.normalText}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{`${t.birthTime}: `}</Text>
          {data.birth_time}
        </Text>
        <Text style={sharedStyles.normalText}>
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>{`${t.birthLocation}: `}</Text>
          {data.birth_location}
        </Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <SectionTitle title={t.profileTitle} />
        <View style={sharedStyles.infoGrid}>
          <InfoCard label={t.energyType} value={data.energy_type || 'N/A'} highlight />
          <InfoCard label={t.strategy} value={data.strategy || 'N/A'} />
          <InfoCard label={t.authority} value={data.authority || 'N/A'} />
          <InfoCard label={t.profile} value={data.profile || 'N/A'} />
          <InfoCard label={t.definition} value={data.definition || 'N/A'} />
          <InfoCard label={t.incarnationCross} value={crossDisplay} />
        </View>
      </View>
    </PageWrapper>
  );
};

// ============= Bodygraph Page =============

const BodygraphPage: React.FC<{ data: HDPDFData; t: HDPdfTranslations }> = ({ data, t }) => {
  const centerNames = getCenterNames(t);
  const definedCenterIds = Object.keys(data.centers || {}).filter((id) => data.centers[id]);
  const openCenterIds = Object.keys(centerNames).filter((id) => !data.centers?.[id]);
  const activeChannels = (data.channels || []).filter((c) => c.isComplete !== false);

  const summary = t.summaryTemplate
    ? t.summaryTemplate
        .replace('{{defined}}', String(definedCenterIds.length))
        .replace('{{open}}', String(openCenterIds.length))
        .replace('{{channels}}', String(activeChannels.length))
    : '';

  return (
    <PageWrapper headerTitle={t.bodygraphTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <BodygraphImage image={data.bodygraph_image} fallbackText={t.bodygraphFallback} />

      {!!summary && (
        <View style={sharedStyles.card} wrap={false}>
          <Text style={sharedStyles.normalText}>{summary}</Text>
        </View>
      )}

      <View style={{ marginTop: 4 }} wrap={false}>
        <Text style={[sharedStyles.cardTitle, { marginBottom: 4 }]}>{t.definedCenters}</Text>
        <Text style={sharedStyles.normalText}>
          {definedCenterIds.length > 0
            ? definedCenterIds.map((id) => centerNames[id] || id).join(', ')
            : t.noCentersDefined}
        </Text>
      </View>

      <View style={{ marginTop: 8 }} wrap={false}>
        <Text style={[sharedStyles.cardTitle, { marginBottom: 4 }]}>{t.openCenters}</Text>
        <Text style={sharedStyles.normalText}>
          {openCenterIds.length > 0
            ? openCenterIds.map((id) => centerNames[id] || id).join(', ')
            : t.allCentersDefined}
        </Text>
      </View>
    </PageWrapper>
  );
};

// ============= Theory: Intro + Centers Pages =============

const TheoryIntroPage: React.FC<{ t: HDPdfTranslations }> = ({ t }) => {
  const intro = getIntroSection(t);
  return (
    <PageWrapper headerTitle={t.centersIntroTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <SectionTitle title={intro.title} />
      <MarkdownText text={intro.content} />
    </PageWrapper>
  );
};

const CentersTheoryPage: React.FC<{ t: HDPdfTranslations; data: HDPDFData }> = ({ t, data }) => {
  const centersTheory = getCentersTheory(t);

  return (
    <PageWrapper headerTitle={t.centersTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <Text style={[sharedStyles.normalText, { marginBottom: 8 }]}>{t.centersIntro}</Text>

      {centersTheory.map((center) => {
        const isDefined = !!data.centers?.[center.id];
        return (
          <View key={center.id} style={sharedStyles.card} wrap={false}>
            <Text style={sharedStyles.cardTitle}>
              {center.name}
              {isDefined ? ' (*)' : ''}
            </Text>
            <Text style={[sharedStyles.normalText, { marginTop: 4 }]}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{`${t.functionLabel}: `}</Text>
              {center.function}
            </Text>
            <Text style={[sharedStyles.normalText, { marginTop: 4 }]}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{`${t.importanceLabel}: `}</Text>
              {center.importanceForWomen}
            </Text>
          </View>
        );
      })}

      <Text style={[sharedStyles.smallText, { marginTop: 4 }]}>{t.centersNote}</Text>
    </PageWrapper>
  );
};

// ============= Theory: Structure Elements Page =============

const StructureTheoryPage: React.FC<{ t: HDPdfTranslations }> = ({ t }) => {
  const elements = getElementsTheory(t);

  return (
    <PageWrapper headerTitle={t.structureTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      {elements.map((element, idx) => (
        <View key={idx} style={sharedStyles.card} wrap={false}>
          <Text style={sharedStyles.cardTitle}>{element.title}</Text>
          <Text style={[sharedStyles.normalText, { marginTop: 4 }]}>{element.content}</Text>
        </View>
      ))}
    </PageWrapper>
  );
};

// ============= Theory: Advanced Variables Page =============

const AdvancedVariablesTheoryPage: React.FC<{ t: HDPdfTranslations }> = ({ t }) => {
  const variables = getAdvancedVariablesTheory(t);

  return (
    <PageWrapper headerTitle={t.advancedVariablesTheory} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      {variables.map((variable, idx) => (
        <View key={idx} style={sharedStyles.card} wrap={false}>
          <Text style={sharedStyles.cardTitle}>{variable.title}</Text>
          <Text style={[sharedStyles.normalText, { marginTop: 4 }]}>{variable.content}</Text>
        </View>
      ))}
    </PageWrapper>
  );
};

// ============= Theory: Gates/Channels + Closing Page =============

const GatesChannelsClosingPage: React.FC<{ t: HDPdfTranslations }> = ({ t }) => {
  const gatesChannels = getGatesChannelsTheory(t);
  const closing = getClosingTheory(t);

  return (
    <PageWrapper headerTitle={gatesChannels.title} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <View wrap={false}>
        <SectionTitle title={gatesChannels.title} />
        <MarkdownText text={gatesChannels.content} />
      </View>

      <View style={{ marginTop: 12 }} wrap={false}>
        <SectionTitle title={closing.title} />
        <MarkdownText text={closing.content} />
      </View>
    </PageWrapper>
  );
};

// ============= User Centers Page =============

const UserCentersPage: React.FC<{ data: HDPDFData; t: HDPdfTranslations }> = ({ data, t }) => {
  const centerNames = getCenterNames(t);
  const definedCenterIds = Object.keys(centerNames).filter((id) => data.centers?.[id]);
  const openCenterIds = Object.keys(centerNames).filter((id) => !data.centers?.[id]);
  const activeChannels = (data.channels || []).filter((c) => c.isComplete !== false);

  return (
    <PageWrapper headerTitle={t.yourCentersTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <SectionTitle title={t.definedCenters} />
      <Text style={[sharedStyles.smallText, { marginBottom: 8 }]}>{t.definedCentersDesc}</Text>
      {definedCenterIds.length > 0 ? (
        <View style={sharedStyles.infoGrid}>
          {definedCenterIds.map((id) => (
            <View key={id} style={sharedStyles.infoCard} wrap={false}>
              <Text style={sharedStyles.value}>{centerNames[id] || id}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={sharedStyles.normalText}>{t.noCentersDefined}</Text>
      )}

      <View style={{ marginTop: 12 }}>
        <SectionTitle title={t.openCenters} />
        <Text style={[sharedStyles.smallText, { marginBottom: 8 }]}>{t.openCentersDesc}</Text>
        {openCenterIds.length > 0 ? (
          <View style={sharedStyles.infoGrid}>
            {openCenterIds.map((id) => (
              <View key={id} style={sharedStyles.infoCard} wrap={false}>
                <Text style={sharedStyles.value}>{centerNames[id] || id}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={sharedStyles.normalText}>{t.allCentersDefined}</Text>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <SectionTitle title={t.powerChannels} />
        {activeChannels.length > 0 ? (
          activeChannels.map((channel) => (
            <View key={channel.id} style={sharedStyles.card} wrap={false}>
              <Text style={sharedStyles.cardTitle}>{channel.name || channel.id}</Text>
            </View>
          ))
        ) : (
          <Text style={sharedStyles.normalText}>{t.noChannels}</Text>
        )}
      </View>
    </PageWrapper>
  );
};

// ============= User Variables Page =============

const VariableCard: React.FC<{ label: string; variable?: { primary?: string; level?: string; description?: string } }> = ({
  label,
  variable,
}) => {
  if (!variable) return null;
  return (
    <View style={sharedStyles.card} wrap={false}>
      <Text style={sharedStyles.cardTitle}>{label}</Text>
      {!!variable.primary && (
        <Text style={[sharedStyles.value, { marginTop: 4 }]}>{variable.primary}</Text>
      )}
      {!!variable.level && <Text style={sharedStyles.smallText}>{variable.level}</Text>}
      {!!variable.description && (
        <Text style={[sharedStyles.normalText, { marginTop: 4 }]}>{variable.description}</Text>
      )}
    </View>
  );
};

const UserVariablesPage: React.FC<{ data: HDPDFData; t: HDPdfTranslations }> = ({ data, t }) => {
  const variables = data.variables || {};

  return (
    <PageWrapper headerTitle={t.yourVariablesTitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
      <VariableCard label={t.digestion} variable={variables.digestion} />
      <VariableCard label={t.environment} variable={variables.environment} />
      <VariableCard label={t.motivation} variable={variables.motivation} />
      <VariableCard label={t.perspective} variable={variables.perspective} />
      <VariableCard label={t.sense} variable={variables.designSense} />
    </PageWrapper>
  );
};

// ============= AI Analysis Page =============

const AnalysisPage: React.FC<{ data: HDPDFData; t: HDPdfTranslations }> = ({ data, t }) => (
  <PageWrapper headerTitle={t.analysisTitle} headerSubtitle={t.analysisSubtitle} footerPageText={t.pageOf} footerCredit={t.createdBy}>
    <MarkdownText text={data.ai_analysis_full || ''} />
  </PageWrapper>
);

// ============= Document =============

export const HDPDFDocument: React.FC<HDPDFDocumentProps> = ({ data }) => {
  const language = data.language || 'pt';
  const t = getTranslations(language);

  return (
    <Document>
      <CoverPage data={data} t={t} />
      <BodygraphPage data={data} t={t} />
      <TheoryIntroPage t={t} />
      <CentersTheoryPage t={t} data={data} />
      <StructureTheoryPage t={t} />
      <AdvancedVariablesTheoryPage t={t} />
      <GatesChannelsClosingPage t={t} />
      <UserCentersPage data={data} t={t} />
      <UserVariablesPage data={data} t={t} />
      <AnalysisPage data={data} t={t} />
    </Document>
  );
};

export const getHDFileName = (data: HDPDFData): string => {
  const dateStr = data.birth_date || new Date().toISOString().split('T')[0];
  return `Arquitetura_Pessoal_${dateStr}.pdf`;
};
