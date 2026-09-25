import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Mobile and Password are required' },
        { status: 400 }
      );
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // ── 1. Try Supabase lookup by email ──────────────────────────────────────
    let dbUser: any = null;

    const { data: byEmail } = await supabaseAdmin
      .from('interviewers')
      .select('*')
      .eq('email', cleanId)
      .eq('active', true)
      .maybeSingle();

    if (byEmail) {
      dbUser = byEmail;
    } else {
      // ── 2. Try Supabase lookup by mobile ─────────────────────────────────
      const { data: byMobile } = await supabaseAdmin
        .from('interviewers')
        .select('*')
        .eq('mobile', cleanId)
        .eq('active', true)
        .maybeSingle();

      if (byMobile) dbUser = byMobile;
    }

    // ── 3. Validate password ─────────────────────────────────────────────────
    if (dbUser) {
      const storedPassword = dbUser.password || '';
      const storedMobile = dbUser.mobile || '';
      // Accept: stored password, mobile number as password, or master PIN 352004
      const passwordValid =
        cleanPass === storedPassword ||
        cleanPass === storedMobile ||
        cleanPass === '352004';

      if (passwordValid) {
        const role = dbUser.role || (
          dbUser.email?.includes('admin') || dbUser.name?.toLowerCase() === 'rajesh'
            ? 'ADMIN'
            : 'INTERVIEWER'
        );

        return NextResponse.json({
          success: true,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            mobile: dbUser.mobile,
            role,
            active: dbUser.active,
            created_at: dbUser.created_at,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Incorrect password. Please check your credentials.' },
          { status: 401 }
        );
      }
    }

    // ── 4. Hardcoded fallback for core system accounts (if Supabase unreachable) ──
    if ((cleanId === 'rajesh@groviews.com' || cleanId === '7901003210') &&
        (cleanPass === '7901003210' || cleanPass === '352004')) {
      return NextResponse.json({
        success: true,
        user: { id: 'a0000000-0000-0000-0000-000000000002', name: 'Rajesh', email: 'rajesh@groviews.com', mobile: '7901003210', role: 'ADMIN', active: true, created_at: new Date().toISOString() },
      });
    }

    if ((cleanId === 'navadeep@groviews.com' || cleanId === '9704917189') &&
        (cleanPass === '9704917189' || cleanPass === '352004')) {
      return NextResponse.json({
        success: true,
        user: { id: 'a0000000-0000-0000-0000-000000000001', name: 'Navadeep', email: 'navadeep@groviews.com', mobile: '9704917189', role: 'INTERVIEWER', active: true, created_at: new Date().toISOString() },
      });
    }

    return NextResponse.json(
      { error: 'No account found with this email or mobile number. Please contact your admin.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Authentication server error: ' + error.message }, { status: 500 });
  }
}

