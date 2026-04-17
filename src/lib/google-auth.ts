import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { getShareStore } from './share-store';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5301/api/auth/callback'
  );
}

export function getAuthUrl() {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

export async function getTokensFromCode(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('google_tokens');
  if (!tokenCookie) return null;

  try {
    const tokens = JSON.parse(tokenCookie.value);
    const client = getOAuth2Client();
    client.setCredentials(tokens);

    // Check if token needs refresh
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      const { credentials } = await client.refreshAccessToken();
      client.setCredentials(credentials);

      // Update cookie with new tokens
      cookieStore.set('google_tokens', JSON.stringify(credentials), {
        httpOnly: true,
        secure: false, // localhost
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return client;
  } catch {
    return null;
  }
}

/**
 * Get an authenticated OAuth2 client using either:
 * - The current user's session cookie (contractor)
 * - A share token (client accessing via shared link)
 *
 * Returns the client and the share record (if accessed via share token).
 */
export async function getAuthForRequest(shareId?: string | null) {
  // Try share token first
  if (shareId) {
    const share = await getShareStore().get(shareId);
    if (share) {
      const client = getOAuth2Client();
      client.setCredentials(share.tokens);

      // Refresh if expired
      if (share.tokens.expiry_date && share.tokens.expiry_date < Date.now()) {
        try {
          const { credentials } = await client.refreshAccessToken();
          client.setCredentials(credentials);
          // Update stored tokens
          await getShareStore().set(shareId, { ...share, tokens: credentials });
        } catch (err) {
          console.error('Failed to refresh share token:', err);
          return null;
        }
      }

      return { client, share };
    }
  }

  // Fall back to user's own session
  const userClient = await getAuthenticatedClient();
  if (userClient) return { client: userClient, share: null };

  return null;
}

export async function getUserInfo(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ email: string; name: string; picture: string }>;
}
