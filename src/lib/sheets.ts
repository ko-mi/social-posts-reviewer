import { SocialPost, Platform } from './types';

const VALID_PLATFORMS: Platform[] = ['linkedin', 'linkedin-ad', 'twitter', 'facebook', 'instagram', 'google-ad'];

function parsePlatform(raw: string): Platform {
  const lower = raw.toLowerCase().trim();
  if (lower === 'x' || lower === 'x (twitter)') return 'twitter';
  if (lower === 'linkedin ad' || lower === 'linkedin-ad' || lower === 'li ad') return 'linkedin-ad';
  if (lower === 'google ad' || lower === 'google-ad' || lower === 'google ads' || lower === 'search ad') return 'google-ad';
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

// Canonical column order:
// 0: Post ID, 1: Campaign, 2: Platform, 3: Variant, 4: Post Text,
// 5: Headline, 6: Description, 7: CTA Text, 8: Image URL, 9: Link URL,
// 10: Scheduled Date, 11: Status, 12: Approved, 13: Client Comment, 14: Reviewed At

export async function fetchSheetData(sheetId: string, gid?: string): Promise<SocialPost[]> {
  let url = `/api/sheets?id=${encodeURIComponent(sheetId)}`;
  if (gid) url += `&gid=${encodeURIComponent(gid)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed to fetch sheet (${res.status}). Make sure the sheet is published to web.`);
  }

  const text = await res.text();

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

  // Map columns by header label
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
      // Try to find text content - skip truly empty rows
      const postText = getCell(row, ['post text', 'text', 'copy'], 4);
      const headline = getCell(row, ['headline'], 5);
      const description = getCell(row, ['description', 'desc'], 6);

      // A row needs at least post text OR a headline to be valid
      if (!postText && !headline) return null;

      return {
        id: getCell(row, ['post id', 'id'], 0) || `POST-${String(i + 1).padStart(3, '0')}`,
        campaign: getCell(row, ['campaign', 'group'], 1) || 'Uncategorized',
        platform: parsePlatform(getCell(row, ['platform'], 2)),
        variant: getCell(row, ['variant'], 3) || 'A',
        text: postText,
        headline: headline || undefined,
        description: description || undefined,
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
