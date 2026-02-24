
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '1-SITE/apps/web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const mdPath = '4-KELDER/VOICE-ACTORS-MATCHING.md';

const idMapping = [
  { actorId: 1, wpId: 273019, name: "Silke", email: "silke.gordon@gmail.com", supabaseId: 1252 },
  { actorId: 3, wpId: 260015, name: "Dunja", email: "info@stemdunja.nl", supabaseId: 1770 },
  { actorId: 4, wpId: 258121, name: "Mona", email: "mona.junger@hotmail.com", supabaseId: 1768 },
  { actorId: 5, wpId: 255863, name: "Ian", email: "ian@thebritishvoice.net", supabaseId: 1766 },
  { actorId: 6, wpId: 255862, name: "Darren", email: "mail@darrenaltman.com", supabaseId: 2415 },
  { actorId: 7, wpId: 182508, name: "Johfrah", email: "info@johfrah.be", supabaseId: 1760 },
  { actorId: 8, wpId: 251725, name: "Claudia", email: "claudiaortiz@covoicetalent.com", supabaseId: 2417 },
  { actorId: 9, wpId: 251726, name: "Gonzalo", email: "gonzavitoria@hotmail.com", supabaseId: 1756 },
  { actorId: 10, wpId: 251727, name: "Jesus", email: "contacto@jesuszamora.info", supabaseId: 1757 },
  { actorId: 11, wpId: 251582, name: "Giuseppe", email: "info@giuseppecivello.it", supabaseId: 2420 },
  { actorId: 12, wpId: 251584, name: "Silvia", email: "silvia.mapelli@italianvoiceovers.com", supabaseId: 1751 },
  { actorId: 13, wpId: 251585, name: "stefano", email: "stefanoprincipe91@hotmail.it", supabaseId: 1752 },
  { actorId: 14, wpId: 251587, name: "Elenice", email: "elenicelocutora@gmail.com", supabaseId: 2423 },
  { actorId: 15, wpId: 251590, name: "Alfonso", email: "alfonso.giansanti@gmail.com", supabaseId: 1249 },
  { actorId: 16, wpId: 251576, name: "Florian", email: "florian@florian.dk", supabaseId: 1744 },
  { actorId: 17, wpId: 251575, name: "Tom", email: "tom@tomdheere.com", supabaseId: 1743 },
  { actorId: 18, wpId: 251554, name: "Diana", email: "kontakt@reklamespeaker.dk", supabaseId: 1742 },
  { actorId: 19, wpId: 251553, name: "Megui", email: "info@meguicabrera.com", supabaseId: 1741 },
  { actorId: 20, wpId: 251546, name: "Andreas", email: "ash@speak-it.dk", supabaseId: 1739 },
  { actorId: 21, wpId: 251527, name: "Malgorzata", email: "mpolitvt@gmail.com", supabaseId: 2430 },
  { actorId: 22, wpId: 251524, name: "Bartek", email: "office@soundit.pl", supabaseId: 1737 },
  { actorId: 23, wpId: 251521, name: "Agnieszka", email: "mac.salamon@gmail.com", supabaseId: 1736 },
  { actorId: 24, wpId: 251517, name: "Maciek", email: "info@macsalamon.de", supabaseId: 1735 },
  { actorId: 25, wpId: 251510, name: "Blazej", email: "pawel.szreiber@gmail.com", supabaseId: 1734 },
  { actorId: 26, wpId: 251504, name: "Pawel", email: "pawel.szreiber@gmail.com", supabaseId: 2435 },
  { actorId: 27, wpId: 251501, name: "Aleksander", email: "aleksander@lektor-online.pl", supabaseId: 1732 },
  { actorId: 28, wpId: 246059, name: "Maria", email: "mail@mariameulders.be", supabaseId: 2437 },
  { actorId: 29, wpId: 207660, name: "Michèle", email: "michelecuvelier@hotmail.com", supabaseId: 1247 },
  { actorId: 30, wpId: 240195, name: "Alicia", email: "aliciabader68@gmail.com", supabaseId: 1245 },
  { actorId: 31, wpId: 240107, name: "Delphine", email: "dhoudemond@yahoo.ca", supabaseId: 1244 },
  { actorId: 32, wpId: 240103, name: "sylvain", email: "sylvain.voix@gmail.com", supabaseId: 1242 },
  { actorId: 33, wpId: 240102, name: "James", email: "camillejames.voixoff@gmail.com", supabaseId: 2442 },
  { actorId: 34, wpId: 203591, name: "Vera", email: "info@verasvoice.nl", supabaseId: 41 },
  { actorId: 35, wpId: 238957, name: "Brecht", email: "respiro.arts@gmail.com", supabaseId: 1721 },
  { actorId: 36, wpId: 234829, name: "Goedele", email: "hallo@goedelevermaelen.be", supabaseId: 1720 },
  { actorId: 37, wpId: 234808, name: "Sander", email: "sandergillis@hotmail.com", supabaseId: 1719 },
  { actorId: 38, wpId: 184071, name: "Kristien", email: "kristien@destemfabriek.be", supabaseId: 1718 },
  { actorId: 39, wpId: 196832, name: "Christina", email: "christina.vangeel@ginsonic.be", supabaseId: 1717 },
  { actorId: 40, wpId: 207784, name: "Kirsten", email: "kirsten.lemaire@gmail.com", supabaseId: 1715 },
  { actorId: 41, wpId: 228397, name: "Annelies", email: "annelies@anneliesgilbos.be", supabaseId: 1714 },
  { actorId: 43, wpId: 219767, name: "Stephan", email: "info@waveaudio.de", supabaseId: 1709 },
  { actorId: 44, wpId: 218271, name: "Marina", email: "marinamolla@gmail.com", supabaseId: 1703 },
  { actorId: 45, wpId: 216105, name: "Kristel", email: "info@kristijl.nl", supabaseId: 1701 },
  { actorId: 46, wpId: 212306, name: "Béatrice", email: "beamarliervoix@gmail.com", supabaseId: 1700 },
  { actorId: 47, wpId: 186323, name: "Gwenny", email: "info@foxvoice.nl", supabaseId: 1699 },
  { actorId: 48, wpId: 183809, name: "Korneel", email: "korneeldc@gmail.com", supabaseId: 1697 },
  { actorId: 49, wpId: 208584, name: "Estelle", email: "contact@estellehubert.com", supabaseId: 1695 },
  { actorId: 51, wpId: 207618, name: "Mark", email: "mark.labrand@me.com", supabaseId: 1690 },
  { actorId: 52, wpId: 205174, name: "Sarah", email: "hello@sarahsealey.com", supabaseId: 1688 },
  { actorId: 53, wpId: 203597, name: "Katie", email: "katie@katieflamman.co.uk", supabaseId: 1687 },
  { actorId: 54, wpId: 199088, name: "Patrick", email: "pcouveignes@nostalgie.fr", supabaseId: 1685 },
  { actorId: 55, wpId: 200319, name: "Larissa", email: "larissa.roose@gmail.com", supabaseId: 1683 },
  { actorId: 56, wpId: 194248, name: "Ronald", email: "ronald@voiceoverronald.nl", supabaseId: 1680 },
  { actorId: 57, wpId: 194245, name: "Toos", email: "info@klaptoos.be", supabaseId: 1235 },
  { actorId: 58, wpId: 194242, name: "Sen", email: "sendepaepe@gmail.com", supabaseId: 1679 },
  { actorId: 59, wpId: 190797, name: "Veerle", email: "info@veerleverheyen.be", supabaseId: 1676 },
  { actorId: 60, wpId: 189058, name: "Hannelore", email: "hannelore.van.hove@gmail.com", supabaseId: 1674 },
  { actorId: 61, wpId: 187952, name: "Bart", email: "info@spotbox.be", supabaseId: 1234 },
  { actorId: 62, wpId: 187940, name: "Laura", email: "laura.groeseneken@gmail.com", supabaseId: 1656 },
  { actorId: 63, wpId: 187608, name: "Youri", email: "info@sprekendyouri.nl", supabaseId: 1655 },
  { actorId: 64, wpId: 187188, name: "Berdien", email: "info@berdienschepers.be", supabaseId: 1233 },
  { actorId: 65, wpId: 187185, name: "Kaja", email: "ksesterhenn@gmx.de", supabaseId: 1652 },
  { actorId: 66, wpId: 186362, name: "Gitta", email: "hallo@gittavanreeth.be", supabaseId: 1651 },
  { actorId: 67, wpId: 186533, name: "Serge", email: "serge@sergedemarre.com", supabaseId: 1648 },
  { actorId: 68, wpId: 186373, name: "Sven", email: "s.immerzeel@me.com", supabaseId: 1645 },
  { actorId: 69, wpId: 186284, name: "Carolina", email: "carolina@carolinamout.nl", supabaseId: 1642 },
  { actorId: 70, wpId: 186167, name: "Charline", email: "charlinecatrysse@gmail.com", supabaseId: 1641 },
  { actorId: 71, wpId: 182523, name: "Eveline", email: "eveline@vidsome.com", supabaseId: 1630 },
  { actorId: 72, wpId: 182525, name: "Sean", email: "sean@voiceofgray.com", supabaseId: 1629 },
  { actorId: 73, wpId: 196562, name: "Petra", email: "petravvo@gmail.com", supabaseId: 1624 },
  { actorId: 75, wpId: 182521, name: "Klaas", email: "contact@klaasgroenewold.nl", supabaseId: 1632 },
  { actorId: 76, wpId: 182527, name: "Thomas", email: "hello@thomasvoix.com", supabaseId: 1623 },
  { actorId: 77, wpId: 183772, name: "Ilari", email: "ilari@planet.nl", supabaseId: 1628 },
  { actorId: 78, wpId: 184239, name: "Ruben", email: "ruben@rubendingemans.nl", supabaseId: 1631 },
  { actorId: 79, wpId: 184388, name: "Machteld", email: "machteld7@gmail.com", supabaseId: 1698 },
  { actorId: 80, wpId: 186112, name: "Jakob", email: "info@jakobkrabbe.nl", supabaseId: 1627 },
  { actorId: 81, wpId: 186288, name: "Sophie", email: "info@sophiehoeberechts.nl", supabaseId: 1643 },
  { actorId: 82, wpId: 186366, name: "Lotte", email: "mail@lottehorlings.nl", supabaseId: 1644 },
  { actorId: 83, wpId: 186379, name: "Bart", email: "info@bartkooiman.nl", supabaseId: 1646 },
  { actorId: 84, wpId: 240930, name: "Stephan", email: "stephan@sdewes.de", supabaseId: 1647 },
  { actorId: 85, wpId: 186536, name: "Tom", email: "tom@tomdemunck.nl", supabaseId: 1649 },
  { actorId: 86, wpId: 186539, name: "Mark", email: "info@markheyninck.be", supabaseId: 1625 },
  { actorId: 87, wpId: 186653, name: "Jeroen", email: "jeroen@yesman.nu", supabaseId: 1650 },
  { actorId: 88, wpId: 187179, name: "Sylvia", email: "mail@zylle.de", supabaseId: 1653 },
  { actorId: 89, wpId: 187949, name: "Patrick", email: "patrick.cobbaert@gmail.com", supabaseId: 1657 },
  { actorId: 90, wpId: 189009, name: "Birgit", email: "birgit.simal@vrt.be", supabaseId: 1675 },
  { actorId: 91, wpId: 193692, name: "Bernard", email: "bernard.grand@gmail.com", supabaseId: 1677 },
  { actorId: 92, wpId: 193697, name: "Julie", email: "contact@juliejeko.com", supabaseId: 1681 },
  { actorId: 93, wpId: 194211, name: "Nicolas", email: "nicolas-mckerl@hotmail.com", supabaseId: 1678 },
  { actorId: 94, wpId: 194214, name: "Lonneke", email: "info@voiceovervrouw.com", supabaseId: 1716 },
  { actorId: 95, wpId: 194251, name: "Veronique", email: "info@verovoice.be", supabaseId: 1730 },
  { actorId: 96, wpId: 196306, name: "Stefan", email: "stefan.sattler@klang.be", supabaseId: 1682 },
  { actorId: 97, wpId: 198586, name: "Sue", email: "message@germanvoiceover.org", supabaseId: 1626 },
  { actorId: 98, wpId: 199075, name: "Catherine", email: "cat@catherinecampion.com", supabaseId: 1684 },
  { actorId: 99, wpId: 203592, name: "Emma", email: "emma@emmahignett.com", supabaseId: 1686 },
  { actorId: 100, wpId: 205727, name: "Mike", email: "mike@mikecoopervoiceover.com", supabaseId: 1689 },
  { actorId: 101, wpId: 207644, name: "Birgit", email: "birgitkarwath@web.de", supabaseId: 1691 },
  { actorId: 102, wpId: 207842, name: "Joel", email: "jvalverde@mac.com", supabaseId: 1694 },
  { actorId: 103, wpId: 208205, name: "Antonino", email: "info@antoninobarbetta.it", supabaseId: 1654 },
  { actorId: 104, wpId: 208777, name: "Paola", email: "info@paolamasciadri.com", supabaseId: 1696 },
  { actorId: 105, wpId: 214252, name: "Sebastian", email: "walch@gmx.net", supabaseId: 1702 },
  { actorId: 106, wpId: 218621, name: "Maria", email: "mariac.couce@gmail.com", supabaseId: 1710 },
  { actorId: 107, wpId: 226081, name: "Alyson", email: "alysonsteel@gmail.com", supabaseId: 1713 },
  { actorId: 108, wpId: 240104, name: "Julie", email: "info@juliebataille.com", supabaseId: 1724 },
  { actorId: 109, wpId: 240105, name: "delphine", email: "voixoffdelphine@gmail.com", supabaseId: 1723 },
  { actorId: 110, wpId: 240191, name: "Nadja", email: "n.stutterheim@posteo.de", supabaseId: 1725 },
  { actorId: 111, wpId: 243232, name: "silvia", email: "silviabrg@gmail.com", supabaseId: 1726 },
  { actorId: 112, wpId: 246138, name: "Yvonne", email: "info@stimmkulisse.de", supabaseId: 1729 },
  { actorId: 113, wpId: 251466, name: "Marilyn", email: "m_vanbesien@yahoo.com", supabaseId: 1731 },
  { actorId: 114, wpId: 251551, name: "Aurora", email: "info@auroralocutora.com", supabaseId: 1740 },
  { actorId: 115, wpId: 251578, name: "Andrea", email: "andrea@denisco.it", supabaseId: 1745 },
  { actorId: 116, wpId: 251579, name: "Barbara", email: "barbara.monaco24@gmail.com", supabaseId: 1746 },
  { actorId: 117, wpId: 251580, name: "Francesca", email: "info@francescapavone.com", supabaseId: 1747 },
  { actorId: 118, wpId: 251581, name: "Giovanni", email: "info@giovanninoto.it", supabaseId: 1748 },
  { actorId: 119, wpId: 251583, name: "Janpa", email: "info@janpa.it", supabaseId: 1750 },
  { actorId: 120, wpId: 251588, name: "Alex", email: "info@vozex.es", supabaseId: 1754 },
  { actorId: 121, wpId: 251729, name: "Ramesh", email: "rameshmahtanivox@gmail.com", supabaseId: 1759 },
  { actorId: 122, wpId: 258292, name: "Mia", email: "miathevo@gmail.com", supabaseId: 1769 },
];

