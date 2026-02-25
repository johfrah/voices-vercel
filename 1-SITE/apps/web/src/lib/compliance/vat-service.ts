import { db } from '@/lib/system/db';
import { users, orders } from '@/lib/system/db';
import { eq } from "drizzle-orm";
import { DbService } from "../services/db-service";

/**
 *  NUCLEAR VAT SERVICE (2026)
 * 
 * Verantwoordelijk voor BTW-validatie via VIES en normalisatie van BTW-nummers.
 * Vervangt de PHP VIES Utility en VAT Helpers.
 */

export interface VATValidationResult {
  valid: boolean;
  companyName?: string;
  address?: string;
  countryCode: string;
  vatNumber: string;
  error?: string;
}

export class VatService {
  /**
   * Valideert een BTW-nummer via de officile EU VIES REST API.
   */
  static async validateVat(vatNumber: string, countryCode?: string): Promise<VATValidationResult> {
    // 1. Normaliseer het nummer
    const normalized = this.normalizeVatNumber(vatNumber, countryCode);
    if (!normalized) {
      return { valid: false, countryCode: countryCode || '', vatNumber, error: 'Ongeldig formaat' };
    }

    // Extraheer landcode en puur nummer
    const country = normalized.substring(0, 2);
    const pureNumber = normalized.substring(2);

    try {
      // 2. Roep VIES API aan
      const response = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${pureNumber}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 } // Cache resultaten voor een uur
      });

      if (!response.ok) {
        throw new Error(`VIES API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // VIES API retourneert 'isValid' of 'valid'
      const isValid = data.isValid || data.valid || false;

      return {
        valid: isValid,
        companyName: data.name || undefined,
        address: data.address || undefined,
        countryCode: country,
        vatNumber: pureNumber
      };

    } catch (error) {
      console.error('[Core VAT Service Error]:', error);
      return { 
        valid: false, 
        countryCode: country, 
        vatNumber: pureNumber, 
        error: 'VIES service onbereikbaar' 
      };
    }
  }

  /**
   * Normaliseert een BTW-nummer naar het standaard EU formaat (bijv. BE0123456789)
   */
  static normalizeVatNumber(vatNumber: string, countryCode?: string): string | null {
    if (!vatNumber) return null;

    // Verwijder alles behalve letters en cijfers
    let clean = vatNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // Als het al begint met een landcode (2 letters)
    if (/^[A-Z]{2}/.test(clean)) {
      return clean;
    }

    // Als er een landcode is meegegeven, voeg deze toe
    if (countryCode) {
      return countryCode.toUpperCase() + clean;
    }

    // Default naar BE als het 10 cijfers zijn en geen landcode
    if (clean.length === 10 && /^\d+$/.test(clean)) {
      return 'BE' + clean;
    }

    return clean;
  }

  /**
   * Slaat een gevalideerd BTW-nummer op bij een gebruiker via DbService
   */
  static async saveVatToUser(userId: number, vatNumber: string) {
    const validation = await this.validateVat(vatNumber);
    
    if (validation.valid) {
      await DbService.updateRecord(users, userId, {
        vatNumber: validation.countryCode + validation.vatNumber,
        companyName: validation.companyName || undefined,
        addressStreet: validation.address || undefined,
      });
    }

    return validation;
  }
}
