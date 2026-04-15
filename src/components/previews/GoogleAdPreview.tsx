import { SocialPost } from '@/lib/types';

interface Props {
  post: SocialPost;
}

export function GoogleAdPreview({ post }: Props) {
  // Parse multiple headlines from the headline field (separated by |)
  const headlines = (post.headline || 'Ad Headline')
    .split('|')
    .map(h => h.trim())
    .filter(Boolean);

  const displayUrl = post.linkUrl
    ? post.linkUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'www.example.com';

  // Split display URL into domain and path
  const urlParts = displayUrl.split('/');
  const domain = urlParts[0];
  const path = urlParts.slice(1).join('/');

  return (
    <div className="w-full max-w-[600px] font-[Arial,_sans-serif]">
      {/* Search bar mock */}
      <div className="bg-white rounded-full border border-[#dfe1e5] px-5 py-3 mb-6 flex items-center gap-3 shadow-sm">
        <svg className="w-5 h-5 text-[#4285f4]" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span className="text-[16px] text-[#202124] flex-1">
          {headlines[0]?.toLowerCase().replace(/[^a-z ]/g, '').trim() || 'search query'}
        </span>
        <svg className="w-5 h-5 text-[#70757a]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
      </div>

      {/* Ad result */}
      <div className="bg-white rounded-lg border border-[#dadce0] p-5 shadow-sm">
        {/* Sponsored label + URL */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] rounded-full bg-[#f1f3f4] flex items-center justify-center">
              <span className="text-[12px] font-bold text-[#202124]">
                {domain.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[14px] text-[#202124]">{domain}</span>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-[#4d5156]">
                <span className="text-[12px]">
                  https://{domain}{path ? `/${path}` : ''}
                </span>
              </div>
            </div>
          </div>
          <span className="ml-auto text-[12px] font-bold text-[#202124] bg-[#f1f3f4] px-1.5 py-0.5 rounded">
            Sponsored
          </span>
        </div>

        {/* Headlines */}
        <h3 className="text-[20px] text-[#1a0dab] leading-[26px] mt-2 cursor-pointer hover:underline">
          {headlines.join(' | ')}
        </h3>

        {/* Description */}
        <p className="text-[14px] text-[#4d5156] leading-[22px] mt-1">
          {post.description || post.text}
        </p>

        {/* Sitelinks (mock) */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 pt-3 border-t border-[#dadce0]">
          {['Features', 'Pricing', 'Free Trial', 'Case Studies'].map(link => (
            <div key={link}>
              <p className="text-[14px] text-[#1a0dab] cursor-pointer hover:underline">
                {link}
              </p>
              <p className="text-[12px] text-[#4d5156] mt-0.5">
                Learn more about our {link.toLowerCase()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Organic result below (to show context) */}
      <div className="mt-4 p-5 opacity-40">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-[26px] h-[26px] rounded-full bg-[#f1f3f4]" />
          <div>
            <div className="h-3 w-32 bg-[#dadce0] rounded" />
            <div className="h-2 w-48 bg-[#f1f3f4] rounded mt-1" />
          </div>
        </div>
        <div className="h-4 w-64 bg-[#e8eaed] rounded mt-2" />
        <div className="h-3 w-full bg-[#f1f3f4] rounded mt-2" />
        <div className="h-3 w-3/4 bg-[#f1f3f4] rounded mt-1" />
      </div>
    </div>
  );
}
