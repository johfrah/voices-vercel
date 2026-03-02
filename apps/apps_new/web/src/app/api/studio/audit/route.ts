import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { text, mode, actors } = await request.json();
    
    if (!text) {
      return NextResponse.json({ isSafe: true });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (mode === 'matchmaker') {
      const prompt = `
        Analyseer dit script voor een voice-over: "${text}"
        Bepaal de emotie, tone-of-voice en het type project.
        Vergelijk dit met de volgende lijst van stemacteurs en hun tags: ${JSON.stringify(actors)}
        
        Geef voor elke acteur een match-score tussen 0 en 100 terug op basis van hoe goed hun tags passen bij de vibe van het script.
        
        Antwoord uitsluitend in JSON-formaat:
        {
          "matches": { "actor_id": score, ... }
        }
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonStr = response.text().replace(/```json|```/g, "").trim();
      return NextResponse.json(JSON.parse(jsonStr));
    }

    const prompt = `
      Analyseer de volgende tekst van een stemacteur aan een klant. 
      Controleer of er contactgegevens worden gedeeld (telefoonnummers, e-mailadressen, websites, social media handles) 
      of dat de klant wordt uitgenodigd om buiten dit platform te communiceren.

      Tekst: "${text}"

      Antwoord uitsluitend in JSON-formaat:
      {
        "isSafe": boolean,
        "reason": "uitleg als het niet veilig is, anders leeg"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Sherlock AI Watchdog] Error during audit:", error);
    return NextResponse.json({ isSafe: true }); 
  }
}
