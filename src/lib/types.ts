export type Platform = 'linkedin' | 'linkedin-ad' | 'twitter' | 'facebook' | 'instagram' | 'google-ad';

export type ApprovalStatus = 'approved' | 'rejected' | null;

export interface SocialPost {
  id: string;
  campaign: string;
  platform: Platform;
  variant: string;
  text: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  imageUrl?: string;
  linkUrl?: string;
  scheduledDate?: string;
  status: string;
  approved: ApprovalStatus;
  clientComment: string;
  reviewedAt?: string;
}

export interface PostGroup {
  id: string;
  campaign: string;
  platform: Platform;
  variants: SocialPost[];
}

export interface Feedback {
  approved: ApprovalStatus;
  comment: string;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  'linkedin-ad': 'LinkedIn Ad',
  twitter: '𝕏 (Twitter)',
  facebook: 'Facebook',
  instagram: 'Instagram',
  'google-ad': 'Google Ad',
};

export const PLATFORM_ICONS: Record<Platform, string> = {
  linkedin: 'in',
  'linkedin-ad': 'in',
  twitter: '𝕏',
  facebook: 'f',
  instagram: '📷',
  'google-ad': 'G',
};

export function groupPosts(posts: SocialPost[]): PostGroup[] {
  const map = new Map<string, PostGroup>();
  for (const post of posts) {
    if (post.status === 'draft') continue;
    // Group by Post ID — same ID with different variants = A/B variants
    const key = post.id;
    if (!map.has(key)) {
      map.set(key, { id: post.id, campaign: post.campaign, platform: post.platform, variants: [] });
    }
    map.get(key)!.variants.push(post);
  }
  for (const group of map.values()) {
    group.variants.sort((a, b) => a.variant.localeCompare(b.variant));
  }
  return Array.from(map.values());
}

export function getCampaigns(groups: PostGroup[]): string[] {
  const seen = new Set<string>();
  return groups.map(g => g.campaign).filter(c => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });
}

export function groupKey(group: PostGroup): string {
  return group.id;
}

/**
 * Convert Google Drive share links to direct image URLs.
 * Handles:
 *   https://drive.google.com/file/d/FILE_ID/view?...
 *   https://drive.google.com/open?id=FILE_ID
 */
export function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url || url === 'gradient') return url;
  // Google Drive file link
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveFileMatch[1]}`;
  }
  // Google Drive open link
  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpenMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveOpenMatch[1]}`;
  }
  return url;
}
