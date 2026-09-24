import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { deleteDemoDataMongo } from '@/lib/db/mongo-server';
import { seedMongoDatabase } from '@/lib/db/mongo-init';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    await seedMongoDatabase();
    await deleteDemoDataMongo();

    return NextResponse.json({
      success: true,
      message: 'Demo survey data cleaned up successfully from MongoDB.',
    });
  } catch (error: any) {
    console.error('Error purging demo data:', error);
    return NextResponse.json({ error: 'Cleanup failed: ' + error.message }, { status: 500 });
  }
}
