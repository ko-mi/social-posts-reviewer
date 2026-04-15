import { SocialPost } from '@/lib/types';
import { SAMPLE_PROFILE } from '@/lib/sample-data';

interface Props {
  post: SocialPost;
}

export function FacebookPreview({ post }: Props) {
  const profile = SAMPLE_PROFILE;

  return (
    <div className="w-full max-w-[500px] bg-white rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.2)] font-[Helvetica,_Arial,_sans-serif]">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 pb-0">
        <img
          src={profile.avatar}
          alt=""
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-[#050505] leading-tight">
            {profile.name}
          </p>
          <div className="flex items-center gap-1 text-[13px] text-[#65676b]">
            <span>2h</span>
            <span>·</span>
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 108 8 8 8 0 00-8-8zm5.91 7.3h-2.24V4.93a.79.79 0 00-.79-.79H9.12a.79.79 0 00-.79.79V7.3H6.09a.79.79 0 00-.79.79v.82a.79.79 0 00.79.79h2.24v2.37a.79.79 0 00.79.79h1.76a.79.79 0 00.79-.79V9.7h2.24a.79.79 0 00.79-.79v-.82a.79.79 0 00-.8-.79z" />
            </svg>
          </div>
        </div>
        <button className="text-[#65676b] text-xl leading-none p-1">···</button>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3">
        <p className="text-[15px] text-[#050505] leading-[20px] whitespace-pre-wrap break-words">
          {post.text}
        </p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div>
          {post.imageUrl === 'gradient' ? (
            <div className="w-full h-[300px] bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold opacity-80">
                {post.campaign}
              </span>
            </div>
          ) : (
            <img src={post.imageUrl} alt="" className="w-full" />
          )}
        </div>
      )}

      {/* Reactions bar */}
      <div className="flex items-center justify-between px-4 py-2 text-[15px] text-[#65676b]">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-[18px] h-[18px] rounded-full bg-[#1877f2] flex items-center justify-center text-[10px]">👍</span>
            <span className="w-[18px] h-[18px] rounded-full bg-[#e74c3c] flex items-center justify-center text-[10px]">❤️</span>
          </span>
          <span className="text-[15px]">24</span>
        </div>
        <span className="text-[15px]">3 comments · 1 share</span>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-[#ced0d4]" />

      {/* Action bar */}
      <div className="flex items-center justify-between px-2 py-1">
        {[
          { icon: '👍', label: 'Like' },
          { icon: '💬', label: 'Comment' },
          { icon: '↗️', label: 'Share' },
        ].map(action => (
          <button
            key={action.label}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-[#65676b] text-[15px] font-semibold hover:bg-[#f2f2f2] transition-colors"
          >
            <span className="text-[18px]">{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
