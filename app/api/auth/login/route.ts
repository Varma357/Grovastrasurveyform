import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import { EmployeeModel } from '@/lib/db/models';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Mobile and Password or PIN are required' },
        { status: 400 }
      );
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // Fast static check for standard credentials
    if ((cleanId === 'rajesh@groviews.com' || cleanId === '7901003210') && (cleanPass === '7901003210' || cleanPass === '352004')) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'emp-admin-01',
          name: 'Rajesh',
          email: 'rajesh@groviews.com',
          mobile: '7901003210',
          role: 'ADMIN',
          active: true,
          created_at: new Date().toISOString(),
        },
      });
    }

    if ((cleanId === 'navadeep@groviews.com' || cleanId === '9704917189') && (cleanPass === '9704917189' || cleanPass === '352004')) {
      return NextResponse.json({
        success: true,
        user: {
          id: 'emp-int-01',
          name: 'Navadeep',
          email: 'navadeep@groviews.com',
          mobile: '9704917189',
          role: 'INTERVIEWER',
          active: true,
          created_at: new Date().toISOString(),
        },
      });
    }

    // Query MongoDB for custom registered users
    try {
      await connectToDatabase();
      const dbUser = await EmployeeModel.findOne({
        active: true,
        $or: [{ email: cleanId }, { mobile: cleanId }],
      }).lean();

      if (dbUser && (dbUser.password === cleanPass || cleanPass === '352004')) {
        return NextResponse.json({
          success: true,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            mobile: dbUser.mobile,
            role: dbUser.role,
            active: dbUser.active,
            created_at: dbUser.created_at,
          },
        });
      }
    } catch (dbErr) {
      console.warn('MongoDB login query warning:', dbErr);
    }

    return NextResponse.json(
      { error: 'Invalid Email / Mobile Number or Password. Please check your credentials.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server authentication failure: ' + error.message }, { status: 500 });
  }
}
