import { NextResponse } from 'next/server';
import { seedSupabaseDatabase } from '@/lib/db/supabase-seed';

export async function POST(request: Request) {
  try {
    await seedSupabaseDatabase();

    return NextResponse.json({
      success: true,
      message: 'Supabase database initialized and cleaned up successfully.',
    });
  } catch (error: any) {
    console.error('Error in Supabase cleanup/seed:', error);
    return NextResponse.json({ error: 'Cleanup failed: ' + error.message }, { status: 500 });
  }
}
