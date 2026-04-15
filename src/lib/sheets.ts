import { SocialPost, Platform } from './types';

const VALID_PLATFORMS: Platform[] = ['linkedin', 'twitter', 'facebook', 'instagram'];

function parsePlatform(raw: string): Platform {
  const lower = raw.toLowerCase().trim();
  if (lower === 'x' || lower === 'x (twitter)') return 'twitter';
  if (VALID_PLATFORMS.includes(lower as Platform)) return lower as Platform;
  return 'linkedin';
}

function parseApproval(raw: string): 'approved' | 'rejected' | null {
  const lower = raw.toLowerCase().trim();
  if (lower === 'approved' || lower === 'yes' || lower === 'true' || lower === '✅') return 'approved';
  if (lower === 'rejected' || lower === 'no' || lower === 'false' || lower === '❌') return 'rejected';
  return null;
}

export function extractSheetId(url: string): string | null {
  // Handle full URLs
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  // Handle raw sheet ID
  if (/^[a-zA-Z0-9-_]+$/.test(url.trim())) return url.trim();
  return null;
}

export async function fetchSheetData(sheetId: string): Promise<SocialPost[]> {
  // Proxy through our API route to avoid CORS issues
  const url = `/api/sheets?id=${encodeURIComponent(sheetId)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch sheet (${res.status}). Make sure the sheet is published to web.`);
  }

  const text = await res.text();

  // Response is wrapped in google.visualization.Query.setResponse({...})
  // Remove newlines so single-line regex works
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?$/);
  if (!jsonStr) {
    throw new Error('Could not parse sheet data. Make sure the sheet is published to web.');
  }

  const data = JSON.parse(jsonStr[1]);
  const rows = data.table?.rows || [];
  const cols = data.table?.cols || [];

  if (rows.length === 0) {
    throw new Error('Sheet appears to be empty.');
  }

  // Map columns by header label (first row might be headers in the cols)
  const headerMap: Record<string, number> = {};
  cols.forEach((col: { label: string }, i: number) => {
    headerMap[col.label?.toLowerCase().trim()] = i;
  });

  // Expected columns (by position fallback if headers aren't set)
  const getCell = (row: { c: Array<{ v: string | null } | null> }, colName: string, fallbackIdx: number): string => {
    const idx = headerMap[colName] ?? fallbackIdx;
    return row.c?.[idx]?.v?.toString() ?? '';
  };

  return rows
    .map((row: { c: Array<{ v: string | null } | null> }, i: number) => {
      const text = getCell(row, 'post text', 4) || getCell(row, 'text', 4) || getCell(row, 'copy', 4);
      if (!text) return null;

      return {
        id: getCell(row, 'post id', 0) || `POST-${String(i + 1).padStart(3, '0')}`,
        campaign: getCell(row, 'campaign', 1) || 'Uncategorized',
        platform: parsePlatform(getCell(row, 'platform', 2)),
        variant: getCell(row, 'variant', 3) || 'A',
        text,
        imageUrl: getCell(row, 'image url', 5) || undefined,
        linkUrl: getCell(row, 'link url', 6) || undefined,
        scheduledDate: getCell(row, 'scheduled date', 7) || undefined,
        status: getCell(row, 'status', 8) || 'ready',
        approved: parseApproval(getCell(row, 'approved', 9)),
        clientComment: getCell(row, 'client comment', 10),
        reviewedAt: getCell(row, 'reviewed at', 11) || undefined,
      } satisfies SocialPost;
    })
    .filter((p: SocialPost | null): p is SocialPost => p !== null);
}
