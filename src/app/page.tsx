'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { extractSheetId } from '@/lib/sheets';

export default function Home() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [scriptUrl, setScriptUrl] = useState('');
  const [error, setError] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const router = useRouter();

  const buildPreviewUrl = (sheetId: string, script?: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    let url = `${base}/preview?sheet=${sheetId}`;
    if (script) url += `&script=${encodeURIComponent(script)}`;
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setError('Please enter a valid Google Sheet URL or ID');
      return;
    }
    const url = buildPreviewUrl(sheetId, scriptUrl || undefined);
    router.push(url.replace(window.location.origin, ''));
  };

  const handleGenerateLink = () => {
    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setError('Please enter a valid Google Sheet URL or ID');
      return;
    }
    setShareLink(buildPreviewUrl(sheetId, scriptUrl || undefined));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* Logo / Title */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Posts Previewer</h1>
          <p className="text-gray-500 text-lg">
            Preview social media posts exactly as they&apos;ll appear.
            <br />
            <span className="text-base">Approve, comment, and send feedback — all from one place.</span>
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setShowSetup(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showSetup ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I&apos;m a Client
          </button>
          <button
            onClick={() => setShowSetup(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              showSetup ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I&apos;m a Contractor
          </button>
        </div>

        {!showSetup ? (
          <>
            {/* Client view — just paste the link */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={e => {
                    setSheetUrl(e.target.value);
                    setError('');
                  }}
                  placeholder="Paste the review link or Sheet URL..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  Preview
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500 text-left">{error}</p>
              )}
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Demo button */}
            <button
              onClick={() => router.push('/preview?demo=true')}
              className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            >
              Try with sample data
            </button>
          </>
        ) : (
          <>
            {/* Contractor view — setup + generate shareable link */}
            <div className="text-left space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Google Sheet URL
                </label>
                <input
                  type="text"
                  value={sheetUrl}
                  onChange={e => {
                    setSheetUrl(e.target.value);
                    setError('');
                    setShareLink('');
                  }}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Apps Script URL <span className="text-gray-400 font-normal">(for feedback write-back)</span>
                </label>
                <input
                  type="text"
                  value={scriptUrl}
                  onChange={e => {
                    setScriptUrl(e.target.value);
                    setShareLink('');
                  }}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Deploy the Apps Script once — client feedback will sync back to your sheet.
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleGenerateLink}
                  className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
                >
                  Generate Client Link
                </button>
                <button
                  onClick={handleSubmit as () => void}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Preview
                </button>
              </div>

              {/* Shareable link output */}
              {shareLink && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-medium text-green-800 mb-2">
                    Share this link with your client:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareLink}
                      className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-xs text-gray-700 font-mono"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    This link is reusable — send it to any client reviewing these posts.
                  </p>
                </div>
              )}
            </div>

            {/* Setup instructions */}
            <div className="text-left bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">One-time setup</h2>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Create your sheet from the template', desc: 'Columns: Post ID, Campaign, Platform, Variant, Post Text, Image URL, Link URL, Scheduled Date, Status, Approved, Client Comment, Reviewed At' },
                  { step: '2', title: 'Publish to web', desc: 'File \u2192 Share \u2192 Publish to web \u2192 Publish (as Web page)' },
                  { step: '3', title: 'Deploy the Apps Script', desc: 'Extensions \u2192 Apps Script \u2192 paste the template code \u2192 Deploy as Web app (Anyone)' },
                  { step: '4', title: 'Generate & share the link', desc: 'Paste both URLs above, generate the client link, and send it. Done!' },
                ].map(item => (
                  <div key={item.step} className="flex gap-3">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <p className="mt-8 text-xs text-gray-400 mb-8">
          Posts are read directly from your Google Sheet. No data is stored on our servers.
        </p>
      </div>
    </main>
  );
}
