import { ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { actorDemos } from "../../packages/database/src/schema/index";

async function findDemosByFilename() {
  try {
    const keywords = ['Mountain', 'Upbeat', 'Free', 'Around-the-world', 'Before-you', 'Come-back', 'Enjoy', 'Sunday', 'Sky', 'Sunlapse', 'Happy', 'Homecoming', 'Warm', 'Open', 'Promotional', 'Joyful', 'Relax', 'Summer', 'Midwest', 'Modern'];
    
    const conditions = keywords.flatMap(k => [
      ilike(actorDemos.url, `%${k}%`),
      ilike(actorDemos.name, `%${k}%`)
    ]);
    
    const results = await db.select().from(actorDemos).where(or(...conditions));
    
    console.log("Gevonden demos in actor_demos:");
    console.log(JSON.stringify(results.map(d => ({ 
      id: d.id, 
      actorId: d.actorId,
      name: d.name, 
      url: d.url
    })), null, 2));

  } catch (error) {
    console.error("Fout:", error);
  }
}

findDemosByFilename();
