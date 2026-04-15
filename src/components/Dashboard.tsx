'use client';

import { useState, useMemo, useEffect } from 'react';
import { SocialPost, Platform, ApprovalStatus, groupPosts, groupKey, resolveImageUrl } from '@/lib/types';
import { PostList } from './PostList';
import { PlatformSwitcher } from './PlatformSwitcher';
import { FeedbackPanel } from './FeedbackPanel';
import { LinkedInPreview } from './previews/LinkedInPreview';
import { LinkedInAdPreview } from './previews/LinkedInAdPreview';
import { TwitterPreview } from './previews/TwitterPreview';
import { FacebookPreview } from './previews/FacebookPreview';
import { InstagramPreview } from './previews/InstagramPreview';
import { GoogleAdPreview } from './previews/GoogleAdPreview';

interface Props {
  posts: SocialPost[];
  sheetId?: string;
  scriptUrl?: string;
}

function PreviewRenderer({ platform, post }: { platform: Platform; post: SocialPost }) {
  switch (platform) {
    case 'linkedin':
      return <LinkedInPreview post={post} />;
    case 'linkedin-ad':
      return <LinkedInAdPreview post={post} />;
    case 'twitter':
      return <TwitterPreview post={post} />;
    case 'facebook':
      return <FacebookPreview post={post} />;
    case 'instagram':
      return <InstagramPreview post={post} />;
    case 'google-ad':
      return <GoogleAdPreview post={post} />;
  }
}

export function Dashboard({ posts, sheetId, scriptUrl }: Props) {
  const groups = useMemo(() => groupPosts(posts), [posts]);

  // Preload all images on mount
  useEffect(() => {
    posts.forEach(post => {
      const url = resolveImageUrl(post.imageUrl);
      if (url && url !== 'gradient') {
        const img = new Image();
        img.src = url;
      }
    });
  }, [posts]);

  const [selectedGroupKey, setSelectedGroupKey] = useState(() =>
    groups.length > 0 ? groupKey(groups[0]) : ''
  );
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [previewPlatform, setPreviewPlatform] = useState<Platform | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, { approved: ApprovalStatus; comment: string }>
  >({});

  // Find current group and post
  const currentGroup = groups.find(g => groupKey(g) === selectedGroupKey);
  const currentPost = currentGroup?.variants.find(v => v.variant === selectedVariant)
    ?? currentGroup?.variants[0];

  // Which platform to preview
  const activePlatform = previewPlatform ?? currentGroup?.platform ?? 'linkedin';

  const handleFeedback = (postId: string, approved: ApprovalStatus, comment: string) => {
    setFeedbackMap(prev => ({
      ...prev,
      [postId]: { approved, comment },
    }));

    // Write back to Google Sheet via Apps Script
    if (scriptUrl) {
      fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ postId, approved, comment }),
      }).catch(console.error);
    }
  };

  const handleSelectGroup = (key: string) => {
    setSelectedGroupKey(key);
    setPreviewPlatform(null); // Reset platform override when switching posts
  };

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <p>No posts found with status &quot;Ready for Review&quot;.</p>
      </div>
    );
  }

  // Count stats
  const totalPosts = posts.filter(p => p.status !== 'draft').length;
  const reviewedCount = Object.keys(feedbackMap).length
    + posts.filter(p => p.approved !== null && !feedbackMap[p.id]).length;

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <PostList
        groups={groups}
        selectedGroupKey={selectedGroupKey}
        selectedVariant={selectedVariant}
        feedbackMap={feedbackMap}
        onSelectGroup={handleSelectGroup}
        onSelectVariant={setSelectedVariant}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Social Posts Preview</h1>
            {sheetId && scriptUrl && (
              <p className="text-xs text-green-500">Connected to Google Sheet (feedback syncs)</p>
            )}
            {sheetId && !scriptUrl && (
              <p className="text-xs text-amber-500">Connected to Google Sheet (read-only — add &script= for write-back)</p>
            )}
            {!sheetId && (
              <p className="text-xs text-amber-500">Demo mode — using sample data</p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {reviewedCount}/{totalPosts} reviewed
          </div>
        </div>

        {/* Platform switcher */}
        <PlatformSwitcher
          selected={activePlatform}
          originalPlatform={currentGroup?.platform ?? 'linkedin'}
          onChange={setPreviewPlatform}
        />

        {/* Preview area */}
        <div className="flex-1 overflow-y-auto bg-gray-100 flex items-start justify-center p-8">
          {currentPost ? (
            <PreviewRenderer platform={activePlatform} post={currentPost} />
          ) : (
            <p className="text-gray-400">Select a post to preview</p>
          )}
        </div>

        {/* Feedback panel */}
        <FeedbackPanel
          post={currentPost}
          currentFeedback={currentPost ? feedbackMap[currentPost.id] : undefined}
          onSubmit={handleFeedback}
        />
      </div>
    </div>
  );
}
