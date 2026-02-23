import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { gemini-service } from '@/lib/services/gemini-service';

// Dynamische imports voor optionele libraries
let XLSX: any;
let mammoth: any;

try {
  XLSX = require('xlsx');
  mammoth = require('mammoth');
} catch (e) {
  console.warn('Optionele document parsing libraries niet geladen');
}

/**
 * SMART SCRIPT IMPORT API (2026)
 * 
 * Doel: Extraheert tekst uit PDF, Word, Excel en Text en gebruikt AI om er een Voices-script van te maken.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand gevonden' }, { status: 400 });
    }

    let rawText = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
      const data = await pdf(buffer);
      rawText = data.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && mammoth) {
      // Word (.docx)
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else if ((file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) && XLSX) {
      // Excel (.xlsx) - Slimme interpretatie
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // We zetten de sheet om naar een JSON array van objecten om de structuur te behouden
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      rawText = JSON.stringify(jsonData);
    } else if (file.type === 'text/plain') {
      rawText = buffer.toString('utf-8');
    } else {
      // Fallback
      rawText = buffer.toString('utf-8');
    }

    if (!rawText || rawText.trim().length < 10) {
      return NextResponse.json({ error: 'Geen leesbare tekst gevonden in het document' }, { status: 400 });
    }

    // Gebruik Gemini om de tekst te interpreteren, te zuiveren en te formatteren
    const gemini = gemini-service.getInstance();
    const prompt = `
      Je bent een senior script-editor voor Voices.be. Je krijgt ruwe tekst uit een geüpload document (${file.name}).
      Elke opdracht is uniek, dus je moet de tekst EERST INTERPRETEREN voordat je deze formatteert.

      JOUW ANALYSE-STAPPEN:
      1. WAT IS DIT? Begrijp de context. Is het een IVR-keuzemenu, een radiocommercial, een e-learning module, of een verzameling losse boodschappen?
      2. IDENTIFICEER SEGMENTEN: Zoek naar natuurlijke overgangen. Zelfs als er geen titels in het document staan, moet jij logische titels bedenken op basis van de inhoud (bijv. "Introductie", "Optie 1", "Afsluiting").
      3. TABELLEN INTERPRETEREN: Als de ruwe tekst een JSON-array van een Excel-sheet is, interpreteer dan de kolommen. Vaak is kolom A een titel/id en kolom B de tekst. Combineer dit slim tot segmenten met titels tussen haakjes.
      4. FILTER DE RUIS: Verwijder alles wat NIET ingesproken moet worden (paginanummers, datum, bestandsnamen, "Klant:", "Versie 2.0").
      5. BEHOUD DE KERN: De tekst die ingesproken moet worden moet 100% intact blijven. Verander geen woorden in de eigenlijke boodschap.

      STRICTE FORMATTERING:
      - TITELS: Elke unieke boodschap of segment MOET beginnen met een titel tussen ronde haakjes op een eigen regel, bijv: (Welkomstboodschap). Wees creatief en accuraat in de naamgeving van deze titels.
      - REGIE: Als je instructies ziet over de toon, snelheid of emotie, zet deze dan tussen haakjes binnen de tekst, bijv: (rustig en warm).
      - STRUCTUUR: Zorg voor een heldere, ademende layout met witregels tussen de segmenten.

      OUTPUT:
      Return uitsluitend het resulterende script. Geen inleiding, geen uitleg, geen markdown code blocks.

      RUWE TEKST OM TE INTERPRETEREN:
      ${rawText.substring(0, 10000)}
    `;

    const cleanedScript = await gemini.generateText(prompt);

    return NextResponse.json({ 
      success: true, 
      script: cleanedScript.trim(),
      fileName: file.name
    });

  } catch (error: any) {
    console.error(' Smart Import Error:', error);
    return NextResponse.json({ error: 'Fout bij het verwerken van het document: ' + error.message }, { status: 500 });
  }
}
