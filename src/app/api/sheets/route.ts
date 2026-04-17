import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getAuthForRequest } from '@/lib/google-auth';

export async function GET(req: NextRequest) {
  const sheetId = req.nextUrl.searchParams.get('id');
  const shareId = req.nextUrl.searchParams.get('share');

  if (!sheetId) {
    return NextResponse.json({ error: 'Missing sheet id' }, { status: 400 });
  }

  // Try authenticated access (own session OR share token)
  const authResult = await getAuthForRequest(shareId);

  if (authResult) {
    try {
      const sheets = google.sheets({ version: 'v4', auth: authResult.client });

      // If accessing via share, the sheetId must match the share
      if (authResult.share && authResult.share.sheetId !== sheetId) {
        return NextResponse.json({ error: 'Share token does not match this sheet' }, { status: 403 });
      }

      let sheetName = 'Sheet1';
      const gid = req.nextUrl.searchParams.get('gid') || authResult.share?.gid || null;

      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
      const allSheets = spreadsheet.data.sheets || [];

      if (gid) {
        const target = allSheets.find(s => String(s.properties?.sheetId) === gid);
        if (target) sheetName = target.properties?.title || sheetName;
      } else {
        sheetName = allSheets[0]?.properties?.title || sheetName;
      }

      // Fetch values AND notes in one call
      const fullSheet = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        ranges: [`'${sheetName}'`],
        fields: 'sheets.data.rowData.values(userEnteredValue,note)',
      });

      const rowData = fullSheet.data.sheets?.[0]?.data?.[0]?.rowData || [];

      // Extract values as 2D string array
      const values: string[][] = rowData.map(row =>
        (row.values || []).map(cell => cell?.userEnteredValue?.stringValue || cell?.userEnteredValue?.numberValue?.toString() || '')
      );

      // Extract notes keyed by row index
      const notes: Record<number, Record<number, string>> = {};
      rowData.forEach((row, rowIdx) => {
        (row.values || []).forEach((cell, colIdx) => {
          if (cell?.note) {
            if (!notes[rowIdx]) notes[rowIdx] = {};
            notes[rowIdx][colIdx] = cell.note;
          }
        });
      });

      return NextResponse.json({
        authenticated: true,
        sheetName,
        values,
        notes,
      });
    } catch (err) {
      console.error('Sheets API error:', err);
      // Fall through to public endpoint
    }
  }

  // Fallback: public gviz endpoint
  const gid = req.nextUrl.searchParams.get('gid');
  let url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&headers=1`;
  if (gid) url += `&gid=${gid}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Google returned ${res.status}. Sign in with Google or use a share link.` },
        { status: 502 },
      );
    }
    const text = await res.text();
    return new NextResponse(text, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to fetch sheet: ${err instanceof Error ? err.message : 'unknown error'}` },
      { status: 502 },
    );
  }
}
