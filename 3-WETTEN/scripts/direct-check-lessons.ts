import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  try {
    const lessons = await sql`SELECT * FROM lessons`;
    console.log(`TOTAL_LESSONS: ${lessons.length}`);
    lessons.forEach(l => {
      console.log(`- ID: ${l.id}, Title: ${l.title}, Order: ${l.display_order}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

main();
