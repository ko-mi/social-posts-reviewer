import { SocialPost, resolveImageUrl } from '@/lib/types';
import { SAMPLE_PROFILE } from '@/lib/sample-data';

interface Props {
  post: SocialPost;
}

export function LinkedInPreview({ post }: Props) {
  const profile = SAMPLE_PROFILE;
  const imageUrl = resolveImageUrl(post.imageUrl);

  return (
    <div className="w-full max-w-[555px] bg-white rounded-lg border border-[#e0e0e0] shadow-sm font-[system-ui,_-apple-system,_sans-serif]">
      {/* Header */}
      <div className="flex items-start gap-2 p-4 pb-0">
        <img
          src={profile.avatar}
          alt=""
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[rgba(0,0,0,0.9)] leading-tight">
            {profile.name}
          </p>
          <p className="text-[12px] text-[rgba(0,0,0,0.6)] leading-tight mt-0.5 truncate">
            {profile.headline}
          </p>
          <p className="text-[12px] text-[rgba(0,0,0,0.6)] leading-tight mt-0.5 flex items-center gap-1">
            2h •{' '}
            <svg className="w-3 h-3 inline" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011.54-3.6L5.6 5.46A3.8 3.8 0 004.2 8c0 .93.34 1.78.9 2.44l-1.06 1.06A5 5 0 013 8zm5 5a5 5 0 01-3.46-1.39l1.06-1.07A3.8 3.8 0 008 11.8c.93 0 1.78-.34 2.44-.9l1.06 1.06A5 5 0 018 13zm3.46-1.39l-1.07-1.06A3.8 3.8 0 0011.8 8c0-.93-.34-1.78-.9-2.44l1.06-1.06A5 5 0 0113 8a5 5 0 01-1.54 3.61zM8 3a5 5 0 013.46 1.39l-1.07 1.07A3.8 3.8 0 008 4.2c-.93 0-1.78.34-2.44.9L4.5 4.04A5 5 0 018 3z" />
            </svg>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[14px] text-[rgba(0,0,0,0.9)] leading-[20px] whitespace-pre-wrap break-words">
          {post.text}
        </p>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="mt-1">
          {imageUrl === 'gradient' ? (
            <div className="w-full h-[300px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold opacity-80">
                {post.campaign}
              </span>
            </div>
          ) : (
            <img src={imageUrl} alt="" className="w-full" referrerPolicy="no-referrer" />
          )}
        </div>
      )}

      {/* Reactions bar */}
      <div className="flex items-center justify-between px-4 py-2 text-[12px] text-[rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-0.5">
          <span className="flex -space-x-1">
            <span className="w-[18px] h-[18px] rounded-full bg-[#378fe9] flex items-center justify-center text-white text-[10px]">👍</span>
            <span className="w-[18px] h-[18px] rounded-full bg-[#e74c3c] flex items-center justify-center text-white text-[10px]">❤️</span>
            <span className="w-[18px] h-[18px] rounded-full bg-[#f5c451] flex items-center justify-center text-white text-[10px]">💡</span>
          </span>
          <span className="ml-1">128</span>
        </div>
        <span>14 comments · 6 reposts</span>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-[#e0e0e0]" />

      {/* Action bar */}
      <div className="flex items-center justify-between px-2 py-1">
        {[
          { icon: '👍', label: 'Like' },
          { icon: '💬', label: 'Comment' },
          { icon: '🔄', label: 'Repost' },
          { icon: '✈️', label: 'Send' },
        ].map(action => (
          <button
            key={action.label}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-md text-[rgba(0,0,0,0.6)] text-[14px] font-semibold hover:bg-[rgba(0,0,0,0.08)] transition-colors"
          >
            <span className="text-[16px]">{action.icon}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
