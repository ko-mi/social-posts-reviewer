'use client';

import { PostGroup, Platform, PLATFORM_LABELS, groupKey, getCampaigns } from '@/lib/types';

interface Props {
  groups: PostGroup[];
  selectedGroupKey: string;
  selectedVariant: string;
  feedbackMap: Record<string, { approved: 'approved' | 'rejected' | null; comment: string }>;
  commentsMap: Record<string, { length: number }>;
  onSelectGroup: (key: string) => void;
  onSelectVariant: (variant: string) => void;
}

const PLATFORM_COLORS: Record<Platform, string> = {
  linkedin: 'bg-[#0a66c2]',
  'linkedin-ad': 'bg-[#0a66c2]',
  twitter: 'bg-[#0f1419]',
  facebook: 'bg-[#1877f2]',
  instagram: 'bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af]',
  'google-ad': 'bg-[#4285f4]',
};

export function PostList({
  groups,
  selectedGroupKey,
  selectedVariant,
  feedbackMap,
  commentsMap,
  onSelectGroup,
  onSelectVariant,
}: Props) {
  const campaigns = getCampaigns(groups);

  return (
    <div className="w-72 border-r border-warm-gray bg-cream overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-warm-gray">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Posts</h2>
      </div>

      {campaigns.map(campaign => {
        const campaignGroups = groups.filter(g => g.campaign === campaign);

        return (
          <div key={campaign} className="border-b border-warm-gray">
            <div className="px-4 py-2 bg-cream-dark">
              <h3 className="text-xs font-bold text-ink-light uppercase tracking-wider truncate">
                {campaign}
              </h3>
            </div>

            {campaignGroups.map(group => {
              const key = groupKey(group);
              const isSelected = key === selectedGroupKey;

              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectGroup(key);
                    onSelectVariant(group.variants[0]?.variant || 'A');
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectGroup(key);
                      onSelectVariant(group.variants[0]?.variant || 'A');
                    }
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-warm-gray/50 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white border-l-[3px] border-l-accent shadow-sm'
                      : 'hover:bg-cream-dark border-l-[3px] border-l-transparent'
                  }`}
                >
                  {/* Post ID + Platform badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-mono text-ink-muted flex-shrink-0">
                        {group.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white flex-shrink-0 ${PLATFORM_COLORS[group.platform]}`}
                      >
                        {PLATFORM_LABELS[group.platform]}
                      </span>
                    </div>

                    {/* Approval + comment indicators */}
                    <div className="flex items-center gap-1.5">
                      {/* Comment count */}
                      {(() => {
                        const totalComments = group.variants.reduce((sum, v) =>
                          sum + (commentsMap[`${v.id}_${v.variant}`]?.length || 0), 0);
                        return totalComments > 0 ? (
                          <span className="text-[10px] text-ink-muted flex items-center gap-0.5">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>{totalComments}</span>
                          </span>
                        ) : null;
                      })()}
                      {/* Approval dots */}
                      <div className="flex gap-0.5">
                      {group.variants.map(v => {
                        const fb = feedbackMap[`${v.id}_${v.variant}`];
                        const status = fb?.approved ?? v.approved;
                        return (
                          <span
                            key={`${v.id}_${v.variant}`}
                            className={`w-2 h-2 rounded-full ${
                              status === 'approved'
                                ? 'bg-approve'
                                : status === 'rejected'
                                  ? 'bg-reject'
                                  : 'bg-warm-gray'
                            }`}
                          />
                        );
                      })}
                      </div>
                    </div>
                  </div>

                  {/* Headline or preview text */}
                  <p className="text-xs text-ink-light line-clamp-2 leading-tight">
                    {group.variants[0]?.headline || group.variants[0]?.text.slice(0, 80)}
                  </p>

                  {/* Variant tabs (always visible when multiple) */}
                  {group.variants.length > 1 && (
                    <div className="flex gap-1 mt-2">
                      {group.variants.map(v => (
                        <button
                          key={v.variant}
                          onClick={e => {
                            e.stopPropagation();
                            onSelectGroup(key);
                            onSelectVariant(v.variant);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            isSelected && selectedVariant === v.variant
                              ? 'bg-ink text-white'
                              : 'bg-warm-gray text-ink-light hover:bg-warm-gray'
                          }`}
                        >
                          {v.variant}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
