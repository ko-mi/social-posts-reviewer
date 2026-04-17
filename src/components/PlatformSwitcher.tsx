'use client';

import { Platform, PLATFORM_LABELS } from '@/lib/types';

interface Props {
  selected: Platform;
  originalPlatform: Platform;
  onChange: (platform: Platform) => void;
}

const GROUPS: { label: string; platforms: Platform[] }[] = [
  { label: 'Paid', platforms: ['linkedin-ad', 'google-ad'] },
  { label: 'Organic', platforms: ['linkedin', 'twitter', 'facebook', 'instagram'] },
];

const PLATFORM_ACCENT: Record<Platform, string> = {
  linkedin: 'bg-[#0a66c2] text-white',
  'linkedin-ad': 'bg-[#0a66c2] text-white',
  twitter: 'bg-[#0f1419] text-white',
  facebook: 'bg-[#1877f2] text-white',
  instagram: 'bg-[#e1306c] text-white',
  'google-ad': 'bg-[#4285f4] text-white',
};

export function PlatformSwitcher({ selected, originalPlatform, onChange }: Props) {
  return (
    <div className="border-b border-warm-gray bg-white px-6 py-2.5 flex items-center gap-6">
      {GROUPS.map(group => (
        <div key={group.label} className="flex items-center gap-1.5">
          <span className="text-xs text-ink-muted mr-1">{group.label}</span>
          {group.platforms.map(platform => {
            const isActive = platform === selected;
            const isOriginal = platform === originalPlatform;

            return (
              <button
                key={platform}
                onClick={() => onChange(platform)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? PLATFORM_ACCENT[platform]
                    : isOriginal
                      ? 'bg-accent-light text-accent ring-1 ring-accent/30'
                      : 'bg-cream-dark text-ink-muted hover:bg-warm-gray'
                }`}
              >
                {isOriginal && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-accent'}`} />
                )}
                {PLATFORM_LABELS[platform]}
              </button>
            );
          })}
        </div>
      ))}

      {selected !== originalPlatform && (
        <span className="ml-auto text-xs text-ink-muted bg-cream-dark px-2 py-1 rounded">
          Originally {PLATFORM_LABELS[originalPlatform]}
        </span>
      )}
    </div>
  );
}
