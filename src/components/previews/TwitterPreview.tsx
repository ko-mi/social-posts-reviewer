import { SocialPost } from '@/lib/types';
import { SAMPLE_PROFILE } from '@/lib/sample-data';

interface Props {
  post: SocialPost;
}

export function TwitterPreview({ post }: Props) {
  const profile = SAMPLE_PROFILE;

  return (
    <div className="w-full max-w-[598px] bg-white border border-[#eff3f4] p-4 font-[system-ui,_-apple-system,_sans-serif]">
      <div className="flex gap-3">
        {/* Avatar */}
        <img
          src={profile.avatar}
          alt=""
          className="w-10 h-10 rounded-full flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 text-[15px]">
            <span className="font-bold text-[#0f1419] truncate">{profile.name}</span>
            <svg className="w-[18px] h-[18px] flex-shrink-0 text-[#1d9bf0]" viewBox="0 0 22 22" fill="currentColor">
              <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.568.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.225 1.261.272 1.893.143.636-.13 1.22-.436 1.69-.882.445-.47.749-1.055.878-1.69.13-.634.075-1.29-.148-1.897.585-.271 1.084-.701 1.438-1.241.354-.54.551-1.168.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
            </svg>
            <span className="text-[#536471] truncate">@{profile.handle}</span>
            <span className="text-[#536471]">·</span>
            <span className="text-[#536471]">2h</span>
          </div>

          {/* Body */}
          <div className="mt-1">
            <p className="text-[15px] text-[#0f1419] leading-[20px] whitespace-pre-wrap break-words">
              {post.text}
            </p>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-[#eff3f4]">
              {post.imageUrl === 'gradient' ? (
                <div className="w-full h-[280px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold opacity-80">
                    {post.campaign}
                  </span>
                </div>
              ) : (
                <img src={post.imageUrl} alt="" className="w-full" />
              )}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between mt-3 max-w-[425px] text-[#536471]">
            {[
              { icon: '💬', count: '14', hoverColor: 'hover:text-[#1d9bf0]' },
              { icon: '🔄', count: '8', hoverColor: 'hover:text-[#00ba7c]' },
              { icon: '♡', count: '128', hoverColor: 'hover:text-[#f91880]' },
              { icon: '📊', count: '4.2K', hoverColor: 'hover:text-[#1d9bf0]' },
              { icon: '⬆', count: '', hoverColor: 'hover:text-[#1d9bf0]' },
            ].map((action, i) => (
              <button
                key={i}
                className={`flex items-center gap-1 text-[13px] ${action.hoverColor} transition-colors`}
              >
                <span>{action.icon}</span>
                {action.count && <span>{action.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
