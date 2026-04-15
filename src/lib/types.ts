export type Platform = 'linkedin' | 'twitter' | 'facebook' | 'instagram';

export type ApprovalStatus = 'approved' | 'rejected' | null;

export interface SocialPost {
  id: string;
  campaign: string;
  platform: Platform;
  variant: string;
  text: string;
  imageUrl?: string;
  linkUrl?: string;
  scheduledDate?: string;
  status: string;
  approved: ApprovalStatus;
  clientComment: string;
  reviewedAt?: string;
}

export interface PostGroup {
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
  twitter: '𝕏 (Twitter)',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

export const PLATFORM_ICONS: Record<Platform, string> = {
  linkedin: 'in',
  twitter: '𝕏',
  facebook: 'f',
  instagram: '📷',
};

export function groupPosts(posts: SocialPost[]): PostGroup[] {
  const map = new Map<string, PostGroup>();
  for (const post of posts) {
    if (post.status === 'draft') continue;
    const key = `${post.campaign}::${post.platform}`;
    if (!map.has(key)) {
      map.set(key, { campaign: post.campaign, platform: post.platform, variants: [] });
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
  return `${group.campaign}::${group.platform}`;
}
