import { NextResponse } from 'next/server';
import { getInterviewByIdSupabase, deleteInterviewSupabase } from '@/lib/db/supabase-server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await getInterviewByIdSupabase(id);
    if (!data) {
      return NextResponse.json({ error: 'Interview record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Error fetching survey by ID from Supabase:', error);
    return NextResponse.json({ error: 'Failed to fetch interview details from Supabase' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify Admin Header / Role from request if passed or authorization token
    const roleHeader = request.headers.get('x-user-role');
    if (roleHeader && roleHeader !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Admin users have permission to delete survey records.' },
        { status: 403 }
      );
    }

    const success = await deleteInterviewSupabase(id);
    if (!success) {
      return NextResponse.json({ error: 'Survey record not found or could not be deleted' }, { status: 404 });
    }

    console.log(`🗑️ Survey Record Deleted from Supabase: ${id}`);
    return NextResponse.json({
      success: true,
      message: 'Survey record and associated data deleted from Supabase PostgreSQL.',
      deletedId: id,
    });
  } catch (error: any) {
    console.error('Error deleting survey from Supabase:', error);
    return NextResponse.json({ error: 'Failed to delete survey record: ' + error.message }, { status: 500 });
  }
}
