'use client';

import { PostGroup, Platform, PLATFORM_LABELS, groupKey, getCampaigns } from '@/lib/types';

interface Props {
  groups: PostGroup[];
  selectedGroupKey: string;
  selectedVariant: string;
  feedbackMap: Record<string, { approved: 'approved' | 'rejected' | null; comment: string }>;
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
  onSelectGroup,
  onSelectVariant,
}: Props) {
  const campaigns = getCampaigns(groups);

  return (
    <div className="w-72 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Posts</h2>
      </div>

      {campaigns.map(campaign => {
        const campaignGroups = groups.filter(g => g.campaign === campaign);

        return (
          <div key={campaign} className="border-b border-gray-200">
            <div className="px-4 py-2 bg-gray-100">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate">
                {campaign}
              </h3>
            </div>

            {campaignGroups.map(group => {
              const key = groupKey(group);
              const isSelected = key === selectedGroupKey;

              return (
                <button
                  key={key}
                  onClick={() => {
                    onSelectGroup(key);
                    onSelectVariant(group.variants[0]?.variant || 'A');
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                    isSelected ? 'bg-white shadow-sm' : 'hover:bg-gray-100'
                  }`}
                >
                  {/* Post ID + Platform badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-mono text-gray-400 flex-shrink-0">
                        {group.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white flex-shrink-0 ${PLATFORM_COLORS[group.platform]}`}
                      >
                        {PLATFORM_LABELS[group.platform]}
                      </span>
                    </div>

                    {/* Approval indicators */}
                    <div className="flex gap-0.5">
                      {group.variants.map(v => {
                        const fb = feedbackMap[`${v.id}_${v.variant}`] ?? feedbackMap[v.id];
                        const status = fb?.approved ?? v.approved;
                        return (
                          <span
                            key={`${v.id}_${v.variant}`}
                            className={`w-2 h-2 rounded-full ${
                              status === 'approved'
                                ? 'bg-green-500'
                                : status === 'rejected'
                                  ? 'bg-red-500'
                                  : 'bg-gray-300'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Headline or preview text */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
                    {group.variants[0]?.headline || group.variants[0]?.text.slice(0, 80)}
                  </p>

                  {/* Variant tabs (when selected) */}
                  {isSelected && group.variants.length > 1 && (
                    <div className="flex gap-1 mt-2">
                      {group.variants.map(v => (
                        <button
                          key={v.variant}
                          onClick={e => {
                            e.stopPropagation();
                            onSelectVariant(v.variant);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            selectedVariant === v.variant
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {v.variant}
                        </button>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
