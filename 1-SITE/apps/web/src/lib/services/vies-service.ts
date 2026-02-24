import { db } from '@db';
import { systemKnowledge } from '@db/schema';
import { eq } from 'drizzle-orm';

export interface ViesCompanyData {
  name: string;
  address: string;
  countryCode: string;
  vatNumber: string;
  isValid: boolean;
}

/**
 *  VIES SERVICE (2026)
 * 
 * Verifieert BTW-nummers en haalt officile bedrijfsgegevens op via de VIES API.
 */
export class ViesService {
  private static instance: ViesService;
  private apiBase = 'https://viesapi.eu/api'; // We gebruiken de REST bridge voor snelheid

  public static getInstance(): ViesService {
    if (!ViesService.instance) {
      ViesService.instance = new ViesService();
    }
    return ViesService.instance;
  }

  /**
   * Valideert een BTW-nummer en haalt data op via de EU VIES API.
   */
  async validateVat(vatNumber: string): Promise<ViesCompanyData | null> {
    const cleanVat = vatNumber.replace(/[^A-Z0-9]/g, '').toUpperCase();
    const countryCode = cleanVat.substring(0, 2);
    const vatOnly = cleanVat.substring(2);

    console.log(` VIES check voor ${cleanVat}...`);

    try {
      // 🛡️ CHRIS-PROTOCOL: 5s internal timeout for VIES API (Nuclear 2026 upgrade)
      console.log(`[ViesService] Fetching: https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatOnly}`);
      const fetchPromise = fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatOnly}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Voices-Core-2026-VAT-Validator'
        }
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('VIES API timeout (5s)')), 5000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ViesService] API Error (${response.status}):`, errorText);
        throw new Error(`VIES API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[ViesService] API Response for ${cleanVat}:`, data);
      
      // 🛡️ CHRIS-PROTOCOL: Robust boolean check for VIES API (Godmode 2026)
      // The API returns 'isValid' or 'valid'. We check both and handle potential string values.
      const isValid = data.isValid === true || data.valid === true || String(data.isValid).toLowerCase() === 'true' || String(data.valid).toLowerCase() === 'true';
      
      return {
        name: data.name || data.user_name || '',
        address: data.address || '',
        countryCode: data.countryCode || countryCode,
        vatNumber: data.vatNumber || vatOnly,
        isValid: isValid
      };

    } catch (error) {
      console.error(' VIES API Error:', error);
      return null;
    }
  }
}
