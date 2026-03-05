import { MarketManagerServer as MarketManager } from "@/lib/system/core/market-manager";

/**
 * ADMIN SERVICE (NUCLEAR 2026)
 * 
 * Centrale service voor alle admin-gerelateerde data fetches.
 * Doel: Consolidatie van API calls en afdwingen van Chris-Protocol.
 */
export class AdminService {
  private static BASE_URL = '/api/mailbox';

  /**
   * Haalt de inbox op voor een specifiek account en folder.
   */
  static async getInbox(options: {
    folder: string;
    account: string;
    limit?: number;
    offset?: number;
    sortByValue?: boolean;
  }) {
    const { folder, account, limit = 50, offset = 0, sortByValue = false } = options;
    const res = await fetch(`${this.BASE_URL}/inbox?limit=${limit}&offset=${offset}&folder=${folder}&account=${account}&sortByValue=${sortByValue}`);
    if (!res.ok) throw new Error(`Failed to fetch inbox: ${res.statusText}`);
    return res.json();
  }

  /**
   * Haalt folder counts op voor een specifiek account.
   */
  static async getFolderCounts(account: string) {
    const res = await fetch(`${this.BASE_URL}/folders/counts?account=${account}`);
    if (!res.ok) throw new Error(`Failed to fetch folder counts: ${res.statusText}`);
    return res.json();
  }

  /**
   * Start een volledige AI Brain Sync.
   */
  static async syncAiBrain() {
    const res = await fetch(`${this.BASE_URL}/sync`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to start AI Brain sync: ${res.statusText}`);
    return res.json();
  }

  /**
   * Zoekt in de mailbox (semantisch of tekstueel).
   */
  static async search(query: string, options: { account: string; folder?: string }) {
    const { account, folder = 'INBOX' } = options;
    const res = await fetch(`${this.BASE_URL}/search?q=${encodeURIComponent(query)}&account=${account}&folder=${folder}`);
    if (!res.ok) throw new Error(`Failed to search mailbox: ${res.statusText}`);
    return res.json();
  }

  /**
   * Haalt een specifiek e-mail bericht/thread op.
   */
  static async getMessage(messageId: string) {
    const res = await fetch(`${this.BASE_URL}/message/${messageId}`);
    if (!res.ok) throw new Error(`Failed to fetch message: ${res.statusText}`);
    return res.json();
  }

  /**
   * Archiveert een e-mail.
   */
  static async archiveMail(id: string | number) {
    const res = await fetch(`${this.BASE_URL}/archive/${id}`, { method: 'POST' });
    if (!res.ok) throw new Error(`Failed to archive mail: ${res.statusText}`);
    return res.json();
  }

  /**
   * Verstuurt een e-mail.
   */
  static async sendEmail(data: { to: string; subject: string; body: string }) {
    const res = await fetch(`${this.BASE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to send email: ${res.statusText}`);
    return res.json();
  }

  /**
   * Haalt Customer DNA op.
   */
  static async getCustomerDna(user_id: number) {
    const res = await fetch(`${this.BASE_URL}/customer-dna/${user_id}`);
    if (!res.ok) throw new Error(`Failed to fetch customer DNA: ${res.statusText}`);
    return res.json();
  }

  /**
   * Zoekt Customer DNA op basis van e-mail.
   */
  static async searchCustomerDna(email: string) {
    const res = await fetch(`${this.BASE_URL}/customer-dna/search?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error(`Failed to search customer DNA: ${res.statusText}`);
    return res.json();
  }

  /**
   * Haalt Project DNA op.
   */
  static async getProjectDna(projectId: string) {
    const res = await fetch(`${this.BASE_URL}/project-dna/${projectId}`);
    if (!res.ok) throw new Error(`Failed to fetch project DNA: ${res.statusText}`);
    return res.json();
  }

  /**
   * Haalt Mailbox Insights op.
   */
  static async getInsights(options: { startDate: string; endDate: string; compare?: boolean }) {
    const { startDate, endDate, compare = true } = options;
    const res = await fetch(`${this.BASE_URL}/insights?startDate=${startDate}&endDate=${endDate}&compare=${compare}`);
    if (!res.ok) throw new Error(`Failed to fetch insights: ${res.statusText}`);
    return res.json();
  }

  /**
   * Haalt FAQ voorstellen op.
   */
  static async getFaqProposals(options: { startDate: string; endDate: string }) {
    const { startDate, endDate } = options;
    const res = await fetch(`${this.BASE_URL}/faq-proposals?startDate=${startDate}&endDate=${endDate}`);
    if (!res.ok) throw new Error(`Failed to fetch FAQ proposals: ${res.statusText}`);
    return res.json();
  }
}
