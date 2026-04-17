import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('google_tokens');
  cookieStore.delete('google_user');
  return NextResponse.redirect(new URL('/', req.url));
}
