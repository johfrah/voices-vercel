import * as soap from 'soap';
import { create } from 'xmlbuilder2';
import { db } from '@db';
import { systemEvents } from '@db/schema';

/**
 *  YUKI NUCLEAR SERVICE (2026)
 * 
 * Handles all SOAP communication with Yuki for invoicing and administration.
 */

export interface YukiInvoiceData {
  orderId: string | number;
  invoiceDate?: string; //  LEGACY: Ondersteuning voor specifieke factuurdatum
  paymentId?: string;   //  LEGACY: Mollie Transactie ID of PO referentie
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
    phone?: string;
    billing_po?: string;
    financial_email?: string;
  };
  lines: Array<{
    description: string;
    quantity: number;
    price: number;
    vatType: number; 
    vatPercentage?: number; //  LEGACY: Expliciet percentage
    remarks?: string;       //  LEGACY: Details per regel (Usage, etc.)
  }>;
  paymentMethod: string;
  poNumber?: string;
  isCreditNote?: boolean;
  originalInvoiceNumber?: string; //  LEGACY: Voor creditnota referentie
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

export class yuki-service {
  private static WSDL_SALES = 'https://api.yuki.be/ws/Sales.asmx?WSDL';
  private static WSDL_CONTACT = 'https://api.yuki.be/ws/Contact.asmx?WSDL';
  private static WSDL_ACCOUNTING_INFO = 'https://api.yuki.be/ws/AccountingInfo.asmx?WSDL';
  private static ACCESS_KEY = process.env.YUKI_ACCESS_KEY || '';
  private static ADMINISTRATION_ID = process.env.YUKI_ADMINISTRATION_ID || '';

  /**
   *  CONTACT UPSERT: Zoekt en werkt contacten bij in Yuki
   * Voorkomt dubbele entries en houdt de database zuiver.
   */
  static async upsertContact(customer: YukiInvoiceData['customer']) {
    if (!this.ACCESS_KEY) return null;

    try {
      const client = await soap.createClientAsync(this.WSDL_CONTACT);
      const [authResult] = await client.AuthenticateAsync({ accessKey: this.ACCESS_KEY });
      const sessionId = authResult.AuthenticateResult;

      if (!sessionId) throw new Error('Yuki Contact Authentication failed');

      // 1. Zoek bestaand contact op BTW-nummer of E-mail
      let contactId = null;
      const searchOption = customer.vatNumber ? 'VATNumber' : 'EmailAddress';
      const searchValue = customer.vatNumber || customer.email;

      const [searchResult] = await client.SearchContactsAsync({
        sessionID: sessionId,
        domainId: this.ADMINISTRATION_ID,
        searchOption,
        searchValue
      });

      if (searchResult.SearchContactsResult?.Contact) {
        const contacts = Array.isArray(searchResult.SearchContactsResult.Contact) 
          ? searchResult.SearchContactsResult.Contact 
          : [searchResult.SearchContactsResult.Contact];
        contactId = contacts[0].ID;
      }

      // 2. Bouw Contact XML voor Update/Create ( LEGACY PARITY)
      const xml = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('Contacts', { xmlns: 'urn:xmlns:http://www.theyukicompany.com:contacts' })
          .ele('Contact')
            .ele('FullName').txt(customer.companyName || `${customer.firstName} ${customer.lastName}`).up()
            .ele('VATNumber').txt(customer.vatNumber || '').up()
            .ele('ContactType').txt(customer.vatNumber ? 'Company' : 'Person').up()
            .ele('CountryCode').txt(customer.countryCode).up()
            .ele('City').txt(customer.city || '').up()
            .ele('Zipcode').txt(customer.zipCode || '').up()
            .ele('AddressLine_1').txt(customer.address || '').up()
            //  LEGACY: ContactPerson blok is essentieel voor Yuki
            .ele('ContactPerson')
              .ele('FirstName').txt(customer.firstName).up()
              .ele('LastName').txt(customer.lastName).up()
              .ele('EmailAddress').txt(customer.email).up()
            .up()
          .up()
        .up()
        .end({ prettyPrint: true });

      const xml_content_no_decl = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
      
      // Yuki verwacht de XML gewrapped in een SoapVar voor ANYXML
      const [updateResult] = await client.UpdateContactAsync({
        sessionId,
        domainId: this.ADMINISTRATION_ID,
        xmlDoc: { _xml: xml_content_no_decl }
      });

      return updateResult.UpdateContactResult;
    } catch (error) {
      console.error('Error upserting contact in Yuki:', error);
      return null;
    }
  }

