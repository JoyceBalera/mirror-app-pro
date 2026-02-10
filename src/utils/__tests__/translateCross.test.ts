import { describe, it, expect } from 'vitest';
import { translateCross } from '@/data/humanDesignCrosses';

describe('translateCross', () => {
  // User chart: 14/8 | 29/30, profile 4/6 → Juxtaposition Cross of Vessels
  it('should translate gate format to Portuguese', () => {
    const result = translateCross('14/8 | 29/30', 'pt', '4/6');
    expect(result).toBe('Cruz da Justaposição dos Vasos');
  });

  it('should translate gate format to English', () => {
    const result = translateCross('14/8 | 29/30', 'en', '4/6');
    expect(result).toBe('Juxtaposition Cross of Vessels');
  });

  it('should translate gate format to Spanish', () => {
    const result = translateCross('14/8 | 29/30', 'es', '4/6');
    expect(result).toBe('Cruz de la Yuxtaposición de Vasos');
  });

  // Right Angle (profile 1/3)
  it('should detect Right Angle from profile 1/3', () => {
    const result = translateCross('36/6 | 11/12', 'en', '1/3');
    expect(result).toBe('Right Angle Cross of Eden');
  });

  it('should detect Right Angle PT from profile 2/4', () => {
    const result = translateCross('36/6 | 11/12', 'pt', '2/4');
    expect(result).toBe('Cruz do Ângulo Direito do Éden');
  });

  // Left Angle (profile 5/1)
  it('should detect Left Angle from profile 5/1', () => {
    const result = translateCross('36/6 | 11/12', 'en', '5/1');
    expect(result).toBe('Left Angle Cross of Eden');
  });

  it('should detect Left Angle ES from profile 6/2', () => {
    const result = translateCross('36/6 | 11/12', 'es', '6/2');
    expect(result).toBe('Cruz del Ángulo Izquierdo de Edén');
  });

  // No profile → just theme
  it('should show theme only without profile', () => {
    const result = translateCross('14/8 | 29/30', 'en');
    expect(result).toBe('Cross of Vessels');
  });

  // Null/undefined
  it('should return N/A for null', () => {
    expect(translateCross(null, 'en')).toBe('N/A');
  });

  // Unknown gate format passthrough
  it('should passthrough unknown format', () => {
    expect(translateCross('Some Legacy Name', 'en')).toBe('Some Legacy Name');
  });
});
