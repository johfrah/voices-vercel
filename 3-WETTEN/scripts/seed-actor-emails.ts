import { createClient } from '@supabase/supabase-js';

/**
 * 🛡️ CHRIS-PROTOCOL: ACTOR EMAIL SEEDING (v2.14.528)
 * 
 * Doel: Alle e-mailadressen uit de verstrekte lijst synchroniseren met de 'actors' tabel.
 * Dit herstelt de ontbrekende 'E-mail (Priv)' velden in de admin.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const actorData = [
  { id: 1252, email: "silke.gordon@gmail.com" },
  { id: 1770, email: "info@stemdunja.nl" },
  { id: 1768, email: "mona.junger@hotmail.com" },
  { id: 1766, email: "ian@thebritishvoice.net" },
  { id: 2415, email: "mail@darrenaltman.com" },
  { id: 1760, email: "info@johfrah.be" },
  { id: 2417, email: "claudiaortiz@covoicetalent.com" },
  { id: 1756, email: "gonzavitoria@hotmail.com" },
  { id: 1757, email: "contacto@jesuszamora.info" },
  { id: 2420, email: "info@giuseppecivello.it" },
  { id: 1751, email: "silvia.mapelli@italianvoiceovers.com" },
  { id: 1752, email: "stefanoprincipe91@hotmail.it" },
  { id: 2423, email: "elenicelocutora@gmail.com" },
  { id: 1249, email: "alfonso.giansanti@gmail.com" },
  { id: 1744, email: "florian@florian.dk" },
  { id: 1743, email: "tom@tomdheere.com" },
  { id: 1742, email: "kontakt@reklamespeaker.dk" },
  { id: 1741, email: "info@meguicabrera.com" },
  { id: 1739, email: "ash@speak-it.dk" },
  { id: 2430, email: "mpolitvt@gmail.com" },
  { id: 1737, email: "office@soundit.pl" },
  { id: 1736, email: "mac.salamon@gmail.com" },
  { id: 1735, email: "info@macsalamon.de" },
  { id: 1734, email: "pawel.szreiber@gmail.com" },
  { id: 2435, email: "pawel.szreiber@gmail.com" },
  { id: 1732, email: "aleksander@lektor-online.pl" },
  { id: 2437, email: "mail@mariameulders.be" },
  { id: 1247, email: "michelecuvelier@hotmail.com" },
  { id: 1245, email: "aliciabader68@gmail.com" },
  { id: 1244, email: "dhoudemond@yahoo.ca" },
  { id: 1242, email: "sylvain.voix@gmail.com" },
  { id: 2442, email: "camillejames.voixoff@gmail.com" },
  { id: 41, email: "info@verasvoice.nl" },
  { id: 1721, email: "brecht.v@gmail.com" }, // Adjusted from respiro.arts if needed, but using provided
  { id: 1721, email: "respiro.arts@gmail.com" },
  { id: 1720, email: "hallo@goedelevermaelen.be" },
  { id: 1719, email: "sandergillis@hotmail.com" },
  { id: 1718, email: "kristien@destemfabriek.be" },
  { id: 1717, email: "christina.vangeel@ginsonic.be" },
  { id: 1715, email: "kirsten.lemaire@gmail.com" },
  { id: 1714, email: "annelies@anneliesgilbos.be" },
  { id: 1709, email: "info@waveaudio.de" },
  { id: 1703, email: "marinamolla@gmail.com" },
  { id: 1701, email: "info@kristijl.nl" },
  { id: 1700, email: "beamarliervoix@gmail.com" },
  { id: 1699, email: "info@foxvoice.nl" },
  { id: 1697, email: "korneeldc@gmail.com" },
  { id: 1695, email: "contact@estellehubert.com" },
  { id: 1690, email: "mark.labrand@me.com" },
  { id: 1688, email: "hello@sarahsealey.com" },
  { id: 1687, email: "katie@katieflamman.co.uk" },
  { id: 1685, email: "pcouveignes@nostalgie.fr" },
  { id: 1683, email: "larissa.roose@gmail.com" },
  { id: 1680, email: "ronald@voiceoverronald.nl" },
  { id: 1235, email: "info@klaptoos.be" },
  { id: 1679, email: "sendepaepe@gmail.com" },
  { id: 1676, email: "info@veerleverheyen.be" },
  { id: 1674, email: "hannelore.van.hove@gmail.com" },
  { id: 1234, email: "info@spotbox.be" },
  { id: 1656, email: "laura.groeseneken@gmail.com" },
  { id: 1655, email: "info@sprekendyouri.nl" },
  { id: 1233, email: "info@berdienschepers.be" },
  { id: 1652, email: "ksesterhenn@gmx.de" },
  { id: 1651, email: "hallo@gittavanreeth.be" },
  { id: 1648, email: "serge@sergedemarre.com" },
  { id: 1645, email: "s.immerzeel@me.com" },
  { id: 1642, email: "carolina@carolinamout.nl" },
  { id: 1641, email: "charlinecatrysse@gmail.com" },
  { id: 1630, email: "eveline@vidsome.com" },
  { id: 1629, email: "sean@voiceofgray.com" },
  { id: 1624, email: "petravvo@gmail.com" },
  { id: 1632, email: "contact@klaasgroenewold.nl" },
  { id: 1623, email: "hello@thomasvoix.com" },
  { id: 1628, email: "ilari@planet.nl" },
  { id: 1631, email: "ruben@rubendingemans.nl" },
  { id: 1698, email: "machteld7@gmail.com" },
  { id: 1627, email: "info@jakobkrabbe.nl" },
  { id: 1643, email: "info@sophiehoeberechts.nl" },
  { id: 1644, email: "lotte@lottehorlings.nl" },
  { id: 1646, email: "info@bartkooiman.nl" },
  { id: 1647, email: "stephan@sdewes.de" },
  { id: 1649, email: "tom@tomdemunck.nl" },
  { id: 1625, email: "info@markheyninck.be" },
  { id: 1650, email: "jeroen@yesman.nu" },
  { id: 1653, email: "mail@zylle.de" },
  { id: 1657, email: "patrick.cobbaert@gmail.com" },
  { id: 1675, email: "birgit.simal@vrt.be" },
  { id: 1677, email: "bernard.grand@gmail.com" },
  { id: 1681, email: "contact@juliejeko.com" },
  { id: 1678, email: "nicolas-mckerl@hotmail.com" },
  { id: 1716, email: "info@voiceovervrouw.com" },
  { id: 1730, email: "info@verovoice.be" },
  { id: 1682, email: "stefan.sattler@klang.be" },
  { id: 1626, email: "message@germanvoiceover.org" },
  { id: 1684, email: "cat@catherinecampion.com" },
  { id: 1686, email: "emma@emmahignett.com" },
  { id: 1689, email: "mike@mikecoopervoiceover.com" },
  { id: 1691, email: "birgitkarwath@web.de" },
  { id: 1694, email: "jvalverde@mac.com" },
  { id: 1654, email: "info@antoninobarbetta.it" },
  { id: 1696, email: "info@paolamasciadri.com" },
  { id: 1702, email: "walch@gmx.net" },
  { id: 1710, email: "mariac.couce@gmail.com" },
  { id: 1713, email: "alysonsteel@gmail.com" },
  { id: 1724, email: "info@juliebataille.com" },
  { id: 1723, email: "voixoffdelphine@gmail.com" },
  { id: 1725, email: "n.stutterheim@posteo.de" },
  { id: 1726, email: "silviabrg@gmail.com" },
  { id: 1729, email: "info@stimmkulisse.de" },
  { id: 1731, email: "m_vanbesien@yahoo.com" },
  { id: 1740, email: "info@auroralocutora.com" },
  { id: 1745, email: "andrea@denisco.it" },
  { id: 1746, email: "barbara.monaco24@gmail.com" },
  { id: 1747, email: "info@francescapavone.com" },
  { id: 1748, email: "info@giovanninoto.it" },
  { id: 1750, email: "info@janpa.it" },
  { id: 1754, email: "info@vozex.es" },
  { id: 1759, email: "rameshmahtanivox@gmail.com" },
  { id: 1769, email: "miathevo@gmail.com" }
];

async function seedEmails() {
  console.log('🚀 [EMAIL-SEEDING] Starting sync...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const actor of actorData) {
    const { error } = await supabase
      .from('actors')
      .update({ email: actor.email })
      .eq('id', actor.id);

    if (error) {
      console.error(`❌ Failed to update actor ${actor.id}:`, error.message);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log('\n🏁 [SEEDING COMPLETE]');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

seedEmails().catch(console.error);
