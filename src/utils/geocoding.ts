// Serviço de Geocoding usando OpenStreetMap Nominatim (gratuito)
// Rate limit: 1 request per second
// Requer User-Agent para identificação

import { fromZonedTime } from 'date-fns-tz';

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface TimezoneResult {
  timezone: string;
  gmtOffset: number;
}

/**
 * Geocodifica um endereço/local usando a API Nominatim do OpenStreetMap
 * @param query - Nome do local (ex: "São Paulo, Brasil")
 * @returns Coordenadas e informações do local
 */
export async function geocodeLocation(query: string): Promise<GeocodingResult> {
  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&addressdetails=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HumanDesignCalculator/1.0 (contact@example.com)',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar localização: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Local não encontrado. Tente ser mais específico (ex: "São Paulo, SP, Brasil")');
    }
    
    const result = data[0];
    const address = result.address || {};
    
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      city: address.city || address.town || address.village || address.municipality,
      state: address.state,
      country: address.country
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Falha ao buscar coordenadas do local');
  }
}

/**
 * Obtém o timezone de um local usando a API gratuita TimeAPI.io
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Nome do timezone (ex: "America/Sao_Paulo")
 */
export async function getTimezoneFromCoords(lat: number, lon: number): Promise<TimezoneResult> {
  // Usar TimeAPI.io - API gratuita sem necessidade de API key
  const url = `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.warn('TimeAPI falhou, usando fallback baseado em longitude');
      return getTimezoneFallback(lon);
    }
    
    const data = await response.json();
    
    return {
      timezone: data.timeZone,
      gmtOffset: data.currentUtcOffset?.seconds ? data.currentUtcOffset.seconds / 3600 : 0
    };
  } catch (error) {
    console.warn('Erro ao buscar timezone, usando fallback:', error);
    return getTimezoneFallback(lon);
  }
}

/**
 * Fallback: estima timezone baseado na longitude
 * Menos preciso mas funciona offline
 */
function getTimezoneFallback(longitude: number): TimezoneResult {
  const offset = Math.round(longitude / 15);
  // Mapear offset para timezone mais comum
  const timezoneMap: Record<number, string> = {
    '-5': 'America/New_York',
    '-4': 'America/New_York', // EDT
    '-3': 'America/Sao_Paulo',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Berlin',
    '3': 'Europe/Moscow',
    '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo',
  };
  
  return {
    timezone: timezoneMap[offset] || 'UTC',
    gmtOffset: offset
  };
}

/**
 * Converte hora local de nascimento para UTC usando timezone correto
 * @param birthDate - Data no formato "YYYY-MM-DD"
 * @param birthTime - Hora no formato "HH:MM"
 * @param timezone - Nome do timezone (ex: "America/Sao_Paulo")
 * @returns Data em UTC
 */
export function convertLocalBirthToUTC(
  birthDate: string, 
  birthTime: string, 
  timezone: string
): Date {
  // Criar string de datetime local (birth_time pode vir como "HH:MM" ou "HH:MM:SS")
  const timeParts = birthTime.split(':');
  const normalizedTime = timeParts.length >= 3 ? birthTime : `${birthTime}:00`;
  const localDateTimeStr = `${birthDate}T${normalizedTime}`;
  
  // Usar date-fns-tz para converter corretamente
  // fromZonedTime converte de timezone local para UTC
  const utcDate = fromZonedTime(localDateTimeStr, timezone);
  
  return utcDate;
}

/**
 * Calcula o fuso horário aproximado baseado na longitude (deprecated - usar getTimezoneFromCoords)
 * @param longitude - Longitude em graus
 * @returns Offset UTC em horas
 */
export function estimateTimezone(longitude: number): number {
  return Math.round(longitude / 15);
}

/**
 * Converte hora local para UTC baseado na longitude (deprecated - usar convertLocalBirthToUTC)
 * @param localDate - Data/hora local
 * @param longitude - Longitude do local
 * @returns Data em UTC
 */
export function localToUTC(localDate: Date, longitude: number): Date {
  const timezoneOffset = estimateTimezone(longitude);
  const utcDate = new Date(localDate);
  utcDate.setHours(utcDate.getHours() - timezoneOffset);
  return utcDate;
}
