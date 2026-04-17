import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { getAuthForRequest } from '@/lib/google-auth';

async function resolveAttribution(shareId: string | null, providedUserName?: string): Promise<{ name: string; email: string }> {
  // If a userName was provided (client via share link), use that
  if (providedUserName?.trim()) {
    return { name: providedUserName.trim(), email: '' };
  }

  // If no userName but has share token, mark as Anonymous
  if (shareId) {
    return { name: 'Anonymous', email: '' };
  }

  // Otherwise, use the signed-in user
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('google_user');
  if (userCookie) {
    try {
      const u = JSON.parse(userCookie.value);
      return { name: u.name || 'Unknown', email: u.email || '' };
    } catch {
      // fall through
    }
  }
  return { name: 'Unknown', email: '' };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sheetId, postId, variant, approved, comment, gid, share, userName } = body;

  if (!sheetId || !postId) {
    return NextResponse.json({ error: 'Missing sheetId or postId' }, { status: 400 });
  }

  const authResult = await getAuthForRequest(share);
  if (!authResult) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Verify share matches sheet
  if (authResult.share && authResult.share.sheetId !== sheetId) {
    return NextResponse.json({ error: 'Share does not match sheet' }, { status: 403 });
  }

  const user = await resolveAttribution(share, userName);

  try {
    const sheets = google.sheets({ version: 'v4', auth: authResult.client });

    // Get sheet metadata
    const effectiveGid = gid || authResult.share?.gid;
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const allSheets = spreadsheet.data.sheets || [];
    let targetSheet = allSheets[0];
    if (effectiveGid) {
      const found = allSheets.find(s => String(s.properties?.sheetId) === effectiveGid);
      if (found) targetSheet = found;
    }
    const sheetName = targetSheet?.properties?.title || 'Sheet1';
    const numericSheetId = targetSheet?.properties?.sheetId ?? 0;

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'!1:1`,
    });
    const headers = (headerRes.data.values?.[0] || []).map((h: string) => h.toLowerCase().trim());

    const postIdCol = headers.indexOf('post id');
    const variantCol = headers.indexOf('variant');
    const approvedCol = headers.indexOf('approved');
    const reviewedCol = headers.indexOf('reviewed at');

    if (approvedCol === -1) {
      return NextResponse.json({ error: 'No "Approved" column found' }, { status: 400 });
    }

    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'`,
    });
    const rows = dataRes.data.values || [];

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowId = (rows[i][postIdCol >= 0 ? postIdCol : 0] || '').toString().trim();
      const rowVariant = variantCol >= 0 ? (rows[i][variantCol] || '').toString().trim() : '';
      if (rowId === postId && (!variant || rowVariant === variant)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json({ error: `Post "${postId}" variant "${variant}" not found` }, { status: 404 });
    }

    const rowNum = rowIndex + 1;

    if (approved) {
      const approvedLetter = String.fromCharCode(65 + approvedCol);
      const approvedValue = approved === 'approved' ? '✅' : approved === 'rejected' ? '❌' : '';
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${sheetName}'!${approvedLetter}${rowNum}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[approvedValue]] },
      });
    }

    if (reviewedCol >= 0) {
      const reviewedLetter = String.fromCharCode(65 + reviewedCol);
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `'${sheetName}'!${reviewedLetter}${rowNum}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[new Date().toISOString()]] },
      });
    }

    if (comment && comment.trim()) {
      const cellRes = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        ranges: [`'${sheetName}'!${String.fromCharCode(65 + approvedCol)}${rowNum}`],
        fields: 'sheets.data.rowData.values.note',
      });

      const existingNote = cellRes.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0]?.note || '';

      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const newLine = `${user.name} (${timestamp}): ${comment.trim()}`;
      const fullNote = existingNote ? `${existingNote}\n${newLine}` : newLine;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            updateCells: {
              rows: [{ values: [{ note: fullNote }] }],
              fields: 'note',
              range: {
                sheetId: numericSheetId,
                startRowIndex: rowIndex,
                endRowIndex: rowIndex + 1,
                startColumnIndex: approvedCol,
                endColumnIndex: approvedCol + 1,
              },
            },
          }],
        },
      });
    }

    return NextResponse.json({ success: true, postId, variant, approved, row: rowNum });
  } catch (err) {
    console.error('Feedback write error:', err);
    return NextResponse.json(
      { error: `Failed to write feedback: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 500 },
    );
  }
}

// GET: Read the cell note (comments) for a specific post
export async function GET(req: NextRequest) {
  const sheetId = req.nextUrl.searchParams.get('sheetId');
  const postId = req.nextUrl.searchParams.get('postId');
  const variant = req.nextUrl.searchParams.get('variant');
  const gid = req.nextUrl.searchParams.get('gid');
  const shareId = req.nextUrl.searchParams.get('share');

  if (!sheetId || !postId) {
    return NextResponse.json({ comments: [] });
  }

  const authResult = await getAuthForRequest(shareId);
  if (!authResult) {
    return NextResponse.json({ comments: [] });
  }

  if (authResult.share && authResult.share.sheetId !== sheetId) {
    return NextResponse.json({ comments: [] });
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: authResult.client });

    const effectiveGid = gid || authResult.share?.gid;
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const allSheets = spreadsheet.data.sheets || [];
    let targetSheet = allSheets[0];
    if (effectiveGid) {
      const found = allSheets.find(s => String(s.properties?.sheetId) === effectiveGid);
      if (found) targetSheet = found;
    }
    const sheetName = targetSheet?.properties?.title || 'Sheet1';

    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'!1:1`,
    });
    const headers = (headerRes.data.values?.[0] || []).map((h: string) => h.toLowerCase().trim());
    const postIdCol = headers.indexOf('post id');
    const variantCol = headers.indexOf('variant');
    const approvedCol = headers.indexOf('approved');

    if (approvedCol === -1) return NextResponse.json({ comments: [] });

    const dataRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${sheetName}'`,
    });
    const rows = dataRes.data.values || [];

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const rowId = (rows[i][postIdCol >= 0 ? postIdCol : 0] || '').toString().trim();
      const rowVariant = variantCol >= 0 ? (rows[i][variantCol] || '').toString().trim() : '';
      if (rowId === postId && (!variant || rowVariant === variant)) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) return NextResponse.json({ comments: [] });

    const cellRes = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      ranges: [`'${sheetName}'!${String.fromCharCode(65 + approvedCol)}${rowIndex + 1}`],
      fields: 'sheets.data.rowData.values.note',
    });

    const note = cellRes.data.sheets?.[0]?.data?.[0]?.rowData?.[0]?.values?.[0]?.note || '';

    const comments = note.split('\n').filter(Boolean).map(line => {
      const match = line.match(/^(.+?)\s*\((.+?)\):\s*(.+)$/);
      if (match) {
        return { userName: match[1], timestamp: match[2], comment: match[3] };
      }
      return { userName: 'Unknown', timestamp: '', comment: line };
    });

    return NextResponse.json({ comments });
  } catch (err) {
    console.error('Comments read error:', err);
    return NextResponse.json({ comments: [] });
  }
}
