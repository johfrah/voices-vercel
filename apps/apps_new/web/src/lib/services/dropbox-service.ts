import { Dropbox, DropboxAuth } from 'dropbox';

/**
 * 📦 DROPBOX SERVICE (2026)
 * 
 * Beheert de automatische mappenstructuur voor castingprojecten.
 * Inclusief automatische OAuth2 Refresh logica voor ononderbroken werking.
 * Volgens Chris-Protocol: Georganiseerd, veilig en proactief.
 */
export class DropboxService {
  private dbx: Dropbox | null = null;
  private auth: DropboxAuth;
  private static instance: DropboxService;

  private constructor() {
    this.auth = new DropboxAuth({
      clientId: process.env.DROPBOX_CLIENT_ID,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    });
  }

  public static getInstance(): DropboxService {
    if (!DropboxService.instance) {
      DropboxService.instance = new DropboxService();
    }
    return DropboxService.instance;
  }

  /**
   * Initialiseert de Dropbox client met een verse access token indien nodig.
   */
  private async getClient(): Promise<Dropbox> {
    if (this.dbx) return this.dbx;

    try {
      console.log('[Dropbox] Initialiseren client met Refresh Token...');
      // Dropbox SDK handelt de refresh automatisch af als clientId/Secret/RefreshToken zijn gezet
      this.dbx = new Dropbox({ auth: this.auth });
      return this.dbx;
    } catch (error) {
      console.error('[Dropbox] Initialisatie fout:', error);
      throw error;
    }
  }

  /**
   * Maakt een nieuwe projectmap aan in de casting-hoofdmap.
   * Pad: /Voices/Castings/[Jaar]/[Projectnaam]_[Hash]
   */
  async createCastingFolder(projectName: string, sessionHash: string): Promise<string | null> {
    try {
      const dbx = await this.getClient();
      const year = new Date().getFullYear();
      const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_');
      const folderPath = `/Voices/Castings/${year}/${safeProjectName}_${sessionHash}`;

      console.log(`[Dropbox] Aanmaken map: ${folderPath}`);
      
      await dbx.filesCreateFolderV2({
        path: folderPath,
        autorename: true
      });

      // Maak ook submappen voor structuur
      await dbx.filesCreateFolderV2({ path: `${folderPath}/Audities` });
      await dbx.filesCreateFolderV2({ path: `${folderPath}/Briefing_en_Scripts` });

      // Genereer een gedeelde link voor admin gebruik
      const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
        path: folderPath
      });

      return sharedLink.result.url;
    } catch (error) {
      console.error('[Dropbox] Fout bij aanmaken map:', error);
      return null;
    }
  }

  /**
   * Synchroniseert een bestand van Supabase naar Dropbox (voor Academy of Delivery)
   * Pad: /Voices-Productie/TER-CONTROLE/[OrderID]_[Klantnaam]/[Projectnaam]
   */
  async syncToControlFolder(orderId: string, customerName: string, projectName: string): Promise<string | null> {
    try {
      const dbx = await this.getClient();
      const safeCustomer = customerName.replace(/[^a-z0-9]/gi, '_');
      const safeProject = projectName.replace(/[^a-z0-9]/gi, '_');
      const folderPath = `/Voices-Productie/TER-CONTROLE/${orderId}_${safeCustomer}/${safeProject}`;

      console.log(`[Dropbox] Aanmaken controle-map: ${folderPath}`);

      await dbx.filesCreateFolderV2({
        path: folderPath,
        autorename: true
      });

      return folderPath;
    } catch (error) {
      console.error('[Dropbox] Fout bij aanmaken controle-map:', error);
      return null;
    }
  }
}
