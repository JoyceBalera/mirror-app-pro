import React from 'react';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { sharedStyles, COLORS } from './pdfSharedStyles';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
  <View style={sharedStyles.headerContainer} fixed>
    <Text style={sharedStyles.headerTitle}>{title}</Text>
    {subtitle && <Text style={sharedStyles.headerSubtitle}>{subtitle}</Text>}
    <View style={sharedStyles.headerLine} />
  </View>
);

interface FooterProps {
  pageText: string;
  credit: string;
}

export const Footer: React.FC<FooterProps> = ({ pageText, credit }) => (
  <View style={sharedStyles.footerContainer} fixed>
    <Text
      style={sharedStyles.footerPageText}
      render={({ pageNumber, totalPages }) =>
        pageText
          .replace('{{current}}', String(pageNumber))
          .replace('{{total}}', String(totalPages))
      }
      fixed
    />
    <Text style={sharedStyles.footerCredit}>{credit}</Text>
  </View>
);

interface PageWrapperProps {
  children: React.ReactNode;
  headerTitle: string;
  headerSubtitle?: string;
  footerPageText: string;
  footerCredit: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  headerTitle,
  headerSubtitle,
  footerPageText,
  footerCredit,
}) => (
  <Page size="A4" style={sharedStyles.page}>
    <Header title={headerTitle} subtitle={headerSubtitle} />
    <Footer pageText={footerPageText} credit={footerCredit} />
    {children}
  </Page>
);

interface SectionTitleProps {
  title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => (
  <View wrap={false}>
    <View style={sharedStyles.sectionLine} />
    <Text style={sharedStyles.sectionTitle}>{title}</Text>
  </View>
);

interface InfoCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, highlight }) => (
  <View style={[sharedStyles.infoCard, highlight && sharedStyles.infoCardHighlight]}>
    <Text style={[sharedStyles.label, highlight && { color: COLORS.goldLight }]}>{label}</Text>
    <Text style={[sharedStyles.value, highlight && { color: COLORS.white }]}>
      {value}
    </Text>
  </View>
);

interface TraitBarProps {
  label: string;
  score: number;
  classification: string;
  min?: number;
  max?: number;
}

export const TraitBar: React.FC<TraitBarProps> = ({
  label,
  score,
  classification,
  min = 60,
  max = 300,
}) => {
  const progress = Math.min(Math.max((score - min) / (max - min), 0), 1);
  const barColor = score <= 156 ? COLORS.warning : score >= 198 ? COLORS.success : COLORS.carmim;

  return (
    <View style={sharedStyles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ width: '40%' }}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10, color: COLORS.darkText }}>
            {label}
          </Text>
          <Text style={sharedStyles.smallText}>{classification}</Text>
        </View>
        <View style={{ width: '45%', flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, height: 6, backgroundColor: COLORS.dustyMauve, borderRadius: 3 }}>
            <View
              style={{
                width: `${progress * 100}%`,
                height: 6,
                backgroundColor: barColor,
                borderRadius: 3,
              }}
            />
          </View>
        </View>
        <Text style={{ width: '12%', textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 10, color: barColor }}>
          {Math.round(score)}
        </Text>
      </View>
    </View>
  );
};

interface BodygraphImageProps {
  image?: string;
  fallbackText: string;
}

export const BodygraphImage: React.FC<BodygraphImageProps> = ({ image, fallbackText }) => {
  if (!image) {
    return (
      <View style={[sharedStyles.card, { alignItems: 'center', justifyContent: 'center', height: 160 }]}>
        <Text style={sharedStyles.normalText}>{fallbackText}</Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <Image
        src={image}
        style={{ width: 200, height: 376 }}
        cache
      />
    </View>
  );
};

interface MarkdownTextProps {
  text: string;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({ text }) => {
  const cleaned = text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^\s*[-]{2,}\s*$/gm, '')
    .replace(/^\s*[•]{1,3}\s*$/gm, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const paragraphs = cleaned.split('\n\n').filter((p) => p.trim());

  return (
    <>
      {paragraphs.map((paragraph, idx) => {
        const trimmed = paragraph.trim();
        const isList = trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed);
        const isTitle =
          trimmed.length < 80 &&
          (trimmed.includes(' – ') ||
            trimmed.includes(':') ||
            trimmed.toUpperCase() === trimmed ||
            (/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(trimmed) && !trimmed.includes('.')));

        if (isTitle) {
          return (
            <View key={idx} wrap={false} style={{ marginTop: 8, marginBottom: 4 }}>
              <View style={{ width: 60, height: 1, backgroundColor: COLORS.gold, marginBottom: 4 }} />
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: COLORS.carmim }}>
                {trimmed}
              </Text>
            </View>
          );
        }

        if (isList) {
          const items = trimmed.split('\n').filter(Boolean);
          return (
            <View key={idx} style={{ marginLeft: 8, marginBottom: 6 }}>
              {items.map((item, i) => (
                <Text key={i} style={sharedStyles.normalText}>
                  {item.replace(/^[-•]\s*/, '• ')}
                </Text>
              ))}
            </View>
          );
        }

        return (
          <Text key={idx} style={[sharedStyles.normalText, { marginBottom: 6 }]}>
            {trimmed}
          </Text>
        );
      })}
    </>
  );
};
