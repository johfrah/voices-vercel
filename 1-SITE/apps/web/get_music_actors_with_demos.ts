import { ilike } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { actors } from "../../packages/database/src/schema/index";

async function getMusicActors() {
  try {
    const musicActors = await db.query.actors.findMany({
      where: ilike(actors.tagline, '%geschikte wachtmuziek%'),
      with: {
        demos: true
      }
    });
    
    console.log("Muziekproducten (als actors):");
    console.log(JSON.stringify(musicActors.map(a => ({
      id: a.id,
      name: a.firstName,
      tagline: a.tagline,
      status: a.status,
      demos: a.demos.map(d => ({ id: d.id, name: d.name, url: d.url }))
    })), null, 2));

  } catch (error) {
    console.error("Fout:", error);
  }
}

getMusicActors();
