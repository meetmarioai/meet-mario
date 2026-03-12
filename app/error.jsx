"use client";

export default function Error({ error, reset }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F7F4F0', padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'EB Garamond, Georgia, serif', fontSize: 28, color: '#2C2218', marginBottom: 8 }}>
        Something went wrong
      </div>
      <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 13, color: '#8C7B6B', marginBottom: 32, maxWidth: 320, lineHeight: 1.6 }}>
        Mario encountered an unexpected error. Your data is safe — tap below to try again.
      </div>
      <button
        onClick={() => reset()}
        style={{
          background: '#C4622D', color: '#fff', border: 'none', borderRadius: 10,
          padding: '13px 32px', fontFamily: 'system-ui, sans-serif', fontSize: 14,
          fontWeight: 600, cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}
