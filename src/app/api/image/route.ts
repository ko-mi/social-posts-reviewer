import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      return NextResponse.json({ error: `Image fetch failed: ${res.status}` }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch image: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 502 }
    );
  }
}
