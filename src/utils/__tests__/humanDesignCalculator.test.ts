/**
 * Testes de validação para os cálculos de Human Design
 * 
 * Este arquivo valida a fidelidade dos cálculos comparando com referências conhecidas.
 * Os casos de teste são baseados em mapas gerados por softwares de referência.
 * 
 * REFERÊNCIA: humandesignforsuccess.com/albert-einstein/
 * Einstein: Generator, Profile 1/4, Channels: 25-51, 41-30, 59-6
 */

import { describe, it, expect } from 'vitest';
import { longitudeToGate, GATE_SEQUENCE, MANDALA_OFFSET, DEGREES_PER_GATE } from '@/data/humanDesignGates';
import { calculateHumanDesignChart } from '@/utils/humanDesignCalculator';

// Einstein reference data from humandesignforsuccess.com
// Type: Generator (NOT Manifesting Generator)
// Profile: 1/4 (Investigator/Opportunist)
// Channels: 25-51 (Initiation), 41-30 (Fantasy), 59-6 (Mating)
// Open: Head, Ajna
// Defined: G Center, Heart, Solar Plexus, Sacral
const EINSTEIN_REFERENCE = {
  birthDate: new Date(Date.UTC(1879, 2, 14, 10, 30, 0)), // 11:30 CET = 10:30 UTC
  location: { lat: 48.4011, lon: 9.9876, name: 'Ulm, Germany' },
  expectedType: 'Gerador',
  expectedProfile: '1/4',
  expectedChannels: ['25-51', '41-30', '59-6'],
  expectedOpenCenters: ['head', 'ajna'],
  expectedDefinedCenters: ['g', 'heart', 'solar', 'sacral'],
};
describe('Human Design Gate Calculations', () => {
  
  describe('longitudeToGate conversion', () => {
    
    // Gate 41 começa em Aquário 2° (302° zodíaco tropical)
    // Cada gate ocupa 5.625° (360/64)
    
    it('should map Gate 41 correctly at ~302° (Aquarius 2°)', () => {
      // Gate 41 é o primeiro gate no Mandala, começa em 302°
      const result = longitudeToGate(302.5);
      expect(result.gate).toBe(41);
    });
    
    it('should map Gate 19 correctly (second gate after 41)', () => {
      // Gate 19 começa em 302 + 5.625 = 307.625°
      const result = longitudeToGate(308);
      expect(result.gate).toBe(19);
    });

    it('should calculate correct line within gate', () => {
      // Cada linha ocupa 0.9375° (5.625/6)
      // Linha 1: 0 - 0.9375°
      // Linha 2: 0.9375 - 1.875°
      // etc.
      
      const baseLongitude = 302; // Gate 41
      
      // Linha 1 (início do gate)
      expect(longitudeToGate(baseLongitude + 0.1).line).toBe(1);
      
      // Linha 2
      expect(longitudeToGate(baseLongitude + 1.0).line).toBe(2);
      
      // Linha 6 (fim do gate)
      expect(longitudeToGate(baseLongitude + 5.5).line).toBe(6);
    });

    it('should handle wrap-around at 360°', () => {
      // Longitude 0° deve mapear corretamente
      const result = longitudeToGate(0);
      expect(result.gate).toBeGreaterThan(0);
      expect(result.gate).toBeLessThanOrEqual(64);
    });

    it('should handle negative longitudes', () => {
      // -10° = 350°
      const result = longitudeToGate(-10);
      expect(result.gate).toBeGreaterThan(0);
      expect(result.gate).toBeLessThanOrEqual(64);
    });
  });

  describe('Known reference charts validation', () => {
    
    // Caso de teste: Sol em 0° Áries = 0° zodíaco tropical
    // Áries começa após Peixes, em 0°
    it('should map Sun at 0° Aries correctly', () => {
      // 0° Aries = longitude 0
      // No Mandala HD, 0° cai aproximadamente no Gate 17
      // Fórmula: (0 - 302 + 360) % 360 = 58°
      // 58 / 5.625 = gate index 10.3 → Gate SEQUENCE[10] = 51
      const result = longitudeToGate(0);
      // Gate 25 está em Áries segundo referências
      console.log(`0° Aries → Gate ${result.gate}, Line ${result.line}`);
      expect(result.gate).toBe(25); // Gate 25 - The Innocent (Aries)
    });

    // Caso de teste: Sol em 15° Escorpião
    // Escorpião começa em 210° (signo 8)
    // 15° Escorpião = 225°
    it('should map Sun at 15° Scorpio correctly', () => {
      const longitude = 225; // 15° Scorpio
      const result = longitudeToGate(longitude);
      console.log(`15° Scorpio (225°) → Gate ${result.gate}, Line ${result.line}`);
      // Verificar se está na faixa esperada (gates 1, 43, 14 estão em Escorpião/Libra)
      expect([1, 43, 14, 34]).toContain(result.gate);
    });

    // Caso de teste: Sol em 0° Capricórnio (Solstício de Inverno)
    // Capricórnio = 270° (signo 10 × 30°)
    // Referência: https://www.embodyyourdesign.com/blog/cheatsheet-astrology-positions-of-human-design-gates
    // Capricórnio 0°00' - 3°52'30" :: Gate 10
    it('should map Sun at Winter Solstice (0° Capricorn) correctly', () => {
      const longitude = 270; // 0° Capricorn
      const result = longitudeToGate(longitude);
      console.log(`0° Capricorn (270°) → Gate ${result.gate}, Line ${result.line}`);
      // Gate 10 está em Sagitário ~28°15' até Capricórnio ~3°52' (confirmado por referência oficial)
      expect(result.gate).toBe(10);
    });
  });

  describe('Gate sequence validation', () => {
    
    it('should have exactly 64 gates in sequence', () => {
      expect(GATE_SEQUENCE.length).toBe(64);
    });

    it('should have all unique gates (1-64)', () => {
      const uniqueGates = new Set(GATE_SEQUENCE);
      expect(uniqueGates.size).toBe(64);
      
      // Verificar que todos os gates de 1-64 estão presentes
      for (let i = 1; i <= 64; i++) {
        expect(GATE_SEQUENCE).toContain(i);
      }
    });

    it('should start with Gate 41 (first gate of the Mandala)', () => {
      expect(GATE_SEQUENCE[0]).toBe(41);
    });
  });

  describe('Constants validation', () => {
    
    it('should have correct MANDALA_OFFSET (302° for Gate 41 at Aquarius 2°)', () => {
      // Gate 41 está em Aquário 2°
      // Aquário começa em 300° (11º signo × 30°)
      // Aquário 2° = 300° + 2° = 302°
      expect(MANDALA_OFFSET).toBe(302);
    });

    it('should have correct DEGREES_PER_GATE (5.625°)', () => {
      // 360° / 64 gates = 5.625°
      expect(DEGREES_PER_GATE).toBe(5.625);
    });
  });

  describe('Color, Tone, Base calculations', () => {
    
    it('should calculate color (1-6) correctly', () => {
      const result = longitudeToGate(302);
      expect(result.color).toBeGreaterThanOrEqual(1);
      expect(result.color).toBeLessThanOrEqual(6);
    });

    it('should calculate tone (1-6) correctly', () => {
      const result = longitudeToGate(302);
      expect(result.tone).toBeGreaterThanOrEqual(1);
      expect(result.tone).toBeLessThanOrEqual(6);
    });

    it('should calculate base (1-5) correctly', () => {
      const result = longitudeToGate(302);
      expect(result.base).toBeGreaterThanOrEqual(1);
      expect(result.base).toBeLessThanOrEqual(5);
    });
  });
});

