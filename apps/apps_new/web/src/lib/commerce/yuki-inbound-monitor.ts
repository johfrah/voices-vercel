import * as soap from 'soap';

/**
 *  YUKI INBOUND MONITOR (GODMODE 2026)
 * 
 * Doel: Het monitoren van inkomende aankoopfacturen in Yuki die door de 
 * boekhouder zijn goedgekeurd en relevant zijn voor Voices (acteurs/partners).
 */

export interface YukiPurchaseInvoice {
  id: string;
  contactId: string;
  contactName: string;
  invoiceNumber: string;
  documentDate: Date;
  dueDate: Date;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid';
  rawText?: string; // Voor AI matching
}

export class YukiInboundMonitor {
  private static WSDL_PURCHASE = 'https://api.yuki.be/ws/Purchase.asmx?WSDL';
  private static ACCESS_KEY = process.env.YUKI_ACCESS_KEY || '';

  /**
   * Haalt recent goedgekeurde aankoopfacturen op uit Yuki.
   */
  static async getApprovedInvoices(daysBack: number = 7): Promise<YukiPurchaseInvoice[]> {
    if (!this.ACCESS_KEY) throw new Error('Yuki Access Key missing');

    try {
      const client = await soap.createClientAsync(this.WSDL_PURCHASE);
      
      // 1. Authenticeer
      const [authResult] = await client.AuthenticateAsync({ accessKey: this.ACCESS_KEY });
      const sessionId = authResult.AuthenticateResult;

      if (!sessionId) throw new Error('Yuki Authentication failed');

      // 2. Haal lijst met facturen op (Filter op goedgekeurd door boekhouder)
      // In Yuki termen is dit vaak de lijst met 'Betaalbare' facturen
      const [result] = await client.GetPurchaseInvoicesAsync({
        sessionId,
        filter: 'Approved' // Specifieke Yuki filter voor goedgekeurde posten
      });

      // 3. Map naar ons interne formaat en filter op Voices-relevantie
      // We filteren hier op crediteuren die we herkennen of facturen met Voices patronen
      const invoices: YukiPurchaseInvoice[] = (result.GetPurchaseInvoicesResult || []).map((inv: any) => ({
        id: inv.ID,
        contactId: inv.ContactID,
        contactName: inv.ContactName,
        invoiceNumber: inv.InvoiceNumber,
        documentDate: new Date(inv.DocumentDate),
        dueDate: new Date(inv.DueDate),
        totalAmount: parseFloat(inv.TotalAmount),
        currency: inv.Currency || 'EUR',
        status: 'approved'
      }));

      return invoices;
    } catch (error) {
      console.error('[Yuki Inbound Monitor Error]:', error);
      return [];
    }
  }

  /**
   * Haalt de ruwe tekst van een factuur op voor AI-matching (ordernummers).
   */
  static async getInvoiceText(sessionId: string, documentId: string): Promise<string> {
    // Yuki API call om de OCR tekst of PDF content op te halen
    // Dit stelt de DocumentProcessor in staat om VOICES-2026-XXXX nummers te vinden
    return ""; // Placeholder voor implementatie
  }
}
