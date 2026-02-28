
import { db } from '../../1-SITE/apps/web/src/lib/system/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const shortDescriptions: Record<number, string> = {
  260272: "In deze workshop leer ik je hoe je een eigen radioprogramma kan opbouwen. Daarbij werken we aan de basisskills: een goede opbouw, een juiste interviewvoorbereiding, wat stemflow en wat techniek. Aan het einde ga je naar huis met een mooie show, zoals je die zelf op de radio zou willen horen.",
  260250: "In deze workshop leer je de basis van voice-overs inspreken: van stemopwarming tot tekstbegrip en intonatie en spreken in de microfoon. Je krijgt praktische tips om teksten tot leven te brengen en inzicht in hoe je je stem kunt gebruiken voor verschillende voice-over stijlen.",
  260261: "Maak kennis met de kunst van dubbing! Leer hoe je verschillende karakters creëert en effectief dubbing doet voor films en series. Ideaal voor iedereen die zich wil verdiepen in de wereld van stemacteren en dubbing!",
  260263: "Wil jij professionele voice-overs leren maken, van opname tot eindresultaat? In deze praktische workshop leer je hoe je met de juiste apparatuur, opname-instellingen en audiobewerkingstechnieken zelf krachtige, heldere voice-overs produceert. Of je nu je stem inzet voor video, podcast of e-learning: na deze dag weet je hoe je klinkt als een pro – én hoe je dat zelf bereikt.",
  260265: "Specialiseer je in het maken van audio-descripties voor visueel beperkte luisteraars. Ontdek hoe je beelden en scènes gedetailleerd en duidelijk beschrijft, en zo toegankelijkheid bevordert.",
  260266: "Hoe vertel je een beeldverhaal, meeslepend en innemend. Jij draagt het verhaal en wordt tegelijk gedragen door fascinerende beelden.",
  260271: "Verhoog je presentatievaardigheden voor de camera. Oefen met spreken voor de camera, leer over lichaamstaal en ontwikkel zelfvertrouwen voor live en opgenomen presentaties.",
  260273: "Heerlijk, he, een boek lezen? Maar niets is heerlijker dan het vóórlezen! Maak een literaire duik en zoek met je stem naar de juiste sfeer, de kloppende kleur en de passende emotie. Hoe zet je je stem in om een verhaal tot leven te wekken en de luisteraar helemaal mee te nemen? Goedele neemt je graag mee in de wondere wereld van de luisterboeken...",
  260274: "Hoe maak je van een goed verhaal een boeiende podcast? Samen met audio- en theatermaker Lucas Derycke ontdek je hoe je een sterk verhaal vertelt, hoe je iemand interviewt en hoe je met klank de juiste sfeer creëert. Na een korte introductie gaan we samen aan de slag met microfoons en montageprogramma's.",
  263913: "Heb je pijn na lang spreken of ben je moe na een lange vergadering? Verstaan je omstaanders je niet goed? Dan moeten we nagaan of je je stem goed gebruikt en goed verzorgd! Een stem kun je trainen, mooier en warmer laten klinken.",
  267780: "Leer perfect articuleren. Oefen op open klinkers en tweeklanken: smoelenwerk moet er zijn! Werk aan je trefzekere medeklinkers en leer alle regels van uitspraak en assimilatie. Zorg dat je meteen begrepen wordt.",
  267781: "Een soepele en slimme intonatie zorgt dat je luisteraar aan je lippen hangt en blijven luisteren. Normaal gezien intoneer je zonder er bij na te denken, het gaat gewoon vanzelf. Dat verandert als je je aan een tekst moet houden.",
  272702: "Wil jij helder, warm en overtuigend leren spreken? Wil jij een stem die mensen raakt — verstaanbaar, verzorgd en vol vertrouwen? In één intensieve dag leer je hoe articulatie, stem en intonatie één geheel vormen.",
  272907: "Elke organisatie is anders. Daarom bieden wij bij Voices Studio ook workshops op maat aan: trajecten die volledig afgestemd zijn op jullie doelen, context en deelnemers.",
  274488: "In de workshop Meditatief spreken leer je hoe je jouw stem optimaal inzet voor meditatie en rustgevende audio. In de voormiddag focussen we op het spreken zelf: hoe je rustig, gegrond en radiofonisch klinkt."
};

async function updateShortDescriptions() {
  console.log('🚀 Updating short descriptions for 15 workshops...');

  await db.transaction(async (tx) => {
    for (const [id, description] of Object.entries(shortDescriptions)) {
      // Fetch current meta first to preserve other fields
      const result = await tx.execute(sql`SELECT meta FROM workshops WHERE id = ${id}`);
      const currentMeta = result[0]?.meta || {};
      const newMeta = { ...currentMeta, short_description: description };

      await tx.execute(sql`
        UPDATE workshops 
        SET meta = ${JSON.stringify(newMeta)}::jsonb 
        WHERE id = ${id}
      `);
    }
  });

  console.log('✅ All short descriptions updated atomicly!');
  process.exit(0);
}

updateShortDescriptions().catch(err => {
  console.error('❌ Update failed:', err);
  process.exit(1);
});
