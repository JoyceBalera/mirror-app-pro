import { pdf } from '@react-pdf/renderer';
import { isReactPDFEnabled } from './pdfFeatureFlag';

// Legacy jsPDF generators
import { generateTestResultPDF } from './pdfGenerator';
import { generateHDReport, type HDReportData } from './generateHDReport';
import { generateIntegratedReport, type IntegratedReportData } from './generateIntegratedReport';

// New react-pdf documents
import { BigFivePDFDocument, getBigFiveFileName, type BigFivePDFData } from './pdfBigFiveDocument';
import { HDPDFDocument, getHDFileName, type HDPDFData } from './pdfHDDocument';
import {
  IntegratedPDFDocument,
  getIntegratedFileName,
  type IntegratedPDFData,
} from './pdfIntegratedDocument';

export interface BigFiveInput {
  language?: 'pt' | 'es' | 'en';
  userName?: string;
  testDate?: Date;
  aiAnalysis?: string;
  traitScores: Record<string, number>;
  facetScores: Record<string, Record<string, number>>;
  classifications: Record<string, string>;
}

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const normalizeBigFiveData = (data: BigFiveInput): BigFivePDFData => ({
  language: data.language || 'pt',
  userName: data.userName,
  testDate: data.testDate,
  aiAnalysis: data.aiAnalysis,
  traitScores: data.traitScores,
  facetScores: data.facetScores,
  classifications: data.classifications,
});

const normalizeHDData = (data: HDReportData): HDPDFData => ({
  language: data.language || 'pt',
  user_name: data.user_name,
  birth_date: data.birth_date,
  birth_time: data.birth_time,
  birth_location: data.birth_location,
  energy_type: data.energy_type,
  strategy: data.strategy,
  authority: data.authority,
  profile: data.profile,
  definition: data.definition,
  incarnation_cross: data.incarnation_cross,
  centers: data.centers,
  channels: data.channels,
  personality_activations: data.personality_activations,
  design_activations: data.design_activations,
  variables: data.variables,
  ai_analysis_full: data.ai_analysis_full,
  bodygraph_image: data.bodygraph_image,
});

const normalizeIntegratedData = (data: IntegratedReportData): IntegratedPDFData => ({
  language: data.language || 'pt',
  userName: data.userName,
  testDate: data.testDate,
  traitScores: data.traitScores,
  traitClassifications: data.traitClassifications,
  energyType: data.energyType,
  strategy: data.strategy,
  authority: data.authority,
  profile: data.profile,
  definition: data.definition,
  incarnationCross: data.incarnationCross,
  definedCenters: data.definedCenters,
  openCenters: data.openCenters,
  activeChannels: data.activeChannels,
  ai_analysis: data.ai_analysis,
  bodygraph_image: data.bodygraph_image,
});

export const generateBigFivePDF = async (data: BigFiveInput): Promise<void> => {
  if (isReactPDFEnabled('big-five')) {
    const normalized = normalizeBigFiveData(data);
    const blob = await pdf(<BigFivePDFDocument data={normalized} />).toBlob();
    triggerDownload(blob, getBigFiveFileName(normalized));
    return;
  }
  generateTestResultPDF(
    data.traitScores,
    data.facetScores,
    data.classifications,
    {
      language: data.language,
      userName: data.userName,
      testDate: data.testDate,
      aiAnalysis: data.aiAnalysis,
    }
  );
};

export const generateHumanDesignPDF = async (data: HDReportData): Promise<void> => {
  if (isReactPDFEnabled('human-design')) {
    const normalized = normalizeHDData(data);
    const blob = await pdf(<HDPDFDocument data={normalized} />).toBlob();
    triggerDownload(blob, getHDFileName(normalized));
    return;
  }
  await generateHDReport(data);
};

export const generateIntegratedPDF = async (data: IntegratedReportData): Promise<void> => {
  if (isReactPDFEnabled('integrated')) {
    const normalized = normalizeIntegratedData(data);
    const blob = await pdf(<IntegratedPDFDocument data={normalized} />).toBlob();
    triggerDownload(blob, getIntegratedFileName(normalized));
    return;
  }
  await generateIntegratedReport(data);
};
