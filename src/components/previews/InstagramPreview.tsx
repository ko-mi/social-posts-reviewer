import { SocialPost, resolveImageUrl } from '@/lib/types';
import { SAMPLE_PROFILE } from '@/lib/sample-data';

interface Props {
  post: SocialPost;
}

export function InstagramPreview({ post }: Props) {
  const profile = SAMPLE_PROFILE;
  const imageUrl = resolveImageUrl(post.imageUrl);

  return (
    <div className="w-full max-w-[470px] bg-white border border-[#dbdbdb] rounded-lg font-[system-ui,_-apple-system,_sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#feda75] via-[#fa7e1e] via-[#d62976] via-[#962fbf] to-[#4f5bd5] p-[2px]">
            <img
              src={profile.avatar}
              alt=""
              className="w-full h-full rounded-full border-2 border-white"
            />
          </div>
          <span className="text-[14px] font-semibold text-[#262626]">
            {profile.handle}
          </span>
        </div>
        <button className="text-[#262626] text-lg tracking-widest">•••</button>
      </div>

      {/* Image */}
      <div>
        {imageUrl === 'gradient' ? (
          <div className="w-full aspect-square bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold opacity-80 text-center px-8">
              {post.campaign}
            </span>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt="" className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Image preview</span>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <div className="flex items-center gap-4 text-[24px]">
          <button className="hover:opacity-60 transition-opacity">♡</button>
          <button className="hover:opacity-60 transition-opacity">💬</button>
          <button className="hover:opacity-60 transition-opacity">✈️</button>
        </div>
        <button className="text-[24px] hover:opacity-60 transition-opacity">🔖</button>
      </div>

      {/* Likes */}
      <div className="px-3 pt-1">
        <p className="text-[14px] font-semibold text-[#262626]">128 likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 pt-1 pb-2">
        <p className="text-[14px] text-[#262626] leading-[18px]">
          <span className="font-semibold">{profile.handle}</span>{' '}
          <span className="whitespace-pre-wrap break-words">{post.text}</span>
        </p>
      </div>

      {/* Comments link */}
      <div className="px-3 pb-1">
        <p className="text-[14px] text-[#8e8e8e]">View all 12 comments</p>
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-[#8e8e8e] uppercase tracking-wide">2 hours ago</p>
      </div>
    </div>
  );
}
