import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const sheetId = req.nextUrl.searchParams.get('id');
  if (!sheetId) {
    return NextResponse.json({ error: 'Missing sheet id' }, { status: 400 });
  }

  const gid = req.nextUrl.searchParams.get('gid');
  let url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1`;
  if (gid) url += `&gid=${gid}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Google returned ${res.status}. Make sure the sheet is published to web.` },
        { status: 502 }
      );
    }
    const text = await res.text();
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch sheet: ${err instanceof Error ? err.message : 'unknown error'}` },
      { status: 502 }
    );
  }
}
