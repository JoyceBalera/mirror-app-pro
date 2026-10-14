import { describe, expect, it } from 'vitest';
import { normalizeReportData } from '../reportLanguage';

describe('report display transformation preserves user records', () => {
  it('does not mutate stored access, scores, identifiers or personal data', () => {
    const source = {
      user_name: 'Human Design', birth_location: 'Centro', birth_time: '14:35',
      birth_date: '1984-04-07', bodygraph_image: 'data:image/png;base64,center',
      incarnation_cross: '14/8 | 29/30', centers: { head: true, ajna: false },
      traitScores: { neuroticism: 156, openness: 198 },
      integrated_report_available: true, has_big_five: true,
      ai_analysis: 'Desenho Humano',
    };
    const output = normalizeReportData(source, 'pt');
    expect(output).not.toBe(source);
    expect(output.user_name).toBe(source.user_name);
    expect(output.birth_location).toBe(source.birth_location);
    expect(output.birth_time).toBe('14:35');
    expect(output.birth_date).toBe('1984-04-07');
    expect(output.bodygraph_image).toBe(source.bodygraph_image);
    expect(output.incarnation_cross).toBe('14/8 | 29/30');
    expect(output.centers).toEqual({ head: true, ajna: false });
    expect(output.traitScores).toEqual({ neuroticism: 156, openness: 198 });
    expect(output.integrated_report_available).toBe(true);
    expect(output.has_big_five).toBe(true);
    expect(source.ai_analysis).toBe('Desenho Humano');
  });

  it('preserves report dates as Date objects', () => {
    const date = new Date('2026-10-14T00:17:00Z');
    const output = normalizeReportData({ testDate: date, traitScores: { openness: 300 } }, 'pt');
    expect(output.testDate).toBe(date);
    expect(output.testDate.toISOString()).toBe('2026-10-14T00:17:00.000Z');
    expect(output.traitScores.openness).toBe(300);
  });
});