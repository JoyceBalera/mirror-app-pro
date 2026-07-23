/**
 * Feature flag para alternar entre o gerador de PDF antigo (jsPDF)
 * e o novo (@react-pdf/renderer).
 *
 * A chave pode ser controlada por:
 * - Variável de ambiente VITE_USE_REACT_PDF (build time)
 * - localStorage key "use-react-pdf" (runtime, por usuário)
 *
 * Valores considerados "ligado": "true", "1", "yes" (case insensitive).
 */

export type PDFReportType = 'big-five' | 'human-design' | 'integrated';

const GLOBAL_KEY = 'use-react-pdf';

const parseFlag = (value: string | null): boolean => {
  if (!value) return false;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

const DEFAULT_ENABLED: Record<PDFReportType, boolean> = {
  'big-five': true,
  'human-design': true,
  integrated: true,
};

export const isReactPDFEnabled = (reportType?: PDFReportType): boolean => {
  // Build-time env var
  if (import.meta.env.VITE_USE_REACT_PDF !== undefined) {
    return parseFlag(String(import.meta.env.VITE_USE_REACT_PDF));
  }

  // Per-report localStorage override
  if (reportType) {
    try {
      const perReport = localStorage.getItem(`${GLOBAL_KEY}-${reportType}`);
      if (perReport !== null) return parseFlag(perReport);
    } catch {}
  }

  // Global localStorage override
  try {
    const global = localStorage.getItem(GLOBAL_KEY);
    if (global !== null) return parseFlag(global);
  } catch {}

  // Default: new @react-pdf/renderer generator ON for all report types
  return reportType ? DEFAULT_ENABLED[reportType] : true;
};

export const setReactPDFEnabled = (enabled: boolean, reportType?: PDFReportType): void => {
  const key = reportType ? `${GLOBAL_KEY}-${reportType}` : GLOBAL_KEY;
  localStorage.setItem(key, enabled ? 'true' : 'false');
};

export const resetReactPDFEnabled = (reportType?: PDFReportType): void => {
  const key = reportType ? `${GLOBAL_KEY}-${reportType}` : GLOBAL_KEY;
  localStorage.removeItem(key);
};
