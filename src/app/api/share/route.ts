import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getShareStore, generateShareId, type Share } from '@/lib/share-store';

// POST: Create a share token (contractor only — uses their session)
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('google_tokens');
  const userCookie = cookieStore.get('google_user');

  if (!tokenCookie || !userCookie) {
    return NextResponse.json({ error: 'Sign in first to create a share link' }, { status: 401 });
  }

  const body = await req.json();
  const { sheetId, gid, label } = body;

  if (!sheetId) {
    return NextResponse.json({ error: 'Missing sheetId' }, { status: 400 });
  }

  try {
    const tokens = JSON.parse(tokenCookie.value);
    const user = JSON.parse(userCookie.value);

    const id = generateShareId();
    const share: Share = {
      sheetId,
      gid: gid || undefined,
      tokens,
      createdByName: user.name || 'Unknown',
      createdByEmail: user.email || '',
      createdAt: Date.now(),
      label: label || undefined,
    };

    await getShareStore().set(id, share);

    return NextResponse.json({
      success: true,
      id,
      sheetId,
      gid: share.gid,
      createdAt: share.createdAt,
      label: share.label,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to create share: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 500 },
    );
  }
}

// GET: List shares created by the current user
export async function GET() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('google_user');

  if (!userCookie) {
    return NextResponse.json({ shares: [] });
  }

  try {
    const user = JSON.parse(userCookie.value);
    const shares = await getShareStore().list(user.email);

    return NextResponse.json({
      shares: shares.map(({ id, share }) => ({
        id,
        sheetId: share.sheetId,
        gid: share.gid,
        createdAt: share.createdAt,
        label: share.label,
      })),
    });
  } catch {
    return NextResponse.json({ shares: [] });
  }
}

// DELETE: Revoke a share token
export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('google_user');

  if (!userCookie) {
    return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const user = JSON.parse(userCookie.value);
    const share = await getShareStore().get(id);

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }
    if (share.createdByEmail !== user.email) {
      return NextResponse.json({ error: 'Not your share to revoke' }, { status: 403 });
    }

    await getShareStore().delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to revoke: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 500 },
    );
  }
}
