import { syncAllData, seedInstructorBios } from './lib/sync/bridge';

/**
 * VOICES OS - DATABASE CLI TOOL
 * 
 * Gebruik: npx ts-node src/db-cli.ts sync
 */

async function main() {
  const command = process.argv[2];

  if (command === 'sync') {
    await syncAllData();
    process.exit(0);
  } else if (command === 'seed-instructors') {
    await seedInstructorBios();
    process.exit(0);
  } else {
    console.log('Usage: npx ts-node src/db-cli.ts <command>');
    console.log('Available commands: sync, seed-instructors');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
