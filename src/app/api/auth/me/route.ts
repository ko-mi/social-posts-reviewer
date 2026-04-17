import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('google_user');
  const tokenCookie = cookieStore.get('google_tokens');

  if (!tokenCookie || !userCookie) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
