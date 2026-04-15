import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sheetId, postId, approved, comment } = body;

  if (!sheetId || !postId) {
    return NextResponse.json({ error: 'Missing sheetId or postId' }, { status: 400 });
  }

  // TODO: Implement Google Sheets API write-back with service account
  // For MVP, this endpoint acknowledges the feedback
  // Full implementation needs:
  // 1. GOOGLE_SERVICE_ACCOUNT_KEY env var
  // 2. googleapis npm package
  // 3. Sheet shared with service account email

  console.log(`[Feedback] Sheet: ${sheetId}, Post: ${postId}, Approved: ${approved}, Comment: ${comment}`);

  return NextResponse.json({
    success: true,
    message: 'Feedback saved locally. Google Sheets write-back requires service account setup.',
    data: { postId, approved, comment },
  });
}
