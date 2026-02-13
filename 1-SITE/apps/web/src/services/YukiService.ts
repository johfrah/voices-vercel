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
  poNumber?: string;
  isCreditNote?: boolean;
}

export interface YukiOutstandingInvoice {
  id: string;
  invoiceNr: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  openAmount: number;
  contactName: string;
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
            .ele('InvoiceNumber').txt(data.isCreditNote ? `VOICES-${new Date().getFullYear()}-CN-${data.orderId}` : `VOICES-${new Date().getFullYear()}-${data.orderId}`).up()
            .ele('Reference').txt(data.isCreditNote ? `Creditnota voor Order #${data.orderId}` : `Order #${data.orderId}`).up()
            .ele('PaymentMethod').txt(this.mapPaymentMethod(data.paymentMethod)).up()
            // 🛡️ B2B MANDATE: PO Number integration
            .ele('Remarks').txt(data.poNumber ? `PO: ${data.poNumber}` : '').up()
            // 🛡️ PEPPOL & AUTOMATION MANDATE (2026)
            // Voor Belgische klanten forceren we Peppol-ready verwerking
            .ele('SendMethod').txt(data.customer.countryCode === 'BE' ? 'Peppol' : 'Email').up()
            .ele('InvoiceLines')
              .ele(data.lines.map(line => ({
                InvoiceLine: {
                  Description: line.description,
                  Quantity: data.isCreditNote ? -Math.abs(line.quantity) : line.quantity,
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
      invoiceNumber: data.isCreditNote ? `VOICES-${new Date().getFullYear()}-CN-${data.orderId}` : `VOICES-${new Date().getFullYear()}-${data.orderId}`
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

  /**
   * 🏦 PONTO RECONCILIATION: Haalt openstaande posten op uit Yuki
   * voor synchronisatie met banktransacties.
   */
  static async getOutstandingInvoices(): Promise<YukiOutstandingInvoice[]> {
    if (!this.ACCESS_KEY) return [];

    try {
      const client = await soap.createClientAsync(this.WSDL_SALES);
      const [authResult] = await client.AuthenticateAsync({ accessKey: this.ACCESS_KEY });
      const sessionId = authResult.AuthenticateResult;

      if (!sessionId) throw new Error('Yuki Authentication failed');

      const [result] = await client.GetOutstandingInvoicesAsync({ sessionId });
      
      // Yuki returns a complex XML structure, we map it to a clean interface
      return (result.GetOutstandingInvoicesResult?.OutstandingInvoice || []).map((inv: any) => ({
        id: inv.ID,
        invoiceNr: inv.InvoiceNumber,
        invoiceDate: inv.InvoiceDate,
        dueDate: inv.DueDate,
        amount: parseFloat(inv.Amount),
        openAmount: parseFloat(inv.OpenAmount),
        contactName: inv.ContactName
      }));
    } catch (error) {
      console.error('Error fetching outstanding invoices from Yuki:', error);
      return [];
    }
  }
}