async function main() {
  console.log("🚀 Starting MASTERCLASS STRIKT-ID SYNC: Aligning Supabase with verstrekte ID tabel...\n");

  const rawMd = fs.readFileSync(mdPath, 'utf8');
  const sections = rawMd.split('## [');
  const dossierMap = new Map();

  // Parse MD dossier data into a map by Actor ID (the one in ## [ID])
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const idMatch = section.match(/^(\d+)\]/);
    if (!idMatch) continue;
    const dossierActorId = parseInt(idMatch[1]);

    const taglineMatch = section.match(/- \*\*Tagline\*\*: \*(.*)\*/);
    const whyVoicesMatch = section.match(/### 💡 Why Voices \(IVR\/Company\)\n([\s\S]*?)\n\n###/);
    const bioMatch = section.match(/### 📖 Bio\n([\s\S]*?)\n\n---/);

    dossierMap.set(dossierActorId, {
      tagline: taglineMatch ? taglineMatch[1].trim() : null,
      whyVoices: whyVoicesMatch ? whyVoicesMatch[1].trim() : null,
      bio: bioMatch ? bioMatch[1].trim() : null
    });
  }

  let updatedCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const mapping of idMapping) {
    const supabaseId = mapping.supabaseId;
    if (typeof supabaseId !== 'number') {
      console.log(`   ⏭️ Skipping ${mapping.name}: Geen geldig Supabase ID.`);
      skipCount++;
      continue;
    }

    const dossierData = dossierMap.get(mapping.actorId);
    if (!dossierData) {
      console.log(`   ⏭️ Skipping ${mapping.name}: Geen dossier data gevonden voor Actor ID ${mapping.actorId}.`);
      skipCount++;
      continue;
    }

    console.log(`Checking [${supabaseId}] ${mapping.name}...`);

    // Fetch current state
    const { data: actor, error: fetchError } = await supabase
      .from('actors')
      .select('id, email, tagline, why_voices, bio')
      .eq('id', supabaseId)
      .single();

    if (fetchError || !actor) {
      console.log(`   ⚠️ Actor with Supabase ID [${supabaseId}] not found. Skipping.`);
      skipCount++;
      continue;
    }

    const updates: any = {};
    
    // Email altijd gelijkzetten aan dossier email uit de tabel
    if (actor.email !== mapping.email) {
      updates.email = mapping.email;
    }

    // Teksten opschonen van placeholders
    const cleanTagline = dossierData.tagline === "Geen tagline gevonden" ? null : dossierData.tagline;
    const cleanWhyVoices = dossierData.whyVoices === "_Geen Why Voices tekst_" ? null : dossierData.whyVoices;
    const cleanBio = dossierData.bio === "_Geen bio gevonden_" ? null : dossierData.bio;

    if (cleanTagline && actor.tagline !== cleanTagline) updates.tagline = cleanTagline;
    if (cleanWhyVoices && actor.why_voices !== cleanWhyVoices) updates.why_voices = cleanWhyVoices;
    if (cleanBio && actor.bio !== cleanBio) updates.bio = cleanBio;

    if (Object.keys(updates).length > 0) {
      console.log(`   ✨ Updating: ${Object.keys(updates).join(', ')}`);
      
      const { error: updateError } = await supabase
        .from('actors')
        .update({ 
          ...updates,
          is_manually_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', supabaseId);

      if (updateError) {
        console.error(`   ❌ Error updating Actor [${supabaseId}]:`, updateError.message);
        errorCount++;
      } else {
        updatedCount++;
      }
    } else {
      console.log(`   💤 Already perfectly aligned.`);
    }
  }

  console.log(`\n✅ Strikt-ID Sync Voltooid!`);
  console.log(`   - Totaal in tabel: ${idMapping.length}`);
  console.log(`   - Succesvol bijgewerkt: ${updatedCount}`);
  console.log(`   - Overgeslagen/Niet gevonden: ${skipCount}`);
  console.log(`   - Fouten: ${errorCount}`);
}

main();
