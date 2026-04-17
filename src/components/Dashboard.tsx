'use client';

import { useState, useMemo, useEffect } from 'react';
import { SocialPost, Platform, ApprovalStatus, groupPosts, groupKey, resolveImageUrl } from '@/lib/types';
import type { ParsedComment } from '@/lib/sheets';
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
  gid?: string;
  scriptUrl?: string;
  shareToken?: string;
  initialComments?: Record<string, ParsedComment[]>;
}

interface AuthUser {
  email: string;
  name: string;
  picture: string;
}

function PreviewRenderer({ platform, post, imageCache }: { platform: Platform; post: SocialPost; imageCache: Record<string, string> }) {
  // Swap image URL for cached blob URL if available
  const cachedPost = { ...post };
  if (post.imageUrl) {
    const resolved = resolveImageUrl(post.imageUrl);
    if (resolved && imageCache[resolved]) {
      cachedPost.imageUrl = imageCache[resolved];
    }
  }

  switch (platform) {
    case 'linkedin':
      return <LinkedInPreview post={cachedPost} />;
    case 'linkedin-ad':
      return <LinkedInAdPreview post={cachedPost} />;
    case 'twitter':
      return <TwitterPreview post={cachedPost} />;
    case 'facebook':
      return <FacebookPreview post={cachedPost} />;
    case 'instagram':
      return <InstagramPreview post={cachedPost} />;
    case 'google-ad':
      return <GoogleAdPreview post={cachedPost} />;
  }
}

