import { ImageResponse } from 'next/og';

export const alt = 'Social Posts Previewer — Get feedback on social posts before they go live';
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
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '32px',
          }}
        >
          <span style={{ background: '#0a66c2', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '16px' }}>LinkedIn Ad</span>
          <span style={{ background: '#4285f4', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '16px' }}>Google Ad</span>
          <span style={{ background: '#0a66c2', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '16px' }}>LinkedIn</span>
          <span style={{ background: '#0f1419', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '16px' }}>X</span>
          <span style={{ background: '#1877f2', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '16px' }}>Facebook</span>
          <span style={{ background: '#e1306c', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '16px' }}>Instagram</span>
        </div>

        <div
          style={{
            fontSize: '56px',
            color: '#2a2523',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          Get feedback on social posts before they go live
        </div>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '40px',
            alignItems: 'center',
          }}
        >
          <span style={{ background: '#3a7d5c', color: 'white', padding: '10px 28px', borderRadius: '10px', fontSize: '18px', fontWeight: 600 }}>Approve</span>
          <span style={{ background: '#f0f0f0', color: '#999', padding: '10px 28px', borderRadius: '10px', fontSize: '18px', fontWeight: 600, border: '1px solid #ddd' }}>Needs Changes</span>
          <span style={{ color: '#9a918b', fontSize: '16px', marginLeft: '8px' }}>+ Comments</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            fontSize: '14px',
            color: '#9a918b',
          }}
        >
          michalina.dev
        </div>
      </div>
    ),
    { ...size },
  );
}
