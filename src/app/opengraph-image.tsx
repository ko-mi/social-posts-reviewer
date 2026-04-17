import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Social Posts Previewer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#faf8f6',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Decorative platform pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          {[
            { label: 'LinkedIn Ad', color: '#0a66c2' },
            { label: 'Google Ad', color: '#4285f4' },
            { label: 'LinkedIn', color: '#0a66c2' },
            { label: 'X', color: '#0f1419' },
            { label: 'Facebook', color: '#1877f2' },
            { label: 'Instagram', color: '#e1306c' },
          ].map(p => (
            <div
              key={p.label}
              style={{
                background: p.color,
                color: 'white',
                padding: '8px 20px',
                borderRadius: '999px',
                fontSize: '18px',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 500,
              }}
            >
              {p.label}
            </div>
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontStyle: 'italic',
            color: '#2a2523',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          Get feedback on social posts before they go live
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#5c5450',
            marginTop: '24px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Preview, approve, comment — powered by Google Sheets
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '18px',
            color: '#9a918b',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          michalina.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
