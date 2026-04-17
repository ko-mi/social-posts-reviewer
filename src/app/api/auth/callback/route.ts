import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTokensFromCode, getUserInfo } from '@/lib/google-auth';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', req.url));
  }

  try {
    const tokens = await getTokensFromCode(code);

    const cookieStore = await cookies();
    cookieStore.set('google_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    // Store user info in a separate non-httpOnly cookie so client can read it
    if (tokens.access_token) {
      const user = await getUserInfo(tokens.access_token);
      if (user) {
        cookieStore.set('google_user', JSON.stringify({
          email: user.email,
          name: user.name,
          picture: user.picture,
        }), {
          httpOnly: false,
          secure: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
          path: '/',
        });
      }
    }

    // Redirect back to where the user came from
    const returnTo = cookieStore.get('auth_return_to')?.value || '/';
    cookieStore.delete('auth_return_to');
    return NextResponse.redirect(new URL(returnTo, req.url));
  } catch (err) {
    console.error('OAuth callback error:', err);
    const cookieStore2 = await cookies();
    const returnTo = cookieStore2.get('auth_return_to')?.value || '/';
    return NextResponse.redirect(new URL(`${returnTo}${returnTo.includes('?') ? '&' : '?'}error=auth_failed`, req.url));
  }
}
