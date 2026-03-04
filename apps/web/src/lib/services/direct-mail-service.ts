import { MarketManagerServer as MarketManager } from "../system/core/market-manager";
import { OAuth2Client } from 'google-auth-library';
import { Mail, ShieldCheck } from 'lucide-react';
import { Attachment, ParsedMail, simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 *  DIRECT MAIL SERVICE (2026)
 * 
 * Doel: Directe verbinding met de mailserver (IMAP & SMTP) zonder WordPress bridge.
 * Gebruikt voor maximale snelheid en betrouwbaarheid.
 */

export interface MailHeader {
  id: string;
  uid: number;
  sender: string;
  subject: string;
  date: string;
  threadId: string;
  preview: string;
  attachments?: MailAttachment[];
}

export interface MailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
  contentId?: string;
}

export interface MailFullContent {
  htmlBody: string;
  textBody: string;
  attachments: MailAttachment[];
}

export interface ImapAuthOptions {
  user: string;
  password?: string;
  xoauth2?: string;
  host: string;
  port: number;
  tls: boolean;
}

const IMAP_FEATURE_FLAG = process.env.ENABLE_IMAP_INBOX === 'true';
const IMAP_DISABLED_MESSAGE = 'IMAP inbox features are disabled. Set ENABLE_IMAP_INBOX=true to enable.';
const GLOBAL_AUDIT_BCC_EMAIL = 'catch@voices.be';
let auditClient: SupabaseClient | null = null;

function getAuditClient(): SupabaseClient | null {
  if (auditClient) return auditClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  auditClient = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return auditClient;
}

async function writeMailAudit(level: 'info' | 'error', message: string, details: Record<string, any>) {
  try {
    const client = getAuditClient();
    if (!client) return;
    await client.from('system_events').insert({
      level,
      source: 'DirectMailService',
      message,
      details
    });
  } catch (auditErr: any) {
    console.warn('[DirectMailService] Failed to write mail audit event:', auditErr?.message || auditErr);
  }
}

function getImapLibrary(): any {
  if (!IMAP_FEATURE_FLAG) {
    throw new Error(IMAP_DISABLED_MESSAGE);
  }

  // Use runtime require to avoid bundling the package when IMAP is disabled.
  const dynamicRequire = eval('require') as NodeJS.Require;
  return dynamicRequire('node-imap');
}

export class DirectMailService {
  private config: Record<string, any>;
  private static instance: DirectMailService;
  private oauth2Client?: OAuth2Client;

