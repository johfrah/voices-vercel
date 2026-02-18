import { ilike } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { actors } from "../../packages/database/src/schema/index";

async function checkActors() {
  try {
    const musicActors = await db.select().from(actors).where(
      ilike(actors.tagline, '%geschikte wachtmuziek%')
    );
    
    console.log("Music products found in actors table by tagline:");
    console.log(JSON.stringify(musicActors.map(a => ({ 
      id: a.id, 
      firstName: a.firstName, 
      lastName: a.lastName, 
      tagline: a.tagline,
      status: a.status
    })), null, 2));

  } catch (error) {
    console.error("Error checking actors:", error);
  }
}

checkActors();
