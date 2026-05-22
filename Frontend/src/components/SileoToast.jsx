import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function SileoToast({ 
  message, 
  type = 'success', 
  actionLabel, 
  onAction, 
  onClose, 
  isVisible 
}) {
  const toastRef = useRef(null)
  const [shouldRender, setShouldRender] = useState(isVisible)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
    }
  }, [isVisible])

  useEffect(() => {
    if (!toastRef.current) return

    if (isVisible) {
      // Sileo-style bouncy/springy entrance animation using GSAP
      gsap.killTweensOf(toastRef.current)
      gsap.fromTo(toastRef.current, 
        { 
          y: 60, 
          scale: 0.85, 
          opacity: 0,
          x: '-50%' // Keeps the absolute horizontal centering
        },
        { 
          y: 0, 
          scale: 1, 
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.8)', // Bouncy spring effect
          overwrite: 'auto'
        }
      )
    } else if (shouldRender) {
      // Smooth fade & scale down exit
      gsap.killTweensOf(toastRef.current)
      gsap.to(toastRef.current, {
        y: 40,
        scale: 0.9,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          setShouldRender(false)
        }
      })
    }
  }, [isVisible, shouldRender])

  useEffect(() => {
    if (isVisible && !actionLabel) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, actionLabel, onClose]);

  if (!shouldRender || !message) return null

  // Determine icon and color mapping
  let iconBg = 'bg-emerald-500'
  let iconSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )

  if (type === 'error') {
    iconBg = 'bg-rose-500'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    )
  } else if (type === 'info') {
    iconBg = 'bg-blue-500'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.028M12 7.5h.008v.008H12V7.5z" />
      </svg>
    )
  }

  return (
    <div
      ref={toastRef}
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      className="flex items-center gap-4.5 rounded-full border border-slate-200/80 bg-white/95 px-5.5 py-4 shadow-[0_16px_48px_rgba(15,23,42,0.18)] backdrop-blur-md"
    >
      {/* Icon Badge */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg} shadow-sm animate-[pulse_3s_infinite]`}>
        {iconSvg}
      </div>

      {/* Message */}
      <span className="text-sm font-bold text-slate-800 tracking-tight whitespace-nowrap">
        {message}
      </span>

      {/* Conditional Action Separator & Button */}
      {actionLabel && onAction ? (
        <>
          <div className="h-4.5 w-px bg-slate-200 shrink-0" />
          <button
            onClick={() => {
              onAction()
              if (onClose) onClose()
            }}
            className="text-sm font-extrabold text-blue-600 hover:text-blue-700 transition whitespace-nowrap active:scale-95 shrink-0"
          >
            {actionLabel}
          </button>
        </>
      ) : null}

      {/* Close button if no action is provided */}
      {!actionLabel ? (
        <>
          <div className="h-4 w-px bg-slate-100 shrink-0" />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold transition whitespace-nowrap active:scale-90 pr-0.5"
            aria-label="Dismiss toast"
            title="Dismiss toast"
          >
            ✕
          </button>
        </>
      ) : null}
    </div>
  )
}
