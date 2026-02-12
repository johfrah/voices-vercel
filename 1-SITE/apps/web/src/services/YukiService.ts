import soap from 'soap';
import { create } from 'xmlbuilder2';

/**
 * ⚡ YUKI NUCLEAR SERVICE (2026)
 * 
 * Handles all SOAP communication with Yuki for invoicing and administration.
 */

export interface YukiInvoiceData {
  orderId: string | number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    companyName?: string;
    vatNumber?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    countryCode: string;
  };
  lines: Array<{
    description: string;
    quantity: number;
    price: number;
    vatType: number; // Yuki VAT types: 1=21%, 2=6%, 3=12%, 4=0%, etc.
  }>;
  paymentMethod: string;
}

export class YukiService {
  private static WSDL_SALES = 'https://api.yuki.be/ws/Sales.asmx?WSDL';
  private static ACCESS_KEY = process.env.YUKI_ACCESS_KEY || '';

  /**
   * Create a sales invoice in Yuki
   */
  static async createInvoice(data: YukiInvoiceData) {
    if (!this.ACCESS_KEY) {
      console.warn('Yuki Access Key missing, skipping Yuki sync');
      return { success: false, error: 'Yuki Access Key missing' };
    }

    try {
      const client = await soap.createClientAsync(this.WSDL_SALES);
      
      // 1. Authenticate (Get Session ID)
      const [authResult] = await client.AuthenticateAsync({ accessKey: this.ACCESS_KEY });
      const sessionId = authResult.AuthenticateResult;

      if (!sessionId) throw new Error('Yuki Authentication failed');

      // 2. Build the Yuki SalesInvoice XML
      const xml = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('SalesInvoices', { xmlns: 'http://www.theyukicompany.com/yuki' })
          .ele('SalesInvoice')
            .ele('Contact')
              .ele('ContactName').txt(data.customer.companyName || `${data.customer.firstName} ${data.customer.lastName}`).up()
              .ele('Email').txt(data.customer.email).up()
              .ele('CountryCode').txt(data.customer.countryCode).up()
              .ele('VatNumber').txt(data.customer.vatNumber || '').up()
            .up()
            .ele('InvoiceNumber').txt(`VOICES-${data.orderId}`).up()
            .ele('Reference').txt(`Order #${data.orderId}`).up()
            .ele('PaymentMethod').txt(this.mapPaymentMethod(data.paymentMethod)).up()
            // 🛡️ PEPPOL & AUTOMATION MANDATE (2026)
            // Voor Belgische klanten forceren we Peppol-ready verwerking
            .ele('SendMethod').txt(data.customer.countryCode === 'BE' ? 'Peppol' : 'Email').up()
            .ele('InvoiceLines')
              .ele(data.lines.map(line => ({
                InvoiceLine: {
                  Description: line.description,
                  Quantity: line.quantity,
                  Price: line.price,
                  VatType: line.vatType
                }
              })))
            .up()
          .up()
        .up()
        .end({ prettyPrint: true });

      // 3. Send to Yuki
      const [processResult] = await client.ProcessSalesInvoicesAsync({
        sessionId,
        xmlDoc: xml
      });

      return {
        success: true,
        invoiceId: processResult.ProcessSalesInvoicesResult,
        invoiceNumber: `VOICES-${data.orderId}`
      };
    } catch (error) {
      console.error('Error syncing with Yuki:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private static mapPaymentMethod(method: string): string {
    const map: Record<string, string> = {
      'ideal': 'iDEAL',
      'bancontact': 'Bancontact',
      'creditcard': 'CreditCard',
      'banktransfer': 'BankTransfer'
    };
    return map[method.toLowerCase()] || 'BankTransfer';
  }
}
