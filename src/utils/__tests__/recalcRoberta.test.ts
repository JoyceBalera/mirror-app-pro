import { describe, it, expect } from 'vitest';
import { calculateHumanDesignChart } from '../humanDesignCalculator';
import { convertLocalBirthToUTC } from '../geocoding';

describe('Recalculate Roberta - 02/06/1973 03:55 São José do Rio Preto', () => {
  it('should calculate and output DB update data', async () => {
    const location = { lat: -20.8113, lon: -49.3758, name: 'São José do Rio Preto, SP, Brasil' };
    const birthDateUTC = convertLocalBirthToUTC('1973-06-02', '03:55', 'America/Sao_Paulo');
    const chart = await calculateHumanDesignChart(birthDateUTC, location);
    
    const centersMap: Record<string, boolean> = {};
    chart.centers.forEach(c => { centersMap[c.id] = c.defined; });
    
    const completeChannels = chart.channels
      .filter(ch => ch.isComplete)
      .map(ch => ({ gates: ch.gates, name: ch.name }));
    
    const mapActivation = (a: any) => ({
      planet: a.planet,
      gate: a.gate,
      line: a.line,
      color: a.color,
      tone: a.tone,
      base: a.base,
    });

    console.log('ENERGY_TYPE:', chart.type);
    console.log('STRATEGY:', chart.strategy);
    console.log('AUTHORITY:', chart.authority);
    console.log('PROFILE:', chart.profile);
    console.log('DEFINITION:', chart.definition);
    console.log('CROSS:', chart.incarnationCross);
    console.log('CENTERS:', JSON.stringify(centersMap));
    console.log('CHANNELS:', JSON.stringify(completeChannels));
    console.log('GATES:', JSON.stringify(chart.allActivatedGates));
    console.log('PERSONALITY:', JSON.stringify(chart.personality.map(mapActivation)));
    console.log('DESIGN:', JSON.stringify(chart.design.map(mapActivation)));
    console.log('DESIGN_DATE:', chart.designDate.toISOString());
    
    expect(chart.type).toBe('Gerador Manifestante');
    expect(chart.profile).toBe('1/3');
  }, 30000);
});
