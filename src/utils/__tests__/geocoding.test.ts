import { describe, it, expect } from 'vitest';
import { convertLocalBirthToUTC } from '@/utils/geocoding';

describe('convertLocalBirthToUTC', () => {
  
  it('converte hora local em Rio de Janeiro (UTC-3, sem DST) para UTC', () => {
    // Março 1974: sem horário de verão no Brasil, UTC-3
    const result = convertLocalBirthToUTC('1974-03-30', '09:40', 'America/Sao_Paulo');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(12);
    expect(result.getUTCMinutes()).toBe(40);
  });

  it('lida com birth_time que já inclui segundos', () => {
    const result = convertLocalBirthToUTC('1974-03-30', '09:40:00', 'America/Sao_Paulo');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(12);
    expect(result.getUTCMinutes()).toBe(40);
  });

  it('converte hora local em Berlin (1879, LMT offset) para UTC', () => {
    // Março 1879: Berlin usava LMT (Local Mean Time), offset ~+0:53:28
    // date-fns-tz pode aplicar o offset histórico diferente de CET exato
    const result = convertLocalBirthToUTC('1879-03-14', '11:30', 'Europe/Berlin');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(10);
    // Minutos podem variar devido ao LMT histórico (~36 em vez de 30)
    expect(result.getUTCMinutes()).toBeGreaterThanOrEqual(30);
    expect(result.getUTCMinutes()).toBeLessThanOrEqual(37);
  });

  it('nunca retorna data inválida (NaN)', () => {
    const result = convertLocalBirthToUTC('2000-01-01', '12:00', 'UTC');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(12);
    expect(result.getUTCMinutes()).toBe(0);
  });

  it('converte hora com timezone UTC sem alterar', () => {
    const result = convertLocalBirthToUTC('2000-06-15', '15:30', 'UTC');
    expect(result.getUTCHours()).toBe(15);
    expect(result.getUTCMinutes()).toBe(30);
  });
});
