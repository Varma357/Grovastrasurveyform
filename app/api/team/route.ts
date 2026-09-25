import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase-admin';

// ─── GET: List all team members from Supabase ────────────────────────────────
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('interviewers')
      .select('id, name, email, mobile, role, active, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase GET team error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }

    return NextResponse.json({ success: true, team: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}

// ─── POST: Create a new team member in Supabase ──────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, role, password } = body;

    if (!name || !email || !mobile || !password) {
      return NextResponse.json({ error: 'Name, email, mobile, and password are required' }, { status: 400 });
    }

    const newMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      role: role || 'INTERVIEWER',
      password: password.trim(),
      active: true,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('interviewers')
      .upsert(newMember, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      console.error('Supabase POST team error:', error.message);
      return NextResponse.json({ error: 'Failed to create team member: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}

// ─── DELETE: Remove a team member by ID ──────────────────────────────────────
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Prevent deleting the core admin accounts
    const PROTECTED_IDS = ['a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'];
    if (PROTECTED_IDS.includes(id)) {
      return NextResponse.json({ error: 'Cannot delete core system accounts' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('interviewers')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}
