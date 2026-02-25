import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 *  CERTIFICATE RENDERER (2026)
 *  VOICES OS: Genereert een visueel certificaat met Vercel OG.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || 'Deelnemer';
    const workshop = searchParams.get('workshop') || 'Workshop';
    const instructor = searchParams.get('instructor') || 'Voices Studio';
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const orderId = searchParams.get('orderId') || '0';

    const date = new Date(dateStr).toLocaleDateString('nl-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #f8f8f8 0%, #fff 100%)',
            fontFamily: 'sans-serif',
            padding: '80px',
            border: '20px solid #000',
          }}
        >
          {/* Border Inner */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            bottom: '20px',
            border: '2px solid #000',
            opacity: 0.1
          }} />

          {/* Logo Placeholder */}
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '900', 
            letterSpacing: '0.2em',
            marginBottom: '40px'
          }}>
            VOICES STUDIO
          </div>

          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            letterSpacing: '0.3em',
            color: '#666',
            marginBottom: '20px'
          }}>
            CERTIFICAAT VAN DEELNAME
          </div>

          <div style={{ 
            fontSize: '20px', 
            marginBottom: '40px'
          }}>
            Dit certificaat wordt uitgereikt aan
          </div>

          <div style={{ 
            fontSize: '64px', 
            fontWeight: '900', 
            textAlign: 'center',
            marginBottom: '40px',
            textTransform: 'uppercase',
            letterSpacing: '-0.02em'
          }}>
            {name}
          </div>

          <div style={{ 
            fontSize: '20px', 
            marginBottom: '20px'
          }}>
            voor het succesvol voltooien van de workshop
          </div>

          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            marginBottom: '60px',
            color: '#000'
          }}>
            {workshop}
          </div>

          <div style={{ 
            display: 'flex', 
            width: '100%', 
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingBottom: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>DATUM</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{date}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>DOCENT</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{instructor}</div>
            </div>
          </div>

          <div style={{ 
            position: 'absolute', 
            bottom: '40px', 
            fontSize: '10px', 
            color: '#ccc' 
          }}>
            Validatie ID: VOICES-{orderId}-{Math.random().toString(36).substring(7).toUpperCase()}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 848, // A4 aspect ratio
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
