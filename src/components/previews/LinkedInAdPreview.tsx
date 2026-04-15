import { SocialPost } from '@/lib/types';
import { SAMPLE_PROFILE } from '@/lib/sample-data';

interface Props {
  post: SocialPost;
}

export function LinkedInAdPreview({ post }: Props) {
  const profile = SAMPLE_PROFILE;
  const displayUrl = post.linkUrl
    ? post.linkUrl.replace(/^https?:\/\//, '').split('/')[0]
    : 'quantumflow.com';

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
          <p className="text-[12px] text-[rgba(0,0,0,0.6)] leading-tight mt-0.5">
            Promoted
          </p>
        </div>
        <span className="text-[12px] text-[rgba(0,0,0,0.6)] flex items-center gap-1">
          ···
        </span>
      </div>

      {/* Introductory text */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[14px] text-[rgba(0,0,0,0.9)] leading-[20px] whitespace-pre-wrap break-words">
          {post.text}
        </p>
      </div>

      {/* Image */}
      <div>
        {post.imageUrl === 'gradient' ? (
          <div className="w-full h-[300px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold opacity-80">
              {post.campaign}
            </span>
          </div>
        ) : post.imageUrl ? (
          <img src={post.imageUrl} alt="" className="w-full" />
        ) : (
          <div className="w-full h-[250px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold opacity-70">
              {post.headline || post.campaign}
            </span>
          </div>
        )}
      </div>

      {/* Headline + CTA section */}
      <div className="px-4 py-3 border-t border-[#e0e0e0] bg-[#f9fafb]">
        <p className="text-[12px] text-[rgba(0,0,0,0.6)] leading-tight">
          {displayUrl}
        </p>
        <div className="flex items-start justify-between gap-4 mt-1">
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-semibold text-[rgba(0,0,0,0.9)] leading-tight">
              {post.headline || 'Ad Headline'}
            </p>
            {(post.description || post.ctaText) && (
              <p className="text-[12px] text-[rgba(0,0,0,0.6)] mt-0.5 truncate">
                {post.description || post.text.slice(0, 80)}
              </p>
            )}
          </div>
          <button className="flex-shrink-0 px-4 py-1.5 border border-[#0a66c2] text-[#0a66c2] rounded-full text-[14px] font-semibold hover:bg-[#0a66c2] hover:text-white transition-colors">
            {post.ctaText || 'Learn More'}
          </button>
        </div>
      </div>

      {/* Reactions bar */}
      <div className="flex items-center justify-between px-4 py-2 text-[12px] text-[rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-0.5">
          <span className="flex -space-x-1">
            <span className="w-[18px] h-[18px] rounded-full bg-[#378fe9] flex items-center justify-center text-white text-[10px]">👍</span>
            <span className="w-[18px] h-[18px] rounded-full bg-[#e74c3c] flex items-center justify-center text-white text-[10px]">❤️</span>
          </span>
          <span className="ml-1">86</span>
        </div>
        <span>5 comments · 2 reposts</span>
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
