import { describe, it, expect } from 'vitest';
import { convertLocalBirthToUTC } from '@/utils/geocoding';

describe('convertLocalBirthToUTC', () => {
  it('converte hora local em São Paulo para UTC (date-fns-tz)', () => {
    // date-fns-tz usa UTC-3 para Nov 1982 (padrão IANA)
    const result = convertLocalBirthToUTC('1982-11-20', '09:40', 'America/Sao_Paulo');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(12);
    expect(result.getUTCMinutes()).toBe(40);
  });

  it('lida com birth_time que já inclui segundos', () => {
    const result = convertLocalBirthToUTC('1982-11-20', '09:40:00', 'America/Sao_Paulo');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(12);
    expect(result.getUTCMinutes()).toBe(40);
  });

  it('converte hora local em Berlin para UTC', () => {
    const result = convertLocalBirthToUTC('1879-03-14', '11:30', 'Europe/Berlin');
    expect(isNaN(result.getTime())).toBe(false);
    // 1879 Berlin usava LMT (+0:53:28), não CET padrão
    // O importante é que a data é válida e consistente
    expect(result.getUTCHours()).toBe(10);
  });

  it('converte hora em UTC sem alteração', () => {
    const result = convertLocalBirthToUTC('2000-01-01', '12:00', 'UTC');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(12);
    expect(result.getUTCMinutes()).toBe(0);
  });

  it('produz resultados consistentes entre chamadas', () => {
    const r1 = convertLocalBirthToUTC('1982-11-20', '09:40', 'America/Sao_Paulo');
    const r2 = convertLocalBirthToUTC('1982-11-20', '09:40', 'America/Sao_Paulo');
    expect(r1.getTime()).toBe(r2.getTime());
  });
});
