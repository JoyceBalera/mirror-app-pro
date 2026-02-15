

# Blindar os Calculos do Human Design com Testes Rigorosos

## O que muda

Hoje os testes existem mas aceitam qualquer resultado. Vamos transforma-los em "guardas" que quebram imediatamente se qualquer calculo mudar.

## Mudancas

### 1. Fortalecer o teste do Einstein (arquivo existente)

**Arquivo:** `src/utils/__tests__/humanDesignCalculator.test.ts`

O teste do Einstein vai passar a exigir valores exatos:

- Tipo: exatamente "Gerador" (nao aceita "Gerador Manifestante")
- Perfil: exatamente "1/4"
- Canais completos: exatamente 25-51, 41-30 e 59-6
- Centros definidos: incluem sacral, g, heart, solar

Isso garante que se qualquer formula planetaria mudar, o teste falha.

### 2. Fortalecer o teste da Luciana (arquivo existente)

**Arquivo:** `src/utils/__tests__/humanDesignCalculator.test.ts`

O teste da Luciana (20/11/1982, Sao Bernardo do Campo) vai exigir:

- Perfil: exatamente "6/3"

Isso garante que o calculo com horario de verao brasileiro (UTC-2 em novembro 1982) continua correto.

### 3. Criar testes para a conversao de timezone (arquivo novo)

**Arquivo:** `src/utils/__tests__/geocoding.test.ts`

Testes unitarios para a funcao `convertLocalBirthToUTC`:

- "09:40" em Sao Paulo (novembro, horario de verao UTC-2) deve virar 11:40 UTC
- "09:40:00" (com segundos) deve dar o mesmo resultado (nao gerar data invalida)
- "11:30" em Berlin (CET, UTC+1) deve virar 10:30 UTC
- Resultado nunca deve ser NaN (data invalida)

Esses testes nao dependem de internet -- o timezone e passado como parametro.

## O que fica protegido apos a implementacao

| Tipo de erro | Teste que pega |
|---|---|
| Formula planetaria errada | Einstein: perfil e canais mudam |
| Conversao de longitude para gate errada | Tabela zodiacal de referencia (ja existe) |
| Timezone ignorado no recalculo | Geocoding: hora UTC sai errada |
| Horario de verao brasileiro errado | Luciana: perfil muda de 6/3 |
| birth_time com segundos duplicados | Geocoding: data invalida (NaN) |
| Data de design (88 graus) errada | Einstein: canais e tipo mudam |

## Secao Tecnica

### Mudancas no teste Einstein (linhas 261-268)

De:
```typescript
expect(['Gerador', 'Gerador Manifestante']).toContain(chart.type);
expect(definedCenters).toContain('sacral');
expect(chart.profile).toMatch(/^\d\/\d$/);
```

Para:
```typescript
expect(chart.type).toBe('Gerador');
expect(chart.profile).toBe('1/4');
const channelIds = completeChannels.map(c => c.id).sort();
expect(channelIds).toEqual(['25-51', '41-30', '59-6'].sort());
expect(definedCenters).toContain('sacral');
expect(definedCenters).toContain('g');
expect(definedCenters).toContain('heart');
expect(definedCenters).toContain('solar');
```

### Mudancas no teste Luciana (linhas 337-338)

De:
```typescript
expect(chart.type).toBeDefined();
expect(chart.profile).toMatch(/^\d\/\d$/);
```

Para:
```typescript
expect(chart.profile).toBe('6/3');
expect(chart.type).toBeDefined();
```

### Novo arquivo `src/utils/__tests__/geocoding.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { convertLocalBirthToUTC } from '@/utils/geocoding';

describe('convertLocalBirthToUTC', () => {
  it('converte hora local em Sao Paulo com DST (UTC-2) para UTC', () => {
    // Nov 1982: horario de verao ativo no Brasil (UTC-2)
    const result = convertLocalBirthToUTC('1982-11-20', '09:40', 'America/Sao_Paulo');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(11);
    expect(result.getUTCMinutes()).toBe(40);
  });

  it('lida com birth_time que ja inclui segundos', () => {
    const result = convertLocalBirthToUTC('1982-11-20', '09:40:00', 'America/Sao_Paulo');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(11);
    expect(result.getUTCMinutes()).toBe(40);
  });

  it('converte hora local em Berlin (CET) para UTC', () => {
    // Marco 1879: sem DST, CET = UTC+1
    const result = convertLocalBirthToUTC('1879-03-14', '11:30', 'Europe/Berlin');
    expect(isNaN(result.getTime())).toBe(false);
    expect(result.getUTCHours()).toBe(10);
    expect(result.getUTCMinutes()).toBe(30);
  });

  it('nunca retorna data invalida (NaN)', () => {
    const result = convertLocalBirthToUTC('2000-01-01', '12:00', 'UTC');
    expect(isNaN(result.getTime())).toBe(false);
  });
});
```

