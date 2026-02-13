import { MarketManager } from '@config/market-manager';

/**
 * 🏛️ VUME MASTER WRAPPER (2026)
 * 
 * Doel: De visuele bedding voor elke mail uit de Schouwburg.
 * DNA: Johfrah (Luxe), Moby (Mobile-First), Mark (Warmte).
 */

interface WrapperOptions {
  title: string;
  previewText?: string;
  journey?: 'agency' | 'artist' | 'portfolio' | 'studio' | 'auth';
  market?: string;
  host?: string;
}

export function VumeMasterWrapper(content: string, options: WrapperOptions) {
  const { title, previewText, journey = 'agency', host = 'voices.be' } = options;
  const market = MarketManager.getCurrentMarket(host);
  
  // Journey DNA Mapping (Laya's Refined Palette)
  const dna = {
    agency: { bg: '#FBFBF9', card: '#FFFFFF', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' },
    artist: { bg: '#000000', card: '#111111', accent: '#FF007A', text: '#FFFFFF', secondary: '#9CA3AF' },
    portfolio: { bg: '#FFFFFF', card: '#FBFBF9', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' },
    studio: { bg: '#FBFBF9', card: '#FFFFFF', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' },
    auth: { bg: '#FBFBF9', card: '#FFFFFF', accent: '#FF4F00', text: '#1A1A1A', secondary: '#6B7280' }
  }[journey];

  return `
    <!DOCTYPE html>
    <html lang="nl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@200;300;400&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          background-color: ${dna.bg};
          font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .card {
          background-color: ${dna.card};
          border-radius: 40px; /* Laya's Signature Rounding */
          padding: 50px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.04); /* Aura Shadow */
          border: 1px solid ${journey === 'artist' ? '#222' : '#F0F0F0'};
        }

        .logo {
          margin-bottom: 50px;
          text-align: center;
        }

        .content {
          color: ${dna.text};
          font-size: 16px;
          line-height: 1.8;
          font-weight: 300;
          letter-spacing: 0.01em;
        }

        h1 {
          font-weight: 200;
          font-size: 32px;
          margin-bottom: 30px;
          line-height: 1.2;
          color: ${dna.text};
        }

        .footer {
          margin-top: 60px;
          text-align: center;
          color: ${dna.secondary};
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .button {
          display: inline-block;
          padding: 18px 36px;
          background-color: ${dna.accent};
          color: #FFFFFF !important;
          text-decoration: none;
          border-radius: 14px; /* Chris-Protocol: rounded-[10px] for buttons */
          font-weight: 400;
          margin-top: 30px;
          text-align: center;
        }

        @media (max-width: 600px) {
          .card {
            padding: 24px;
          }
        }
      </style>
    </head>
    <body>
      ${previewText ? `<div style="display:none; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">${previewText}</div>` : ''}
      <div class="container">
        <div class="logo">
          <img src="https://www.voices.be/wp-content/uploads/2023/05/Voices-Logo-Black.png" alt="Voices" width="120" style="display: block; margin: 0 auto;">
        </div>
        <div class="card">
          <div class="content">
            ${content}
          </div>
        </div>
        <div class="footer">
          &copy; 2026 ${market.company_name} &bull; De Voices Schouwburg
        </div>
      </div>
    </body>
    </html>
  `;
}
