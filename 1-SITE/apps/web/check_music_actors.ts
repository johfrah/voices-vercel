import { ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { actors } from "../../packages/database/src/schema/index";

async function checkActors() {
  try {
    const musicActors = await db.select().from(actors).where(
      or(
        ilike(actors.firstName, '%Mountain%'),
        ilike(actors.firstName, '%Upbeat%'),
        ilike(actors.firstName, '%Happy%'),
        ilike(actors.firstName, '%Dreamy%')
      )
    );
    
    console.log("Music products found in actors table:");
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
