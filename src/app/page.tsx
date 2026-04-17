'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractSheetId, extractGid } from '@/lib/sheets';

export default function Home() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ name: string; picture: string } | null>(null);
  const router = useRouter();

  useState(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.authenticated) setUser(data.user); })
      .catch(() => {});
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setError('Please enter a valid Google Sheet URL');
      return;
    }
    const gid = extractGid(sheetUrl) || undefined;
    let url = `/preview?sheet=${sheetId}`;
    if (gid) url += `&gid=${gid}`;
    router.push(url);
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 relative">
      {/* Auth — top right */}
      <div className="absolute top-4 right-6">
        {user ? (
          <div className="flex items-center gap-2 text-sm text-ink-light">
            {user.picture && (
              <img src={user.picture} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
            )}
            <span>{user.name}</span>
            <a href="/api/auth/logout" className="text-ink-muted hover:text-ink-light text-xs">Sign out</a>
          </div>
        ) : (
          <a
            href="/api/auth/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-warm-gray rounded-lg text-sm font-medium text-ink hover:bg-cream-dark transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in
          </a>
        )}
      </div>

      <div className="w-full max-w-xl text-center">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-display text-ink mb-3 italic">Get feedback on social posts before they go live</h1>
          <p className="text-ink-light text-base">
            Share realistic previews with clients. Collect approvals and comments — straight to your spreadsheet.
          </p>
        </div>

        {/* Connect form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={sheetUrl}
              onChange={e => {
                setSheetUrl(e.target.value);
                setError('');
              }}
              placeholder="Paste Google Sheet URL..."
              className="flex-1 px-4 py-3 bg-white border border-warm-gray rounded-xl text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-colors"
            >
              Preview
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 text-left">{error}</p>
          )}
        </form>

        <p className="text-xs text-ink-muted">
          Don&apos;t have a sheet yet?{' '}
          <a href="/social-posts-template.csv" download="social-posts-template.csv" className="text-accent hover:text-accent-hover underline">Download the template</a> to get started.
        </p>

        {/* How it works */}
        <div className="mt-14 text-left bg-white rounded-2xl p-8 border border-warm-gray">
          <h2 className="font-display text-xl text-ink mb-5 italic">How it works</h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Download the template', desc: 'Import it into Google Sheets, fill in your posts.' },
              { step: '2', title: 'Sign in with Google', desc: 'So the app can read your sheet and sync feedback.' },
              { step: '3', title: 'Paste your sheet URL', desc: 'Preview how posts look across platforms.' },
              { step: '4', title: 'Share with your client', desc: 'One click generates a review link — no sign-in needed for them.' },
              { step: '5', title: 'Client reviews, you see it in your sheet', desc: 'Approvals and comments land right in the spreadsheet.' },
            ].map(item => (
              <div key={item.step} className="flex gap-3">
                <span className="w-6 h-6 bg-accent-light text-accent rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="text-xs text-ink-muted">{item.desc}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-ink-muted mt-4 pt-4 border-t border-warm-gray">
              Want to see it in action first?{' '}
              <button onClick={() => router.push('/preview?demo=true')} className="text-accent hover:text-accent-hover underline cursor-pointer">Try with sample data</button>
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-ink-muted">
          Your data stays in Google Sheets. Nothing is stored on our servers.
        </p>

        <p className="mt-4 text-[10px] text-ink-muted/60 mb-8">
          Made by <a href="https://michalina.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-muted">michalina.dev</a>
        </p>
      </div>
    </main>
  );
}
