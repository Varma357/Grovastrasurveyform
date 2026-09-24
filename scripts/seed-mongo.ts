import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { seedMongoDatabase } from '../lib/db/mongo-init';

async function runSeed() {
  console.log('🚀 Starting MongoDB Production Seeding...');
  const success = await seedMongoDatabase();
  if (success) {
    console.log('🎉 MongoDB database successfully seeded!');
  } else {
    console.error('💥 Failed to seed MongoDB database.');
  }
  process.exit(success ? 0 : 1);
}

runSeed();
