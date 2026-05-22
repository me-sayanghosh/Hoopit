import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function SileoToast({ 
  message, 
  type = 'success', 
  actionLabel, 
  onAction, 
  onClose, 
  isVisible,
  position = 'bottom-center'
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

    const isRight = position === 'bottom-right'
    const xVal = isRight ? 0 : '-50%'

    if (isVisible) {
      // Sileo-style bouncy/springy entrance animation using GSAP
      gsap.killTweensOf(toastRef.current)
      gsap.fromTo(toastRef.current, 
        { 
          y: 60, 
          scale: 0.85, 
          opacity: 0,
          x: xVal
        },
        { 
          y: 0, 
          scale: 1, 
          opacity: 1,
          x: xVal,
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
        x: xVal,
        duration: 0.35,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          setShouldRender(false)
        }
      })
    }
  }, [isVisible, shouldRender, position])

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
  let iconBg = 'bg-emerald-500 shadow-[0_2px_10px_rgba(16,185,129,0.35)]'
  let iconSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )

  if (type === 'error') {
    iconBg = 'bg-rose-500 shadow-[0_2px_10px_rgba(244,63,94,0.35)]'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    )
  } else if (type === 'info') {
    iconBg = 'bg-blue-500 shadow-[0_2px_10px_rgba(59,130,246,0.35)]'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.028M12 7.5h.008v.008H12V7.5z" />
      </svg>
    )
  } else if (type === 'copy') {
    iconBg = 'bg-indigo-500 shadow-[0_2px_10px_rgba(99,102,241,0.35)]'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  } else if (type === 'archive') {
    iconBg = 'bg-amber-500 shadow-[0_2px_10px_rgba(245,158,11,0.35)]'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    )
  } else if (type === 'delete') {
    iconBg = 'bg-rose-500 shadow-[0_2px_10px_rgba(244,63,94,0.35)]'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.34 6.6m-4.78 0L9 9m4.77-3.07l1.91.55c.51.15.86.61.86 1.15v.377m-15.318 0l1.353 13.622a2.25 2.25 0 002.25 2.25h9.081a2.25 2.25 0 002.25-2.25L18.735 7.697m-15.318 0l.524-5.23A2.244 2.244 0 005.25 2.75h13.5m-15 0h16.5" />
      </svg>
    )
  } else if (type === 'folder') {
    iconBg = 'bg-sky-500 shadow-[0_2px_10px_rgba(14,165,233,0.35)]'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    )
  } else if (type === 'share') {
    iconBg = 'bg-fuchsia-500 shadow-[0_2px_10px_rgba(217,70,239,0.35)]'
    iconSvg = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-white">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    )
  }

  const isRight = position === 'bottom-right'
  const positionStyle = {
    position: 'fixed',
    zIndex: 9999,
    pointerEvents: isVisible ? 'auto' : 'none',
    bottom: isRight ? undefined : '24px',
    left: isRight ? undefined : '50%',
    transform: isRight ? undefined : 'translateX(-50%)',
  }

  return (
    <div
      ref={toastRef}
      style={positionStyle}
      className={`w-[calc(100%-2rem)] sm:w-auto max-w-[420px] sm:max-w-xl flex items-center gap-3 sm:gap-4.5 rounded-full border border-slate-200/80 bg-white/95 px-4 py-3 sm:px-5.5 sm:py-4 shadow-[0_16px_48px_rgba(15,23,42,0.18)] backdrop-blur-md ${
        isRight 
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6' 
          : ''
      }`}
    >
      {/* Icon Badge */}
      <div className={`flex h-7.5 w-7.5 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${iconBg} shadow-sm animate-[pulse_3s_infinite]`}>
        {iconSvg}
      </div>

      {/* Message */}
      <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight min-w-0 flex-1 truncate">
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
            className="text-xs sm:text-sm font-extrabold text-blue-600 hover:text-blue-700 transition whitespace-nowrap active:scale-95 shrink-0"
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
            className="text-slate-400 hover:text-slate-600 text-xs font-bold transition whitespace-nowrap active:scale-90 pr-0.5 shrink-0"
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