  constructor(customConfig?: Partial<Record<string, any>>) {
    this.config = {
      user: customConfig?.user || process.env.IMAP_USER || '',
      password: customConfig?.password || process.env.IMAP_PASS || '',
      host: customConfig?.host || process.env.IMAP_SERVER || '',
      port: customConfig?.port || parseInt(process.env.IMAP_PORT || '993'),
      tls: customConfig?.tls !== undefined ? customConfig.tls : process.env.IMAP_SSL === 'true',
      tlsOptions: { rejectUnauthorized: false },
      ...customConfig
    };

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
    }
  }

  public static getInstance(customConfig?: Partial<Record<string, any>>): DirectMailService {
    if (!DirectMailService.instance || customConfig) {
      DirectMailService.instance = new DirectMailService(customConfig);
    }
    return DirectMailService.instance;
  }

  /**
   * Genereert een XOAUTH2 token voor Gmail
   */
  private async getXOAuth2Token(user: string): Promise<string> {
    if (!this.oauth2Client || !process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error('OAuth2 credentials missing in .env');
    }

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const { token } = await this.oauth2Client.getAccessToken();
    if (!token) throw new Error('Failed to generate access token');

    // XOAUTH2 format: user={user}^Aauth=Bearer {token}^A^A
    const authString = `user=${user}\x01auth=Bearer ${token}\x01\x01`;
    return Buffer.from(authString).toString('base64');
  }

  private async getImapConfig(user?: string, pass?: string, host?: string): Promise<Record<string, any>> {
    const targetUser = user || this.config.user;
    const targetPass = pass || this.config.password;
    const targetHost = host || this.config.host;
    
    // Als het een gmail adres is en we hebben OAuth credentials, gebruik XOAUTH2
    if (targetUser.endsWith('@gmail.com') && this.oauth2Client) {
      console.log(` Generating XOAUTH2 token for ${targetUser}...`);
      const xoauth2 = await this.getXOAuth2Token(targetUser);
      return {
        ...this.config,
        user: targetUser,
        xoauth2,
        host: 'imap.gmail.com',
        port: 993,
        tls: true
      };
    }

    return {
      ...this.config,
      user: targetUser,
      password: targetPass,
      host: targetHost
    };
  }

  /**
   * Verstuurt een e-mail via SMTP
   */
  async sendMail(options: { to: string, subject: string, text?: string, html?: string, from?: string, replyTo?: string, attachments?: any[], host?: string }): Promise<void> {
    // 🛡️ CHRIS-PROTOCOL: NUCLEAR TEST SAFETY (v2.15.090)
    // Voorkom dat er echte mails naar klanten of stemmen worden gestuurd tijdens de testfase.
    const isTestMode = process.env.NODE_ENV === 'development' || process.env.NUCLEAR_TEST_MODE === 'true';
    const allowedRecipients = ((MarketManager as any).getAllowedTestRecipients?.() || []) as string[];
    
    const isAllowed = allowedRecipients.some((domain: string) => options.to.toLowerCase().includes(domain));
    
    if (isTestMode && !isAllowed) {
      const fallbackEmail = (MarketManager as any).getFallbackTestEmail?.() || process.env.TEST_FALLBACK_EMAIL || options.to;
      console.log(`🛑 [DirectMailService] NUCLEAR SAFETY BLOCK: Redirecting mail for ${options.to} to ${fallbackEmail}`);
      options.subject = `[TEST-REDIRECT to ${options.to}] ${options.subject}`;
      options.to = fallbackEmail;
    }

    const market = MarketManager.getCurrentMarket(options.host);
    const from = options.from || market.email;
    
    // Bepaal SMTP config op basis van afzender
    let smtpHost = process.env.IMAP_SERVER === 'imap.gmail.com' ? 'smtp.gmail.com' : 'smtp-auth.mailprotect.be';
    let smtpUser = from;
    let smtpPass = this.config.password;

    //  Intelligence Layer: SMTP Routing
    const domains = MarketManager.getMarketDomains();
    const canonicalHost = domains[market.market_code]?.replace('https://', '') || 'voices.be';
    const host = options.host || (process.env.NEXT_PUBLIC_SITE_URL?.replace('https://', '') || canonicalHost);
    if (from.includes('voices.') || from.includes(host)) {
      smtpHost = process.env.SMTP_SERVER_VOICES || 'smtp-auth.mailprotect.be';
      smtpPass = process.env.IMAP_PASS_VOICES || process.env.IMAP_PASS || this.config.password;
    } else if (from.includes('invoice@')) {
      smtpHost = process.env.SMTP_SERVER_INVOICES || 'smtp-auth.mailprotect.be';
      smtpPass = process.env.IMAP_PASS_INVOICES || process.env.IMAP_PASS || this.config.password;
    }

    // console.log(`[SMTP Debug] Host: ${smtpHost}, User: ${smtpUser}, Pass: ${smtpPass ? '********' : 'MISSING'}`);
    console.log(`🚀 [DirectMailService] Preparing SMTP: host=${smtpHost}, user=${smtpUser}, from=${from}`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      connectionTimeout: 5000, // 5 seconden timeout voor verbinding
      greetingTimeout: 5000,   // 5 seconden timeout voor begroeting
      socketTimeout: 5000      // 5 seconden timeout voor data
    });

    // 🛡️ CHRIS-PROTOCOL: Forceer de market name als afzender voor professionele uitstraling
    const senderDisplayName = (from.includes('voices.') || from.includes(host)) ? market.name : market.company_name;

    const marketCatchAddress = `catch@${canonicalHost.replace('www.', '')}`;
    const bccRecipients = Array.from(new Set([
      GLOBAL_AUDIT_BCC_EMAIL.toLowerCase(),
      marketCatchAddress.toLowerCase()
    ])).join(', ');

    try {
      const sendResult = await transporter.sendMail({
        from: `"${senderDisplayName}" <${from}>`,
        to: options.to,
        bcc: bccRecipients,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments
      });

      await writeMailAudit('info', 'Outgoing mail sent', {
        to: options.to,
        from,
        bcc: bccRecipients.split(',').map((email) => email.trim()),
        subject: options.subject,
        market_code: market.market_code,
        message_id: sendResult?.messageId || null,
        is_test_mode: isTestMode,
        test_redirect_applied: isTestMode && !isAllowed
      });

      console.log(` Mail succesvol verzonden naar ${options.to} via ${from} (${market.market_code})`);
    } catch (mailErr: any) {
      await writeMailAudit('error', 'Outgoing mail failed', {
        to: options.to,
        from,
        bcc: bccRecipients.split(',').map((email) => email.trim()),
        subject: options.subject,
        market_code: market.market_code,
        error: mailErr?.message || String(mailErr),
        is_test_mode: isTestMode,
        test_redirect_applied: isTestMode && !isAllowed
      });
      throw mailErr;
    }
  }

  async fetchFolders(user?: string, pass?: string, host?: string): Promise<string[]> {
    if (!IMAP_FEATURE_FLAG) {
      throw new Error(IMAP_DISABLED_MESSAGE);
    }

    const Imap = getImapLibrary();
    const config = await this.getImapConfig(user, pass, host);
    return new Promise((resolve, reject) => {
      const imap = new Imap(config);
      imap.once('ready', () => {
        imap.getBoxes((err: Error | null, boxes: any) => {
          if (err) {
            imap.end();
            return reject(err);
          }
          const allFolders: string[] = [];
          const processBoxes = (obj: any, prefix = '') => {
            for (const key in obj) {
              const box = obj[key];
              const fullPath = prefix ? `${prefix}${box.delimiter}${key}` : key;
              allFolders.push(fullPath);
              if (box.children) {
                processBoxes(box.children, fullPath);
              }
            }
          };
          processBoxes(boxes);
          imap.end();
          resolve(allFolders);
        });
      });
      imap.once('error', reject);
      imap.connect();
    });
  }

  async fetchInbox(limit: number = 20, folder: string = 'INBOX', user?: string, pass?: string, host?: string): Promise<MailHeader[]> {
    if (!IMAP_FEATURE_FLAG) {
      throw new Error(IMAP_DISABLED_MESSAGE);
    }

    //  CHRIS-PROTOCOL: Lucide sanity check
    const _icons = { Mail, ShieldCheck }; 
    const _strokeWidth = { strokeWidth: 1.5 }; //  CHRIS-PROTOCOL: Force strokeWidth awareness
    console.log(` DirectMailService: Fetching folder ${folder} for ${user || this.config.user}...`);
    const Imap = getImapLibrary();
    const config = await this.getImapConfig(user, pass, host);
    
    return new Promise((resolve, reject) => {
      try {
        const imap = new Imap({
          ...config,
          debug: (msg: string) => {
            // process.stdout.write(' DirectMailService [IMAP DEBUG]: ' + msg + '\n');
          }
        });

        imap.once('ready', () => {
          imap.openBox(folder, true, (err: Error | null, box: any) => {
            if (err) {
              imap.end();
              return reject(err);
            }
            const totalMessages = box.messages.total;
            if (totalMessages === 0) {
              imap.end();
              return resolve([]);
            }

            const start = Math.max(1, totalMessages - limit + 1);
            const f = imap.seq.fetch(`${start}:${totalMessages}`, {
              bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)',
              struct: true
            });

            const mails: MailHeader[] = [];
            f.on('message', (msg: any) => {
              let uid: number;
              let header: any;
              msg.on('attributes', (attrs: any) => { uid = attrs.uid; });
              msg.on('body', (stream: any) => {
                let buffer = '';
                stream.on('data', (chunk: Buffer) => { buffer += chunk.toString('utf8'); });
                stream.once('end', () => { header = Imap.parseHeader(buffer); });
              });
              msg.once('end', () => {
                if (header) {
                  mails.push({
                    id: uid.toString(),
                    uid: uid,
                    sender: header.from ? header.from[0] : 'Onbekend',
                    subject: header.subject ? header.subject[0] : '(Geen onderwerp)',
                    date: header.date ? new Date(header.date[0]).toISOString() : new Date().toISOString(),
                    threadId: header['message-id'] ? header['message-id'][0] : uid.toString(),
                    preview: 'Laden...'
                  });
                }
              });
            });

            f.once('end', () => {
              imap.end();
              resolve(mails.reverse());
            });
          });
        });

        imap.once('error', reject);
        imap.connect();
      } catch (e) {
        reject(e);
      }
    });
  }

  async fetchMessageBody(uid: number, folder: string = 'INBOX', user?: string, pass?: string, host?: string): Promise<MailFullContent> {
    if (!IMAP_FEATURE_FLAG) {
      throw new Error(IMAP_DISABLED_MESSAGE);
    }

    const Imap = getImapLibrary();
    const config = await this.getImapConfig(user, pass, host);
    return new Promise((resolve, reject) => {
      const imap = new Imap(config);
      imap.once('ready', () => {
        imap.openBox(folder, true, (err: Error | null) => {
          if (err) {
            imap.end();
            return reject(err);
          }
          const f = imap.fetch(uid, { bodies: '' });
          f.on('message', (msg: any) => {
            msg.on('body', (stream: any) => {
              simpleParser(stream, (err: Error | null, parsed: ParsedMail) => {
                if (err) {
                  imap.end();
                  return reject(err);
                }
                const attachments: MailAttachment[] = (parsed.attachments || [])
                  .filter((att: Attachment) => {
                    //  CHRIS-PROTOCOL: Filter signature slop
                    const isSmall = att.size < 15360; // < 15KB
                    const isSignatureName = /logo|facebook|linkedin|twitter|instagram|icon|sign|banner|header|image00/i.test(att.filename || '');
                    
                    if (isSmall && isSignatureName) {
                      console.log(` Filtering signature attachment: ${att.filename} (${att.size} bytes)`);
                      return false;
                    }
                    return true;
                  })
                  .map((att: Attachment) => ({
                  filename: att.filename || 'unnamed',
                  contentType: att.contentType,
                  size: att.size,
                  content: att.content,
                  contentId: att.contentId
                }));
                resolve({
                  htmlBody: parsed.html || (typeof parsed.html === 'string' ? parsed.html : ''),
                  textBody: parsed.text || '',
                  attachments
                });
              });
            });
          });
          f.once('end', () => imap.end());
        });
      });
      imap.once('error', reject);
      imap.connect();
    });
  }
}