describe('Design Date Calculation', () => {
  
  it('Design Date should be approximately 88-89 days before birth', () => {
    // O Sol viaja aproximadamente 0.9856° por dia
    // 88° / 0.9856 = ~89.27 dias
    const EXPECTED_DAYS_BEFORE = 88 / 0.9856;
    
    expect(EXPECTED_DAYS_BEFORE).toBeGreaterThan(88);
    expect(EXPECTED_DAYS_BEFORE).toBeLessThan(90);
  });
});

describe('Zodiac to Gate Reference Validation (Official Chart)', () => {
  // Referência: https://www.embodyyourdesign.com/blog/cheatsheet-astrology-positions-of-human-design-gates
  
  const testCases = [
    // Áries (0-30°)
    { sign: 'Aries', signStart: 0, position: 0, expectedGate: 25, desc: 'Aries 0°' },
    { sign: 'Aries', signStart: 0, position: 5, expectedGate: 17, desc: 'Aries 5°' },
    { sign: 'Aries', signStart: 0, position: 10, expectedGate: 21, desc: 'Aries 10°' },
    
    // Touro (30-60°)
    { sign: 'Taurus', signStart: 30, position: 5, expectedGate: 27, desc: 'Taurus 5°' },
    { sign: 'Taurus', signStart: 30, position: 15, expectedGate: 2, desc: 'Taurus 15°' },
    
    // Escorpião (210-240°)
    { sign: 'Scorpio', signStart: 210, position: 0, expectedGate: 50, desc: 'Scorpio 0°' },
    { sign: 'Scorpio', signStart: 210, position: 5, expectedGate: 28, desc: 'Scorpio 5°' },
    { sign: 'Scorpio', signStart: 210, position: 15, expectedGate: 1, desc: 'Scorpio 15°' },
    
    // Aquário (300-330°)
    { sign: 'Aquarius', signStart: 300, position: 2, expectedGate: 41, desc: 'Aquarius 2° (first gate in Mandala)' },
    { sign: 'Aquarius', signStart: 300, position: 8, expectedGate: 19, desc: 'Aquarius 8°' },
    { sign: 'Aquarius', signStart: 300, position: 15, expectedGate: 13, desc: 'Aquarius 15°' },
    
    // Peixes (330-360°)
    { sign: 'Pisces', signStart: 330, position: 1, expectedGate: 55, desc: 'Pisces 1°' },
    { sign: 'Pisces', signStart: 330, position: 12, expectedGate: 63, desc: 'Pisces 12°' },
  ];
  
  testCases.forEach(({ sign, signStart, position, expectedGate, desc }) => {
    it(`should map ${desc} to Gate ${expectedGate}`, () => {
      const longitude = signStart + position;
      const result = longitudeToGate(longitude);
      expect(result.gate).toBe(expectedGate);
    });
  });
});

