'use client';

import { Platform, PLATFORM_LABELS } from '@/lib/types';

interface Props {
  selected: Platform;
  originalPlatform: Platform;
  onChange: (platform: Platform) => void;
}

const PLATFORMS: Platform[] = ['linkedin', 'twitter', 'facebook', 'instagram'];

const PLATFORM_ACCENT: Record<Platform, string> = {
  linkedin: 'border-[#0a66c2] text-[#0a66c2]',
  twitter: 'border-[#0f1419] text-[#0f1419]',
  facebook: 'border-[#1877f2] text-[#1877f2]',
  instagram: 'border-[#e1306c] text-[#e1306c]',
};

export function PlatformSwitcher({ selected, originalPlatform, onChange }: Props) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 flex items-center gap-1">
      {PLATFORMS.map(platform => {
        const isActive = platform === selected;
        const isOriginal = platform === originalPlatform;

        return (
          <button
            key={platform}
            onClick={() => onChange(platform)}
            className={`relative px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              isActive
                ? PLATFORM_ACCENT[platform]
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {PLATFORM_LABELS[platform]}
            {isOriginal && !isActive && (
              <span className="ml-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full inline-block" />
            )}
          </button>
        );
      })}

      {selected !== originalPlatform && (
        <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          Previewing as {PLATFORM_LABELS[selected]} (originally {PLATFORM_LABELS[originalPlatform]})
        </span>
      )}
    </div>
  );
}
