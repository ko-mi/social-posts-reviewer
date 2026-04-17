'use client';

import { useState, useEffect } from 'react';
import { SocialPost, ApprovalStatus } from '@/lib/types';
import type { ParsedComment } from '@/lib/sheets';

interface Props {
  post: SocialPost | undefined;
  currentFeedback: { approved: ApprovalStatus; comment: string } | undefined;
  comments: ParsedComment[];
  sheetId?: string;
  gid?: string;
  isAuthenticated: boolean;
  shareToken?: string;
  clientName?: string;
  onApprove: (postId: string, variant: string, approved: ApprovalStatus) => void;
  onAddComment: (postId: string, variant: string, comment: ParsedComment) => void;
}

export function FeedbackPanel({
  post, currentFeedback, comments, sheetId, gid,
  isAuthenticated, shareToken, clientName, onApprove, onAddComment,
}: Props) {
  const [comment, setComment] = useState('');
  useEffect(() => {
    setComment('');
  }, [post?.id, post?.variant]);

  if (!post) return null;

  const isDemo = !sheetId;
  const canInteract = isAuthenticated || isDemo;
  const status = currentFeedback?.approved ?? post.approved;

  const getUserName = (): string => {
    if (isDemo) return 'You';
    if (shareToken) return clientName || 'Anonymous';
    if (typeof document === 'undefined') return 'You';
    const match = document.cookie.match(/google_user=([^;]+)/);
    if (!match) return 'You';
    try { return JSON.parse(decodeURIComponent(match[1])).name || 'You'; } catch { return 'You'; }
  };

  const submitToSheet = (approved?: ApprovalStatus, commentText?: string) => {
    if (!sheetId) return;
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetId, postId: post.id, variant: post.variant,
        approved: approved ?? undefined,
        comment: commentText || undefined,
        gid, share: shareToken,
        userName: shareToken ? (clientName || 'Anonymous') : undefined,
      }),
    }).catch(err => console.error('Feedback save error:', err));
  };

  const addLocalComment = (text: string) => {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    onAddComment(post.id, post.variant, { userName: getUserName(), timestamp, comment: text });
  };

  const handleApprove = (approved: ApprovalStatus) => {
    onApprove(post.id, post.variant, approved);
    if (isAuthenticated && sheetId) {
      submitToSheet(approved, undefined);
    }
  };

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    const text = comment.trim();
    addLocalComment(text);
    setComment('');
    if (isAuthenticated && sheetId) {
      submitToSheet(undefined, text);
    }
  };

  return (
    <div className="w-80 border-l border-warm-gray bg-white flex flex-col flex-shrink-0">
      {/* Verdict */}
      <div className="p-4 border-b border-warm-gray/50">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wider block mb-3">Verdict</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove('approved')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              status === 'approved'
                ? 'bg-approve text-white shadow-md'
                : 'bg-[#f0f0f0] text-[#999] border border-[#ddd] hover:text-approve hover:bg-approve-light'
            }`}
          >
            Approve
          </button>
          <button
            onClick={() => handleApprove('rejected')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              status === 'rejected'
                ? 'bg-reject text-white shadow-md'
                : 'bg-[#f0f0f0] text-[#999] border border-[#ddd] hover:text-reject hover:bg-reject-light'
            }`}
          >
            Needs Changes
          </button>
        </div>
        {!isAuthenticated && sheetId && !shareToken && (
          <a href="/api/auth/login" className="text-xs text-amber-500 underline hover:text-amber-600 block mt-2">
            Sign in to review
          </a>
        )}
      </div>

      {/* Comments thread — scrollable, takes remaining space */}
      <div className="flex-1 overflow-y-auto p-4">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wider block mb-3">
          Comments {comments.length > 0 && `(${comments.length})`}
        </span>
        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold flex-shrink-0 text-xs">
                  {c.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-semibold text-ink text-sm">{c.userName}</span>
                    {c.timestamp && <span className="text-ink-muted text-[10px]">{c.timestamp}</span>}
                  </div>
                  <p className="text-ink-light text-sm mt-0.5 break-words">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">No comments yet</p>
        )}
      </div>

      {/* Comment input — pinned to bottom */}
      <div className="p-3 border-t border-warm-gray/50">
        <div className="flex gap-2">
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={canInteract ? 'Leave feedback...' : 'Sign in to comment'}
            disabled={!canInteract}
            rows={3}
            className="flex-1 px-3 py-2 border border-warm-gray rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-ink-muted">Enter to send</p>
          <button
            onClick={handleSubmitComment}
            disabled={!comment.trim() || !canInteract}
            className="px-3 py-1 bg-accent text-white rounded-md text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