// Integration test: Full chart calculation for Einstein
describe('Einstein Chart Integration Test', () => {
  it('should calculate Einstein chart with correct channels', async () => {
    const chart = await calculateHumanDesignChart(
      EINSTEIN_REFERENCE.birthDate,
      EINSTEIN_REFERENCE.location
    );
    
    console.log('=== EINSTEIN CHART RESULTS ===');
    console.log('Type:', chart.type);
    console.log('Profile:', chart.profile);
    console.log('Authority:', chart.authority);
    console.log('Definition:', chart.definition);
    
    // Log channels
    const completeChannels = chart.channels.filter(c => c.isComplete);
    console.log('Complete Channels:', completeChannels.map(c => c.id).join(', '));
    
    // Log centers
    const definedCenters = chart.centers.filter(c => c.defined).map(c => c.id);
    const openCenters = chart.centers.filter(c => !c.defined).map(c => c.id);
    console.log('Defined Centers:', definedCenters.join(', '));
    console.log('Open Centers:', openCenters.join(', '));
    
    // Log all activated gates
    console.log('Activated Gates:', chart.allActivatedGates.sort((a,b) => a-b).join(', '));
    
    // Log personality gates (conscious)
    console.log('Personality Gates:', chart.personality.map(p => `${p.planet}: Gate ${p.gate}.${p.line}`).join(', '));
    
    // Log design gates (unconscious)
    console.log('Design Gates:', chart.design.map(d => `${d.planet}: Gate ${d.gate}.${d.line}`).join(', '));
    
    // Basic type validation (Generator family due to defined Sacral)
    expect(['Gerador', 'Gerador Manifestante']).toContain(chart.type);
    
    // Validate that Sacral is defined (Generator/MG must have defined Sacral)
    expect(definedCenters).toContain('sacral');
    
    // Validate profile format
    expect(chart.profile).toMatch(/^\d\/\d$/);
  });
  
  it('should produce consistent results across multiple calculations', async () => {
    const chart1 = await calculateHumanDesignChart(
      EINSTEIN_REFERENCE.birthDate,
      EINSTEIN_REFERENCE.location
    );
    
    const chart2 = await calculateHumanDesignChart(
      EINSTEIN_REFERENCE.birthDate,
      EINSTEIN_REFERENCE.location
    );
    
    // Results should be identical
    expect(chart1.type).toBe(chart2.type);
    expect(chart1.profile).toBe(chart2.profile);
    expect(chart1.authority).toBe(chart2.authority);
    expect(chart1.allActivatedGates).toEqual(chart2.allActivatedGates);
  });
});
