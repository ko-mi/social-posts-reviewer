'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { SocialPost } from '@/lib/types';
import { fetchSheetData, extractSheetId, extractGid, type ParsedComment } from '@/lib/sheets';
import { SAMPLE_POSTS } from '@/lib/sample-data';
import { Dashboard } from '@/components/Dashboard';

function PreviewContent() {
  const searchParams = useSearchParams();
  const sheetParam = searchParams.get('sheet');
  const scriptParam = searchParams.get('script');
  const gidParam = searchParams.get('gid');
  const shareParam = searchParams.get('share');
  const isDemo = searchParams.get('demo') === 'true' || !sheetParam;

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [initialComments, setInitialComments] = useState<Record<string, ParsedComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      setPosts(SAMPLE_POSTS);
      setLoading(false);
      return;
    }

    const sheetId = extractSheetId(sheetParam!);
    if (!sheetId) {
      setError('Invalid Google Sheet URL. Please check the link and try again.');
      setLoading(false);
      return;
    }

    const gid = gidParam || extractGid(sheetParam!) || undefined;

    fetchSheetData(sheetId, gid, shareParam ?? undefined)
      .then(data => {
        setPosts(data.posts);
        setInitialComments(data.commentsMap);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [sheetParam, isDemo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Couldn&apos;t load posts</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600"
          >
            Go back
          </a>
        </div>
      </div>
    );
  }

  const sheetId = sheetParam ? extractSheetId(sheetParam) ?? undefined : undefined;

  const gid = gidParam || (sheetParam ? extractGid(sheetParam) : null) || undefined;

  return <Dashboard posts={posts} sheetId={sheetId} gid={gid} scriptUrl={scriptParam ?? undefined} shareToken={shareParam ?? undefined} initialComments={initialComments} />;
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
