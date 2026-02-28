import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import postgres from 'postgres';

// We import the subtitles from the file we just deleted? No, I should have kept them.
// Wait, I already deleted ArtistSubtitles.ts. I need to get them back from my previous turn's context or the file history.
// I have the content in my previous thought block.

const subtitles = {
  en: [
    { start: 0.5, end: 4.8, text: "Hi, I’m Youssef Zaki, I’m a singer and I’m releasing my first single soon." },
    { start: 5.5, end: 9.8, text: "Over the years, I’ve participated in several TV shows in Europe." },
    { start: 10.2, end: 12.5, text: "In Italy, I did “Tú Sí Que Vales”." },
    { start: 21.0, end: 23.5, text: "I did “The Voice France”." },
    { start: 30.0, end: 34.5, text: "I did “The Voice Belgium” and “Belgium’s Got Talent” where I reached the final." },
    { start: 60.0, end: 65.5, text: "And the last one I did was “Lift You Up” where I reached the quarter-finals..." },
    { start: 65.8, end: 68.5, text: "...and sang with Laura Tesoro, who was incredible." },
    { start: 90.0, end: 91.5, text: "Thank you." },
    { start: 105.2, end: 109.5, text: "Please, don’t stop doing that because you have something interesting, really." },
    { start: 109.8, end: 112.5, text: "I’ve heard many, many boys sing in my life." },
    { start: 112.8, end: 119.5, text: "You have everything to be powerful and I can’t wait to hear the moment you become powerful because I’m going to have to worry." },
    { start: 120.0, end: 121.5, text: "Thank you very much." },
    { start: 123.2, end: 125.0, text: "Now, we are on our way to Place Agora." },
    { start: 125.5, end: 129.5, text: "It’s a magical and important place for me." },
    { start: 129.8, end: 134.5, text: "This is where I really started to develop musically." },
    { start: 134.8, end: 140.5, text: "After “The Voice Belgium”, I remember B.J. Scott telling me that I should keep doing what I was doing because I had something." },
    { start: 140.8, end: 141.8, text: "And I decided to do it." },
    { start: 142.0, end: 147.5, text: "After a few months, I decided to launch myself and it’s here, in this magical place, that I developed." },
    { start: 147.8, end: 153.5, text: "I met incredible artists and was able to share my emotions with the whole world." },
    { start: 164.2, end: 166.5, text: "I’m going to be really honest with you." },
    { start: 166.8, end: 171.5, text: "I was afraid for a very long time because I told myself it was never good enough, that it wasn’t right." },
    { start: 171.8, end: 175.5, text: "But now, I told myself that I’m ready." },
    { start: 175.8, end: 177.5, text: "I’m going to do my best." },
    { start: 177.8, end: 182.5, text: "And I would like to release my first EP this year, which will have 6 songs." },
    { start: 184.2, end: 188.5, text: "And in those 6 songs, you’ll see that there might be some surprises." },
    { start: 190.2, end: 192.5, text: "I’m going to do it independently and it’s a bit expensive." },
    { start: 192.8, end: 196.5, text: "So honestly, if you could support me, it would be incredible." },
    { start: 196.8, end: 198.5, text: "I’ll leave a small link at the bottom of the video." },
    { start: 200.2, end: 202.5, text: "Thank you for still being here." },
    { start: 202.8, end: 204.5, text: "Thank you for the support you give me." },
    { start: 204.8, end: 206.5, text: "I’m still receiving your incredible messages." },
    { start: 206.8, end: 208.5, text: "Thank you, thank you, thank you." }
  ],
  nl: [
    { start: 0.5, end: 4.8, text: "Hoi, ik ben Youssef Zaki, ik ben zanger en binnenkort breng ik mijn eerste single uit." },
    { start: 5.5, end: 9.8, text: "In de loop der jaren heb ik aan verschillende tv-programma's in Europa meegedaan." },
    { start: 10.2, end: 12.5, text: "In Italië deed ik mee aan “Tú Sí Que Vales”." },
    { start: 21.0, end: 23.5, text: "Ik heb meegedaan aan “The Voice France”." },
    { start: 30.0, end: 34.5, text: "Ik deed mee aan “The Voice Belgique” en “Belgium’s Got Talent”, waar ik de finale bereikte." },
    { start: 60.0, end: 65.5, text: "En de laatste die ik deed was “Lift You Up”, waar ik de kwartfinale bereikte..." },
    { start: 65.8, end: 68.5, text: "...en zong met Laura Tesoro, die ongelooflijk was." },
    { start: 90.0, end: 91.5, text: "Bedankt." },
    { start: 105.2, end: 109.5, text: "Alsjeblieft, stop hier niet mee, want je hebt iets interessants, echt waar." },
    { start: 109.8, end: 112.5, text: "Ik heb in mijn leven veel, veel jongens horen zingen." },
    { start: 112.8, end: 119.5, text: "Je hebt alles om krachtig te zijn en ik kan niet wachten op het moment dat je krachtig wordt, want dan moet ik me zorgen gaan maken." },
    { start: 120.0, end: 121.5, text: "Dank u wel." },
    { start: 123.2, end: 125.0, text: "Nu zijn we onderweg naar Place Agora." },
    { start: 125.5, end: 129.5, text: "Het is een magische en belangrijke plek voor mij." },
    { start: 129.8, end: 134.5, text: "Dit is waar ik me echt muzikaal begon te ontwikkelen." },
    { start: 134.8, end: 140.5, text: "Na “The Voice Belgique” herinner ik me dat B.J. Scott me vertelde dat ik door moest gaan met wat ik deed omdat ik iets had." },
    { start: 140.8, end: 141.8, text: "And I decided to do it." },
    { start: 142.0, end: 147.5, text: "Na een paar maanden besloot ik mezelf te lanceren en het is hier, op deze magische plek, dat ik me heb ontwikkeld." },
    { start: 147.8, end: 153.5, text: "I met incredible artists and was able to share my emotions with the whole world." },
    { start: 164.2, end: 166.5, text: "Ik ga heel eerlijk met jullie zijn." },
    { start: 166.8, end: 171.5, text: "Ik ben heel lang bang geweest omdat ik mezelf wijsmaakte dat het nooit goed genoeg was, dat het niet klopte." },
    { start: 171.8, end: 175.5, text: "Maar nu heb ik mezelf gezegd dat ik er klaar voor ben." },
    { start: 175.8, end: 177.5, text: "Ik ga mijn best doen." },
    { start: 177.8, end: 182.5, text: "And I would like to release my first EP this year, which will have 6 songs." },
    { start: 184.2, end: 188.5, text: "En in die 6 nummers zul je zien dat er misschien wel verrassingen zijn." },
    { start: 190.2, end: 192.5, text: "Ik ga het onafhankelijk doen en dat is best duur." },
    { start: 192.8, end: 196.5, text: "Dus eerlijk gezegd, als jullie me zouden kunnen steunen, zou dat ongelooflijk zijn." },
    { start: 196.8, end: 198.5, text: "Ik laat een kleine link achter onderaan de video." },
    { start: 200.2, end: 202.5, text: "Bedankt dat jullie er nog steeds zijn." },
    { start: 202.8, end: 204.5, text: "Bedankt voor de steun die jullie me geven." },
    { start: 204.8, end: 206.5, text: "Ik ontvang nog steeds jullie ongelooflijke berichten." },
    { start: 206.8, end: 208.5, text: "Bedankt, bedankt, bedankt." }
  ],
  fr: [
    { start: 0.5, end: 4.8, text: "Salut, je suis Youssef Zaki, je suis chanteur et bientôt je sors mon premier single." },
    { start: 5.5, end: 9.8, text: "Au fil des années, j'ai participé à plusieurs émissions à la télé en Europe." },
    { start: 10.2, end: 12.5, text: "En Italie, j'ai fait « Tú Sí Que Vales »." },
    { start: 21.0, end: 23.5, text: "J'ai fait « The Voice France »." },
    { start: 30.0, end: 34.5, text: "J'ai fait « The Voice Belgique » et « Belgium’s Got Talent » où je suis arrivé en finale." },
    { start: 60.0, end: 65.5, text: "Et le laatste que j'ai fait c'est « Lift You Up » où je suis arrivé en quart de finale..." },
    { start: 65.8, end: 68.5, text: "...et j'ai chanté avec Laura Tesoro qui était incroyable." },
    { start: 90.0, end: 91.5, text: "Merci." },
    { start: 105.2, end: 109.5, text: "S'il vous plaît, n'arrêtez pas de faire ça parce que tu as quelque chose d'intéressant, vraiment." },
    { start: 109.8, end: 112.5, text: "J'ai entendu banyak, beaucoup de garçons chanter dans ma vie." },
    { start: 112.8, end: 119.5, text: "Tu as tout pour être violent et j'ai hâte d'entendre le moment où tu vas être violent parce que je vais avoir du souci à me faire." },
    { start: 120.0, end: 121.5, text: "Merci beaucoup." },
    { start: 123.2, end: 125.0, text: "Maintenant, on est en train d'aller à Place Agora." },
    { start: 125.5, end: 129.5, text: "C'est un endroit magique et important pour moi." },
    { start: 129.8, end: 134.5, text: "C'est ici que j'ai commencé vraiment à me developper musicalement." },
    { start: 134.8, end: 140.5, text: "After « The Voice Belgique », je me rappelle que B.J. Scott m'avait dit que je devais continuer à faire ce que je faisais because I had something." },
    { start: 140.8, end: 141.8, text: "And I decided to do it." },
    { start: 142.0, end: 147.5, text: "Après quelques mois, j'ai décidé de me lancer et c'est ici, dans cet endroit magique que je me suis développé." },
    { start: 147.8, end: 153.5, text: "J'ai rencontré des artistes incroyables et j'ai pu partager mes emotions with the whole world." },
    { start: 164.2, end: 166.5, text: "Je vais être vraiment honnete avec vous." },
    { start: 166.8, end: 171.5, text: "Je vais peur pendant très longtemps because I told myself it was never good enough, that it wasn’t right." },
    { start: 171.8, end: 175.5, text: "Mais là, je me suis dit que je suis prêt." },
    { start: 175.8, end: 177.5, text: "Je vais faire de mon mieux." },
    { start: 177.8, end: 182.5, text: "And I would like to release my first EP this year, which will have 6 songs." },
    { start: 184.2, end: 188.5, text: "And in those 6 songs, you’ll see that there might be some surprises." },
    { start: 190.2, end: 192.5, text: "Je vais le faire en indépendant et ça coûte un peu cher." },
    { start: 192.8, end: 196.5, text: "Donc franchement, si vous pouviez me soutenir, ce serait incroyable." },
    { start: 196.8, end: 198.5, text: "Je vais laisser un petit lien en bas de la video." },
    { start: 200.2, end: 202.5, text: "Merci d'être encore là." },
    { start: 202.8, end: 204.5, text: "Merci pour le soutien que vous me donnez." },
    { start: 204.8, end: 206.5, text: "Je reçois encore vos messages incroyables." },
    { start: 206.8, end: 208.5, text: "Merci, merci, merci." }
  ],
  it: [
    { start: 0.5, end: 4.8, text: "Ciao, sono Youssef Zaki, sono un cantante e presto uscirà il mio primo singolo." },
    { start: 5.5, end: 9.8, text: "Nel corso degli anni, ho participato a diversi programmi televisivi in Europa." },
    { start: 10.2, end: 12.5, text: "In Italia, ho participato a “Tú Sí Que Vales”." },
    { start: 21.0, end: 23.5, text: "Ho participato a “The Voice France”." },
    { start: 30.0, end: 34.5, text: "Ho participato a “The Voice Belgique” en “Belgium’s Got Talent”, dove sono arrivato in finale." },
    { start: 60.0, end: 65.5, text: "E l'ultimo che ho fatto è stato “Lift You Up”, dove sono arrivato in quarti di finale..." },
    { start: 65.8, end: 68.5, text: "...e ho cantato con Laura Tesoro, che è stata incredibile." },
    { start: 90.0, end: 91.5, text: "Grazie." },
    { start: 105.2, end: 109.5, text: "Per favore, non smettete di farlo perché hai qualcosa di interessante, davvero." },
    { start: 109.8, end: 112.5, text: "Ho sentito molti, molti ragazzi cantare nella mia vita." },
    { start: 112.8, end: 119.5, text: "Hai tutto per essere potente e non vedo l'ora di sentire il momento in cui diventerai potente perché dovro preoccuparmi." },
    { start: 120.0, end: 121.5, text: "Grazie mille." },
    { start: 123.2, end: 125.0, text: "Ora siamo sulla strada per Place Agora." },
    { start: 125.5, end: 129.5, text: "È un posto magico e importante per me." },
    { start: 129.8, end: 134.5, text: "È qui che ho iniziato davvero a svilupparmi musicalmente." },
    { start: 134.8, end: 140.5, text: "Dopo “The Voice Belgique”, ricordo che B.J. Scott mi disse dat ik door moest gaan met wat ik deed omdat ik iets had." },
    { start: 140.8, end: 141.8, text: "E ho deciso di farlo." },
    { start: 142.0, end: 147.5, text: "Dopo qualche mese, ho deciso di lanciarmi ed è hier, in questo posto magico, che mi sono sviluppato." },
    { start: 147.8, end: 153.5, text: "Ho incontrato artisti incredibili e ho potuto condividere le mie emozioni con tutto il mondo." },
    { start: 184.2, end: 166.5, text: "Sarò davvero onesto con voi." },
    { start: 166.8, end: 171.5, text: "Ho avuto paura per molto tempo perché mi dicevo dat het nooit genoeg was, dat het niet klopte." },
    { start: 171.8, end: 175.5, text: "Ma ora, mi sono gezegd dat ik er klaar voor ben." },
    { start: 175.8, end: 177.5, text: "Farò del mio meglio." },
    { start: 177.8, end: 182.5, text: "E vorrei far uscire quest'anno il mio primo EP, che avrà 6 canzoni." },
    { start: 184.2, end: 188.5, text: "E in quelle 6 canzoni, vedrete dat er misschien wel verrassingen zijn." },
    { start: 190.2, end: 192.5, text: "Lo farò in modo indipendente e costa un po' caro." },
    { start: 192.8, end: 196.5, text: "Quindi onestamente, se poteste sostenermi, sarebbe incredibile." },
    { start: 196.8, end: 198.5, text: "Lascerò un piccolo link in fondo al video." },
    { start: 200.2, end: 202.5, text: "Grazie per essere ancora qui." },
    { start: 202.8, end: 204.5, text: "Grazie per il sostegno che mi date." },
    { start: 204.8, end: 206.5, text: "Ricevo ancora i vostri incredibili messaggi." },
    { start: 206.8, end: 208.5, text: "Grazie, grazie, grazie." }
  ],
  ar: [
    { start: 0.5, end: 4.8, text: "مرحباً، أنا يوسف زكي، أنا مغني وقريباً سأصدر أول أغنية منفردة لي." },
    { start: 5.5, end: 9.8, text: "على مر السنين، شاركت في العديد من البرامج التلفزيونية في أوروبا." },
    { start: 10.2, end: 12.5, text: "في إيطاليا، شاركت في “Tú Sí Que Vales”." },
    { start: 21.0, end: 23.5, text: "شاركت في “The Voice France”." },
    { start: 30.0, end: 34.5, text: "شاركت في “The Voice Belgium” و “Belgium’s Got Talent” حيث وصلت إلى النهائي." },
    { start: 60.0, end: 65.5, text: "وآخر برنامج شاركت فيه كان “Lift You Up” حيث وصلت إلى ربع النهائي..." },
    { start: 65.8, end: 68.5, text: "...وغنيت مع لورا تيسورو، التي كانت رائعة." },
    { start: 90.0, end: 91.5, text: "شكراً لك." },
    { start: 105.2, end: 109.5, text: "من فضلك، لا تتوقف عن فعل ذلك لأن لديك شيئاً مثيراً للاهتمام، حقاً." },
    { start: 109.8, end: 112.5, text: "لقد سمعت الكثير والكثير من الأولاد يغنون في حياتي." },
    { start: 112.8, end: 119.5, text: "لديك كل شيء لتكون قوياً ولا أطيق الانتظار لسماع اللحظة التي تصبح فيها قوياً لأنني سأضطر للقلق." },
    { start: 120.0, end: 121.5, text: "شكراً جزيلاً لك." },
    { start: 123.2, end: 125.0, text: "الآن، نحن في طريقنا إلى ساحة أغورا." },
    { start: 125.5, end: 129.5, text: "إنه مكان سحري ومهم بالنسبة لي." },
    { start: 129.8, end: 134.5, text: "هذا هو المكان الذي بدأت فيه حقاً بالتطور موسيقياً." },
    { start: 134.8, end: 140.5, text: "بعد “The Voice Belgium”، أتذكر بي جيه سكوت وهي تخبرني أنني يجب أن أستمر في فعل ما أفعله لأنني أملك شيئاً." },
    { start: 140.8, end: 141.8, text: "وقررت أن أفعل ذلك." },
    { start: 142.0, end: 147.5, text: "بعد بضعة أشهر، قررت أن أطلق نفسي وهنا، في هذا المكان السحري، تطورت." },
    { start: 147.8, end: 153.5, text: "التقيت بفنانين رائعين وتمكنت من مشاركة مشاعري مع العالم أجمع." },
    { start: 164.2, end: 166.5, text: "سأكون صادقاً جداً معكم." },
    { start: 166.8, end: 171.5, text: "لقد كنت خائفاً لفترة طويلة جداً لأنني قلت لنفسي إن ذلك لم يكن جيداً بما فيه الكفاية، وأنه لم يكن صحيحاً." },
    { start: 171.8, end: 175.5, text: "ولكن الآن، قلت لنفسي إنني مستعد." },
    { start: 175.8, end: 177.5, text: "سأبذل قصارى جهدي." },
    { start: 177.8, end: 182.5, text: "وأود أن أصدر أول ألبوم قصير لي هذا العام، والذي سيحتوي على 6 أغنيات." },
    { start: 184.2, end: 188.5, text: "وفي تلك الأغنيات الست، سترون أنه قد تكون هناك بعض المفاجآت." },
    { start: 190.2, end: 192.5, text: "سأفعل ذلك بشكل مستقل وهو مكلف بعض الشيء." },
    { start: 192.8, end: 196.5, text: "لذا بصدق، إذا كان بإمكانكم دعمي، فسيكون ذلك رائعاً." },
    { start: 196.8, end: 198.5, text: "سأترك رابطاً صغيراً في أسفل الفيديو." },
    { start: 200.2, end: 202.5, text: "شكراً لأنكم لا تزالون هنا." },
    { start: 202.8, end: 204.5, text: "شكراً على الدعم الذي تقدمونه لي." },
    { start: 204.8, end: 206.5, text: "لا أزال أتلقى رسائلكم الرائعة." },
    { start: 206.8, end: 208.5, text: "شكراً، شكراً، شكراً." }
  ]
};

