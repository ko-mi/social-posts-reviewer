import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUrl } from '@/lib/google-auth';

export async function GET(req: NextRequest) {
  // Save the page the user came from so we can redirect back after auth
  const returnTo = req.nextUrl.searchParams.get('returnTo') || req.headers.get('referer') || '/';
  const cookieStore = await cookies();
  cookieStore.set('auth_return_to', returnTo, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
