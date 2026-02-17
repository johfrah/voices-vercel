import { NextResponse } from 'next/server';
import { GeminiService } from '@/services/GeminiService';

/**
 *  API: AI CONNECTION TEST (NUCLEAR 2026)
 * 
 * Doel: Verifiren of de koppeling met Google Gemini 1.5 Flash werkt.
 */

export async function GET() {
  try {
    const gemini = GeminiService.getInstance();
    
    // Test met een simpele analyse
    const result = await gemini.analyzeMail(
      "Test Connection", 
      "Dit is een testbericht om de AI verbinding van de Voices Engine te controleren."
    );

    return NextResponse.json({
      success: true,
      status: 'AI_ONLINE',
      model: 'gemini-1.5-flash',
      test_result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error(' AI Test Failed:', error);
    return NextResponse.json({
      success: false,
      status: 'AI_OFFLINE',
      error: error.message,
      hint: 'Controleer of GOOGLE_API_KEY correct is ingesteld in Vercel.'
    }, { status: 500 });
  }
}