  /**
   * Create a sales invoice in Yuki
   */
  static async createInvoice(data: YukiInvoiceData) {
    if (!this.ACCESS_KEY) {
      console.warn('Yuki Access Key missing, skipping Yuki sync');
      return { success: false, error: 'Yuki Access Key missing' };
    }

    try {
      //  LEGACY MANDATE: Eerst contact upserten om Yuki zuiver te houden
      await this.upsertContact(data.customer);

      const client = await soap.createClientAsync(this.WSDL_SALES);
      
      // 1. Authenticate (Get Session ID)
      const [authResult] = await client.AuthenticateAsync({ accessKey: this.ACCESS_KEY });
      const sessionId = authResult.AuthenticateResult;

      if (!sessionId) throw new Error('Yuki Authentication failed');

      // 2. Build the Yuki SalesInvoice XML ( LEGACY PARITY)
      const xml = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('SalesInvoices', { xmlns: 'urn:xmlns:http://www.theyukicompany.com:salesinvoices' })
          .ele('SalesInvoice')
            .ele('Reference').txt(`Order-${data.orderId}`).up()
            //  LEGACY: Subject bevat nu ook "Factuur" of "Creditnota"
            .ele('Subject').txt(`${data.isCreditNote ? 'Creditnota' : 'Factuur'} - Order-${data.orderId}${data.customer.billing_po ? ' - PO-' + data.customer.billing_po : ''}`).up()
            .ele('Process').txt('true').up()
            .ele('EmailToCustomer').txt('false').up()
            .ele('SentToPeppol').txt(data.customer.countryCode === 'BE' ? 'true' : 'false').up()
            .ele('Date').txt(data.invoiceDate || new Date().toISOString().split('T')[0]).up()
            .ele('DueDate').txt(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).up()
            .ele('Currency').txt('EUR').up()
            .ele('PaymentID').txt(data.paymentId || data.customer.billing_po || '').up()
            //  LEGACY: Uitgebreide Remarks met payment info en credit referentie
            .ele('Remarks').txt(
              `Ordernumber-${data.orderId}` +
              `${data.customer.billing_po ? ' | Customer-PO-' + data.customer.billing_po : ''}` +
              `${data.paymentId ? ' | Payment-' + data.paymentId : ''}` +
              `${data.customer.financial_email ? ' | Fin-Email-' + data.customer.financial_email : ''}` +
              `${data.isCreditNote && data.originalInvoiceNumber ? ' | Ref-Factuur-' + data.originalInvoiceNumber : ''}` +
              ` | Voices-OS-2026`
            ).up()
            .ele('Contact')
              .ele('FullName').txt(data.customer.companyName || `${data.customer.firstName} ${data.customer.lastName}`).up()
              .ele('VATNumber').txt(data.customer.vatNumber || '').up()
              .ele('ContactType').txt(data.customer.vatNumber ? 'Company' : 'Person').up()
              .ele('CountryCode').txt(data.customer.countryCode).up()
              .ele('City').txt(data.customer.city || '').up()
              .ele('Zipcode').txt(data.customer.zipCode || '').up()
              .ele('AddressLine_1').txt(data.customer.address || '').up()
              .ele('EmailAddress').txt(data.customer.email).up()
            .up()
            .ele('InvoiceLines')
              .ele(data.lines.map(line => ({
                InvoiceLine: {
                  Description: line.description,
                  Remarks: line.remarks || '', //  LEGACY: Extra details per regel
                  Quantity: data.isCreditNote ? -Math.abs(line.quantity) : line.quantity,
                  SalesPrice: line.price,
                  VATType: line.vatType,
                  VATPercentage: line.vatPercentage || (line.vatType === 1 ? 21.00 : 0.00), //  LEGACY: Expliciet percentage
                  VATIncluded: 'false'
                }
              })))
            .up()
          .up()
        .up()
        .end({ prettyPrint: true });

      const xml_content_no_decl = xml.replace(/^<\?xml[^>]*\?>\s*/, '');

      // 3. Send to Yuki
      const [processResult] = await client.ProcessSalesInvoicesAsync({
        sessionId,
        administrationId: this.ADMINISTRATION_ID,
        xmlDoc: { _xml: xml_content_no_decl }
      });

      return {
        success: true,
        invoiceId: processResult.ProcessSalesInvoicesResult,
        invoiceNumber: `PENDING-YUKI` // We don't know the number yet, Yuki assigns it
      };
    } catch (error) {
      console.error('Error syncing with Yuki:', error);
      
      // CHRIS-PROTOCOL: Log failure to system events for forensic recovery
      db.insert(systemEvents).values({
        level: 'error',
        source: 'yuki-service',
        message: `Failed to create invoice for Order-${data.orderId}`,
        details: { error: error instanceof Error ? error.message : String(error), orderId: data.orderId }
      }).catch(e => console.warn('[yuki-service] Failed to log system event:', e));

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
   *  ACCOUNTING INFO: Haalt bankrekening informatie en openstaande posten op
   */
  static async getAccountingInfo() {
    if (!this.ACCESS_KEY) return null;

    try {
      const client = await soap.createClientAsync(this.WSDL_ACCOUNTING_INFO);
      const [authResult] = await client.AuthenticateAsync({ accessKey: this.ACCESS_KEY });
      const sessionId = authResult.AuthenticateResult;

      if (!sessionId) throw new Error('Yuki AccountingInfo Authentication failed');

      // Haal bankrekeningen op voor Ponto-reconciliatie validatie
      const [bankResult] = await client.GetBankAccountsAsync({
        sessionID: sessionId,
        domainId: this.ADMINISTRATION_ID
      });

      return {
        bankAccounts: bankResult.GetBankAccountsResult?.BankAccount || []
      };
    } catch (error) {
      console.error('Error fetching accounting info from Yuki:', error);
      return null;
    }
  }

  /**
   *  PONTO RECONCILIATION: Haalt openstaande posten op uit Yuki
   * voor synchronisatie met banktransacties.
   */
  static async getOutstandingInvoices(): Promise<YukiOutstandingInvoice[]> {
    if (!this.ACCESS_KEY) return [];

    try {
      const client = await soap.createClientAsync(this.WSDL_ACCOUNTING_INFO);
      const [authResult] = await client.AuthenticateAsync({ accessKey: this.ACCESS_KEY });
      const sessionId = authResult.AuthenticateResult;

      if (!sessionId) throw new Error('Yuki AccountingInfo Authentication failed');

      const [result] = await client.GetOutstandingItemsAsync({
        sessionID: sessionId,
        administrationId: this.ADMINISTRATION_ID,
        type: 'Sales'
      });

      const items = result.GetOutstandingItemsResult?.OutstandingItem || [];
      const list = Array.isArray(items) ? items : [items];

      return list.map((item: any) => ({
        id: item.ID,
        invoiceNr: item.InvoiceNumber,
        invoiceDate: item.Date,
        dueDate: item.DueDate,
        amount: parseFloat(item.Amount),
        openAmount: parseFloat(item.OpenAmount),
        contactName: item.ContactName
      }));
    } catch (error) {
      console.error('Error fetching outstanding invoices from Yuki:', error);
      return [];
    }
  }
}
