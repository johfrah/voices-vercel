import { inArray } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { actors } from "../../packages/database/src/schema/index";

async function checkActors() {
  try {
    const specificActors = await db.select().from(actors).where(
      inArray(actors.id, [1706, 1637, 1633, 1634, 1635, 1638, 1640])
    );
    
    console.log("Specific actors found:");
    console.log(JSON.stringify(specificActors.map(a => ({ 
      id: a.id, 
      firstName: a.firstName, 
      lastName: a.lastName, 
      tagline: a.tagline,
      status: a.status,
      nativeLang: a.nativeLang
    })), null, 2));

  } catch (error) {
    console.error("Error checking actors:", error);
  }
}

checkActors();
