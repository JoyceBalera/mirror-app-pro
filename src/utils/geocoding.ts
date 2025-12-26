// Serviço de Geocoding usando OpenStreetMap Nominatim (gratuito)
// Rate limit: 1 request per second
// Requer User-Agent para identificação

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
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
 * Calcula o fuso horário aproximado baseado na longitude
 * Nota: Esta é uma aproximação simples. Para precisão total, usar uma API de timezone
 * @param longitude - Longitude em graus
 * @returns Offset UTC em horas
 */
export function estimateTimezone(longitude: number): number {
  // Cada 15° de longitude = 1 hora de diferença
  // Negativo para oeste, positivo para leste de Greenwich
  return Math.round(longitude / 15);
}

/**
 * Converte hora local para UTC baseado na longitude
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
