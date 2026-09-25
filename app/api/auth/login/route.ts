import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

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

    // Fast static check for authorized role accounts
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

    // Query Supabase PostgreSQL for custom registered interviewer/employee accounts
    try {
      const { data: dbUser, error } = await supabaseAdmin
        .from('interviewers')
        .select('*')
        .or(`email.eq.${cleanId},mobile.eq.${cleanId}`)
        .eq('active', true)
        .maybeSingle();

      if (dbUser && (cleanPass === '352004' || cleanPass === dbUser.mobile)) {
        return NextResponse.json({
          success: true,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            mobile: dbUser.mobile,
            role: dbUser.email?.includes('admin') || dbUser.name?.toLowerCase().includes('admin') ? 'ADMIN' : 'INTERVIEWER',
            active: dbUser.active,
            created_at: dbUser.created_at,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Supabase login query warning:', dbErr);
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
