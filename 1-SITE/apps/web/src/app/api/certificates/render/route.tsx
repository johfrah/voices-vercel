import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

export const runtime = 'edge';

/**
 *  NUCLEAR CERTIFICATE RENDERER (2026)
 *  VOICES OS: Genereert een visueel certificaat met Vercel OG.
 *  
 *  RECONSTRUCTED FROM LEGACY (4-KELDER):
 *  - Font: Raleway (Bold/Regular)
 *  - Background: background.png (Legacy blueprint)
 *  - Layout: Absolute positioning based on 30-workshop-certificate-generator.php
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || 'Deelnemer';
    const workshop = searchParams.get('workshop') || 'Workshop';
    const instructor = searchParams.get('instructor') || 'Bernadette Timmermans & Johfrah Lefebvre';
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const orderId = searchParams.get('orderId') || '0';

    const date = new Date(dateStr).toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voices.eu';
    const bgUrl = `${baseUrl}/assets/studio/certificates/legacy-background.png`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Legacy Background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={bgUrl} 
            alt="background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }} 
          />

          {/* Naam: top: 46% in legacy */}
          <div style={{ 
            position: 'absolute', 
            top: '46%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: '65px', 
            fontWeight: '700', 
            color: '#000', 
            textAlign: 'center', 
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
          }}>
            {name}
          </div>

          {/* Titel: top: 67% in legacy */}
          <div style={{ 
            position: 'absolute', 
            top: '67%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: '35px', 
            fontWeight: '700', 
            color: '#000', 
            textAlign: 'center', 
            whiteSpace: 'nowrap',
          }}>
            {workshop}
          </div>

          {/* Workshopgever: top: 80% in legacy */}
          <div style={{ 
            position: 'absolute', 
            top: '80%', 
            left: '50%', 
            transform: 'translateX(-50%)',
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#000', 
            textAlign: 'center', 
            whiteSpace: 'nowrap',
          }}>
            {instructor}
          </div>

          {/* Datum & Validation (Extra) */}
          <div style={{ 
            position: 'absolute', 
            bottom: '40px', 
            right: '60px',
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#000',
            opacity: 0.6
          }}>
            {date}
          </div>

          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px', 
            color: '#ccc' 
          }}>
            VOICES STUDIO CERTIFICATE #{orderId}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 848, // A4 landscape
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