export function Dashboard({ posts, sheetId, gid, scriptUrl, shareToken, initialComments = {} }: Props) {
  const groups = useMemo(() => groupPosts(posts), [posts]);

  const [selectedGroupKey, setSelectedGroupKey] = useState(() =>
    groups.length > 0 ? groupKey(groups[0]) : ''
  );
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [previewPlatform, setPreviewPlatform] = useState<Platform | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, { approved: ApprovalStatus; comment: string }>
  >({});
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [commentsCache, setCommentsCache] = useState<Record<string, ParsedComment[]>>(initialComments);
  const [shareLink, setShareLink] = useState('');
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [creatingShare, setCreatingShare] = useState(false);
  const [clientName, setClientName] = useState('');
  const [askingName, setAskingName] = useState(false);

  // If accessed via share token, load the saved client name
  useEffect(() => {
    if (shareToken) {
      const stored = localStorage.getItem('client_name') || '';
      if (stored) setClientName(stored);
      else setAskingName(true);
    }
  }, [shareToken]);

  const handleSetClientName = (name: string) => {
    setClientName(name);
    localStorage.setItem('client_name', name);
    setAskingName(false);
  };

  const handleCreateShareLink = async () => {
    if (!sheetId) return;
    setCreatingShare(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetId, gid }),
      });
      const data = await res.json();
      if (data.id) {
        const url = `${window.location.origin}/preview?sheet=${sheetId}${gid ? `&gid=${gid}` : ''}&share=${data.id}`;
        setShareLink(url);
      }
    } catch (err) {
      console.error('Failed to create share:', err);
    } finally {
      setCreatingShare(false);
    }
  };

  const addCommentToCache = (postId: string, variant: string, comment: ParsedComment) => {
    const key = `${postId}_${variant}`;
    setCommentsCache(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), comment],
    }));
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  // Check auth state
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setAuthUser(data.user);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  // Preload all images into blob cache for instant switching
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  useEffect(() => {
    posts.forEach(post => {
      const url = resolveImageUrl(post.imageUrl);
      if (url && url !== 'gradient') {
        fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            setImageCache(prev => ({ ...prev, [url]: blobUrl }));
          })
          .catch(() => {});
      }
    });
  }, [posts]);

  const currentGroup = groups.find(g => groupKey(g) === selectedGroupKey);
  const currentPost = currentGroup?.variants.find(v => v.variant === selectedVariant)
    ?? currentGroup?.variants[0];
  const activePlatform = previewPlatform ?? currentGroup?.platform ?? 'linkedin';

  const handleApprove = (postId: string, variant: string, approved: ApprovalStatus) => {
    const fbKey = `${postId}_${variant}`;
    setFeedbackMap(prev => ({
      ...prev,
      [fbKey]: { approved, comment: prev[fbKey]?.comment || '' },
    }));

    // Write to sheet — either as signed-in user, or via share token with client name
    if (sheetId && (authUser || shareToken)) {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId, postId, variant, approved, gid,
          share: shareToken,
          userName: shareToken ? (clientName || 'Anonymous') : undefined,
        }),
      }).catch(console.error);
    }
    // Fallback: Apps Script
    else if (scriptUrl) {
      fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ postId, variant, approved, comment: '' }),
      }).catch(console.error);
    }
  };

  const handleSelectGroup = (key: string) => {
    setSelectedGroupKey(key);
    setPreviewPlatform(null);
  };

  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-ink-muted">
        <p>No posts found with status &quot;Ready for Review&quot;.</p>
      </div>
    );
  }

  const totalPosts = posts.filter(p => p.status !== 'draft').length;
  const reviewedCount = Object.keys(feedbackMap).length
    + posts.filter(p => p.approved !== null && !feedbackMap[p.id]).length;

  return (
    <div className="flex h-screen bg-white">
      <PostList
        groups={groups}
        selectedGroupKey={selectedGroupKey}
        selectedVariant={selectedVariant}
        feedbackMap={feedbackMap}
        commentsMap={commentsCache}
        onSelectGroup={handleSelectGroup}
        onSelectVariant={setSelectedVariant}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-warm-gray bg-white">
          <div>
            <h1 className="text-lg font-display italic text-ink">Social Posts Preview</h1>
            {sheetId && authUser && (
              <p className="text-xs text-approve">Signed in as {authUser.name} — feedback syncs to sheet</p>
            )}
            {sheetId && shareToken && !authUser && (
              <p className="text-xs text-approve">
                Reviewing as <strong>{clientName || 'Anonymous'}</strong>
                {' · '}
                <button onClick={() => setAskingName(true)} className="underline hover:text-green-700">
                  Change name
                </button>
              </p>
            )}
            {sheetId && !authUser && !shareToken && authChecked && (
              <p className="text-xs text-ink-muted">
                Read-only.{' '}
                <a href="/api/auth/login" className="underline">Sign in with Google</a> to approve and comment.
              </p>
            )}
            {!sheetId && (
              <p className="text-xs text-ink-muted">Demo mode — using sample data</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink-muted">
              {reviewedCount}/{totalPosts} reviewed
            </span>

            {/* Share button — only for authenticated contractors */}
            {authUser && sheetId && !shareToken && (
              <button
                onClick={handleCreateShareLink}
                disabled={creatingShare}
                className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {creatingShare ? 'Creating...' : 'Share with client'}
              </button>
            )}

            {authUser ? (
              <div className="flex items-center gap-2">
                {authUser.picture && (
                  <img src={authUser.picture} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                )}
                <a href="/api/auth/logout" className="text-xs text-ink-muted hover:text-gray-600">
                  Sign out
                </a>
              </div>
            ) : authChecked && sheetId && !shareToken ? (
              <a
                href="/api/auth/login"
                className="px-3 py-1.5 bg-white border border-warm-gray rounded-lg text-xs font-medium text-ink hover:bg-gray-50 transition-colors"
              >
                Sign in with Google
              </a>
            ) : null}
          </div>
        </div>

        <PlatformSwitcher
          selected={activePlatform}
          originalPlatform={currentGroup?.platform ?? 'linkedin'}
          onChange={setPreviewPlatform}
        />

        <div className="flex-1 flex min-h-0">
          {/* Preview */}
          <div className="flex-1 overflow-y-auto bg-preview-bg flex items-start justify-center p-8">
            {currentPost ? (
              <PreviewRenderer platform={activePlatform} post={currentPost} imageCache={imageCache} />
            ) : (
              <p className="text-ink-muted">Select a post to preview</p>
            )}
          </div>

          {/* Right panel: feedback */}
          <FeedbackPanel
            post={currentPost}
            currentFeedback={currentPost ? feedbackMap[`${currentPost.id}_${currentPost.variant}`] : undefined}
            comments={currentPost ? commentsCache[`${currentPost.id}_${currentPost.variant}`] || [] : []}
            sheetId={sheetId}
            gid={gid}
            isAuthenticated={!!authUser || !!shareToken}
            shareToken={shareToken}
            clientName={clientName}
            onApprove={handleApprove}
            onAddComment={addCommentToCache}
          />
        </div>
      </div>

      {/* Share link modal */}
      {shareLink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShareLink('')}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-ink mb-1">Share this link with your client</h2>
            <p className="text-sm text-ink-muted mb-4">
              Anyone with the link can review and leave feedback under their own name. No sign-in required.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-2 bg-gray-50 border border-warm-gray rounded-lg text-xs text-ink font-mono"
                onFocus={e => e.target.select()}
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                {shareLinkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setShareLink('')}
              className="mt-4 w-full text-center text-sm text-ink-muted hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Client name prompt */}
      {askingName && shareToken && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="text-lg font-semibold text-ink mb-1">What&apos;s your name?</h2>
            <p className="text-sm text-ink-muted mb-4">
              We&apos;ll attribute your comments and approvals so the team knows who said what.
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem('name') as HTMLInputElement;
                handleSetClientName(input.value.trim() || 'Anonymous');
              }}
            >
              <input
                name="name"
                type="text"
                autoFocus
                defaultValue={clientName}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-warm-gray rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => handleSetClientName('Anonymous')}
                  className="px-4 py-2 bg-white border border-warm-gray rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Stay anonymous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
