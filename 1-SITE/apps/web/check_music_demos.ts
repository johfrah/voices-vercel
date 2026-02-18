import { ilike, or } from "drizzle-orm";
import { db } from "../../packages/database/src/index";
import { actors } from "../../packages/database/src/schema/index";

async function checkMusicDemos() {
  try {
    const musicActors = await db.query.actors.findMany({
      where: or(
        ilike(actors.tagline, '%geschikte wachtmuziek%'),
        ilike(actors.firstName, '%Mountain%'),
        ilike(actors.firstName, '%Upbeat%'),
        ilike(actors.firstName, '%Free%')
      ),
      with: {
        demos: true
      }
    });
    
    console.log("Muziekproducten en hun demo-URL's:");
    musicActors.forEach(a => {
      console.log(`\nActor: ${a.firstName} (ID: ${a.id}, Status: ${a.status})`);
      if (a.demos && a.demos.length > 0) {
        a.demos.forEach(d => {
          console.log(`  - Demo: ${d.name}, URL: ${d.url}`);
        });
      } else {
        console.log("  - GEEN DEMOS GEVONDEN");
      }
    });

  } catch (error) {
    console.error("Fout:", error);
  }
}

checkMusicDemos();
