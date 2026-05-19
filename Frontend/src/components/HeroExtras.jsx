import React from 'react'

export const ClockIcon = () => (
  <div style={{
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="white" stroke="#e8e8e8" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="15" fill="#fafafa" />
      <line x1="20" y1="20" x2="13.5" y2="13" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20" y1="20" x2="27" y2="10" stroke="#333" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#ef4444" />
    </svg>
  </div>
)

export const QRCard = ({ url = 'https://example.com/demo', size = 88 }) => {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={qrSrc} alt="Demo QR" width={size} height={size} style={{ display: 'block', borderRadius: 6 }} />
    </div>
  )
}

export default null
