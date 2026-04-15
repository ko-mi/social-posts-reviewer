'use client';

import { useState, useEffect } from 'react';
import { SocialPost, ApprovalStatus } from '@/lib/types';

interface Props {
  post: SocialPost | undefined;
  currentFeedback: { approved: ApprovalStatus; comment: string } | undefined;
  onSubmit: (postId: string, approved: ApprovalStatus, comment: string) => void;
}

export function FeedbackPanel({ post, currentFeedback, onSubmit }: Props) {
  const [comment, setComment] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  // Reset comment field when switching posts
  useEffect(() => {
    setComment('');
    setSavedNotice('');
  }, [post?.id]);

  if (!post) return null;

  const status = currentFeedback?.approved ?? post.approved;
  const savedComment = currentFeedback?.comment ?? post.clientComment;

  const handleApprove = (approved: ApprovalStatus) => {
    onSubmit(post.id, approved, comment || savedComment);
    setSavedNotice(approved === 'approved' ? 'Approved' : 'Marked for changes');
    setTimeout(() => setSavedNotice(''), 2000);
  };

  const handleSaveComment = () => {
    if (!comment.trim()) return;
    onSubmit(post.id, status, comment);
    setSavedNotice('Comment saved');
    setTimeout(() => setSavedNotice(''), 2000);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          {/* Approval buttons */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Verdict
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  status === 'approved'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700 border border-gray-200'
                }`}
              >
                Approve
              </button>
              <button
                onClick={() => handleApprove('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  status === 'rejected'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 border border-gray-200'
                }`}
              >
                Needs Changes
              </button>
            </div>
          </div>

          {/* Comment */}
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">
              Comment
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={savedComment || 'Leave feedback for the contractor...'}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSaveComment();
                  }
                }}
              />
              {comment.trim() && (
                <button
                  onClick={handleSaveComment}
                  className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  Save
                </button>
              )}
            </div>
            {savedComment && !comment && (
              <p className="mt-1 text-xs text-gray-400">
                Previous comment: &ldquo;{savedComment}&rdquo;
              </p>
            )}
          </div>

          {/* Status indicator */}
          {savedNotice && (
            <div className="flex items-center text-green-600 text-sm font-medium animate-fade-in pt-6">
              {savedNotice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
