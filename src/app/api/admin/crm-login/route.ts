import { NextResponse } from 'next/server';
import { signSessionToken } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Check against standard environment variable or hardcoded fallback limit  
    const MASTER_PASSWORD = process.env.CRM_MASTER_PASSWORD || 'subaru5889@';

    if (password === MASTER_PASSWORD) {
      const response = NextResponse.json({ success: true });

      const token = await signSessionToken({ role: 'admin' });

      // Set secure HTTP-only cookie
      response.cookies.set({
        name: 'crm_session',
        value: token,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
