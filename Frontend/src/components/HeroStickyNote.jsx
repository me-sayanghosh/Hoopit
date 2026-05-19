import React from 'react'

export default function StickyNote({ children, style = {} }) {
  return (
    <div style={{
      width: 150,
      background: '#FEF08A',
      borderRadius: 6,
      padding: '12px 12px 18px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      transform: 'rotate(-4deg)',
      fontFamily: "'Caveat', cursive",
      fontSize: 14,
      lineHeight: 1.4,
      color: '#333',
      position: 'relative',
      ...style,
    }}>
      <div style={{
        position: 'absolute',
        top: -8,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: '#ef4444',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      }} />
      {children || 'Quick note'
      }
    </div>
  )
}
