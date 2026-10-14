// Keep report vocabulary and AI instructions consistent without touching persisted data.
import { normalizeReportTerms, type ReportLanguage } from '../../supabase/functions/_shared/reportLanguage';
export { normalizeReportTerms };

// Copy values for display; keys, scores, flags and original objects remain untouched.
export function normalizeReportData<T>(value: T, language: ReportLanguage): T {
  if (typeof value === 'string') return normalizeReportTerms(value, language) as T;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(item => normalizeReportData(item, language)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      // Names, locations and encoded images are records, not interpretive copy.
      /^(user_?name|birth_date|birth_time|birth_location|bodygraph_image)$/i.test(key)
        ? item : normalizeReportData(item, language),
    ])) as T;
  }
  return value;
}