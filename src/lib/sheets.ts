import { SocialPost, Platform } from './types';

const VALID_PLATFORMS: Platform[] = ['linkedin', 'linkedin-ad', 'twitter', 'facebook', 'instagram', 'google-ad'];

function parsePlatform(raw: string): Platform {
  const lower = raw.toLowerCase().trim();
  if (lower === 'x' || lower === 'x (twitter)') return 'twitter';
  if (lower === 'linkedin ad' || lower === 'linkedin ads' || lower === 'linkedin-ad' || lower === 'li ad' || lower === 'li ads') return 'linkedin-ad';
  if (lower === 'google ad' || lower === 'google ads' || lower === 'google-ad' || lower === 'search ad' || lower === 'search ads') return 'google-ad';
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
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9-_]+$/.test(url.trim())) return url.trim();
  return null;
}

export function extractGid(url: string): string | null {
  const match = url.match(/[?&#]gid=(\d+)/);
  return match ? match[1] : null;
}

// ── Parse from authenticated Sheets API (2D array of strings) ──

function parseFromValues(values: string[][]): SocialPost[] {
  if (values.length < 2) return [];

  const headers = values[0].map(h => h.toLowerCase().trim());
  const headerMap: Record<string, number> = {};
  headers.forEach((h, i) => { if (h) headerMap[h] = i; });

  const getCell = (row: string[], colNames: string[], fallbackIdx: number): string => {
    for (const name of colNames) {
      if (headerMap[name] !== undefined) return row[headerMap[name]] || '';
    }
    if (fallbackIdx >= 0 && fallbackIdx < row.length) return row[fallbackIdx] || '';
    return '';
  };

  return values.slice(1)
    .map((row: string[], i: number): SocialPost | null => {
      const postText = getCell(row, ['post text', 'text', 'copy'], 4);
      const headline = getCell(row, ['headline'], 5);
      if (!postText && !headline) return null;

      return {
        id: getCell(row, ['post id', 'id'], 0) || `POST-${String(i + 1).padStart(3, '0')}`,
        campaign: getCell(row, ['campaign', 'group'], 1) || 'Uncategorized',
        platform: parsePlatform(getCell(row, ['platform'], 2)),
        variant: getCell(row, ['variant'], 3) || 'A',
        text: postText,
        headline: headline || undefined,
        description: getCell(row, ['description', 'desc'], 6) || undefined,
        ctaText: getCell(row, ['cta text', 'cta'], 7) || undefined,
        imageUrl: getCell(row, ['image url', 'image'], 8) || undefined,
        linkUrl: getCell(row, ['link url', 'link', 'url'], 9) || undefined,
        scheduledDate: getCell(row, ['scheduled date', 'date', 'schedule'], 10) || undefined,
        status: getCell(row, ['status'], 11) || 'ready',
        approved: parseApproval(getCell(row, ['approved'], 12)),
        clientComment: getCell(row, ['client comment', 'comment', 'feedback'], 13),
        reviewedAt: getCell(row, ['reviewed at', 'reviewed'], 14) || undefined,
      };
    })
    .filter((p): p is SocialPost => p !== null);
}

// ── Parse from public gviz endpoint ──

function parseFromGviz(text: string): SocialPost[] {
  const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?$/);
  if (!jsonStr) {
    throw new Error('Could not parse sheet data. Make sure the sheet is published to web or sign in with Google.');
  }

  const data = JSON.parse(jsonStr[1]);
  const rows = data.table?.rows || [];
  const cols = data.table?.cols || [];

  if (rows.length === 0) throw new Error('Sheet appears to be empty.');

  const headerMap: Record<string, number> = {};
  cols.forEach((col: { label: string }, i: number) => {
    const label = col.label?.toLowerCase().trim();
    if (label) headerMap[label] = i;
  });

  const getCell = (row: { c: Array<{ v: string | null } | null> }, colNames: string[], fallbackIdx: number): string => {
    for (const name of colNames) {
      if (headerMap[name] !== undefined) {
        return row.c?.[headerMap[name]]?.v?.toString() ?? '';
      }
    }
    if (fallbackIdx >= 0 && fallbackIdx < (row.c?.length ?? 0)) {
      return row.c?.[fallbackIdx]?.v?.toString() ?? '';
    }
    return '';
  };

  return rows
    .map((row: { c: Array<{ v: string | null } | null> }, i: number) => {
      const postText = getCell(row, ['post text', 'text', 'copy'], 4);
      const headline = getCell(row, ['headline'], 5);
      if (!postText && !headline) return null;

      return {
        id: getCell(row, ['post id', 'id'], 0) || `POST-${String(i + 1).padStart(3, '0')}`,
        campaign: getCell(row, ['campaign', 'group'], 1) || 'Uncategorized',
        platform: parsePlatform(getCell(row, ['platform'], 2)),
        variant: getCell(row, ['variant'], 3) || 'A',
        text: postText,
        headline: headline || undefined,
        description: getCell(row, ['description', 'desc'], 6) || undefined,
        ctaText: getCell(row, ['cta text', 'cta'], 7) || undefined,
        imageUrl: getCell(row, ['image url', 'image'], 8) || undefined,
        linkUrl: getCell(row, ['link url', 'link', 'url'], 9) || undefined,
        scheduledDate: getCell(row, ['scheduled date', 'date', 'schedule'], 10) || undefined,
        status: getCell(row, ['status'], 11) || 'ready',
        approved: parseApproval(getCell(row, ['approved'], 12)),
        clientComment: getCell(row, ['client comment', 'comment', 'feedback'], 13),
        reviewedAt: getCell(row, ['reviewed at', 'reviewed'], 14) || undefined,
      } satisfies SocialPost;
    })
    .filter((p: SocialPost | null): p is SocialPost => p !== null);
}

// ── Comment parsing ──

export interface ParsedComment {
  userName: string;
  timestamp: string;
  comment: string;
}

function parseNoteToComments(note: string): ParsedComment[] {
  if (!note) return [];
  return note.split('\n').filter(Boolean).map(line => {
    const match = line.match(/^(.+?)\s*\((.+?)\):\s*(.+)$/);
    if (match) return { userName: match[1], timestamp: match[2], comment: match[3] };
    return { userName: 'Unknown', timestamp: '', comment: line };
  });
}

// ── Main fetch function ──

export interface SheetData {
  posts: SocialPost[];
  commentsMap: Record<string, ParsedComment[]>; // keyed by "postId_variant"
}

export async function fetchSheetData(sheetId: string, gid?: string, share?: string): Promise<SheetData> {
  let url = `/api/sheets?id=${encodeURIComponent(sheetId)}`;
  if (gid) url += `&gid=${encodeURIComponent(gid)}`;
  if (share) url += `&share=${encodeURIComponent(share)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch sheet (${res.status}).`);
  }

  const contentType = res.headers.get('content-type') || '';

  // Authenticated response returns JSON with { values, notes }
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (data.values) {
      const posts = parseFromValues(data.values);

      // Build comments map from notes
      const commentsMap: Record<string, ParsedComment[]> = {};
      if (data.notes) {
        const headers = (data.values[0] || []).map((h: string) => h.toLowerCase().trim());
        const postIdCol = headers.indexOf('post id');
        const variantCol = headers.indexOf('variant');
        const approvedCol = headers.indexOf('approved');

        if (approvedCol >= 0) {
          for (const [rowIdxStr, cols] of Object.entries(data.notes as Record<string, Record<string, string>>)) {
            const rowIdx = parseInt(rowIdxStr);
            if (rowIdx === 0) continue; // skip header
            const note = cols[approvedCol];
            if (note) {
              const row = data.values[rowIdx] || [];
              const postId = (row[postIdCol >= 0 ? postIdCol : 0] || '').trim();
              const variant = (variantCol >= 0 ? row[variantCol] || '' : 'A').trim();
              if (postId) {
                commentsMap[`${postId}_${variant}`] = parseNoteToComments(note);
              }
            }
          }
        }
      }

      return { posts, commentsMap };
    }
    throw new Error(data.error || 'No data returned from sheet.');
  }

  // Public gviz response — no notes available
  const text = await res.text();
  return { posts: parseFromGviz(text), commentsMap: {} };
}
