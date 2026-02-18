import { db } from "../../packages/database/src/index";
import { ademingTracks } from "../../packages/database/src/schema/index";

async function checkAdemingTracks() {
  try {
    const tracks = await db.select().from(ademingTracks).limit(50);
    console.log("Ademing tracks:");
    console.log(JSON.stringify(tracks.map(t => ({ 
      id: t.id, 
      title: t.title, 
      vibe: t.vibe,
      isPublic: t.isPublic
    })), null, 2));

  } catch (error) {
    console.error("Error checking ademing tracks:", error);
  }
}

checkAdemingTracks();