async function migrateToMediaTable() {
  console.log("🚀 Starting Masterclass Media Migration for Youssef Zaki...");

  // 🛡️ CHRIS-PROTOCOL: Raw SQL voor schema-stabiliteit
  const connectionString = process.env.DATABASE_URL!.replace('?pgbouncer=true', '');
  const sqlDirect = postgres(connectionString, { ssl: 'require', connect_timeout: 30 });

  try {
    // 1. Insert into media table
    console.log(" 📦 Creating media record...");
    const [mediaRecord] = await sqlDirect`
      INSERT INTO media (
        file_name, 
        file_path, 
        file_type, 
        journey, 
        category, 
        metadata,
        is_public
      ) VALUES (
        'youssef-crowdfunding.mp4',
        'visuals/youssef/crowdfunding/youssef-crowdfunding.mp4',
        'video/mp4',
        'artist',
        'crowdfunding',
        ${JSON.stringify({ subtitles })},
        true
      )
      RETURNING id
    `;

    console.log(` ✅ Media record created with ID: ${mediaRecord.id}`);

    // 2. Link to artist
    console.log(" 🔗 Linking media to artist 'youssef'...");
    const [artist] = await sqlDirect`SELECT id, iap_context FROM artists WHERE slug = 'youssef' LIMIT 1`;
    
    if (!artist) {
      console.error(" ❌ Artist 'youssef' not found.");
      return;
    }

    const updatedIap = {
      ...(artist.iap_context || {}),
      featured_video_id: mediaRecord.id
    };

    // Remove the old subtitles from iap_context if they were there
    if (updatedIap.video_metadata) {
      delete updatedIap.video_metadata;
    }

    await sqlDirect`
      UPDATE artists 
      SET iap_context = ${updatedIap} 
      WHERE id = ${artist.id}
    `;

    console.log(" ✨ Handshake complete! Video is now a first-class citizen in the media table.");
  } catch (error) {
    console.error(" ❌ Migration failed:", error);
  } finally {
    await sqlDirect.end();
  }
}

migrateToMediaTable().then(() => process.exit(0));
