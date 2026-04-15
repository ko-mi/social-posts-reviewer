import { NextRequest, NextResponse } from 'next/server';

// In-memory cache: URL → { buffer, contentType, timestamp }
const cache = new Map<string, { buffer: ArrayBuffer; contentType: string; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  // Check cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return new NextResponse(cached.buffer, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      return NextResponse.json({ error: `Image fetch failed: ${res.status}` }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    // Store in cache
    cache.set(url, { buffer, contentType, ts: Date.now() });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch image: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 502 },
    );
  }
}
