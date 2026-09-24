import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { deleteInterviewMongo, getInterviewByIdMongo } from '@/lib/db/mongo-server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const data = await getInterviewByIdMongo(id);
    if (!data) {
      return NextResponse.json({ error: 'Interview record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('Error fetching survey by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch interview details' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    // Verify Admin Header / Role from request if passed or authorization token
    const roleHeader = request.headers.get('x-user-role');
    if (roleHeader && roleHeader !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Admin users have permission to delete survey records.' },
        { status: 403 }
      );
    }

    const success = await deleteInterviewMongo(id);
    if (!success) {
      return NextResponse.json({ error: 'Survey record not found or could not be deleted' }, { status: 404 });
    }

    console.log(`🗑️ Survey Record Deleted from MongoDB: ${id}`);
    return NextResponse.json({
      success: true,
      message: 'Survey record and associated data deleted from MongoDB.',
      deletedId: id,
    });
  } catch (error: any) {
    console.error('Error deleting survey:', error);
    return NextResponse.json({ error: 'Failed to delete survey record: ' + error.message }, { status: 500 });
  }
}
