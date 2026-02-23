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
      // 🛡️ CHRIS-PROTOCOL: 3s internal timeout for VIES API
      const fetchPromise = fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${vatOnly}`);
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('VIES API timeout (3s)')), 3000)
      );

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (!response.ok) {
        throw new Error(`VIES API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        name: data.name || '',
        address: data.address || '',
        countryCode: data.countryCode || countryCode,
        vatNumber: data.vatNumber || vatOnly,
        isValid: data.isValid || false
      };

    } catch (error) {
      console.error(' VIES API Error:', error);
      return null;
    }
  }
}
