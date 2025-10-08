import { useEffect, useRef, useState } from 'react'

interface MarqueeProps {
  children: React.ReactNode
  className?: string
}

const Marquee = ({ children, className = '' }: MarqueeProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const contentWidth = contentRef.current.scrollWidth
        setIsOverflowing(contentWidth > containerWidth)
      }
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [children])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={contentRef}
        className={`inline-block ${isOverflowing ? 'animate-marquee' : ''}`}
        style={
          isOverflowing
            ? {
                animation: 'marquee 12s linear infinite',
                animationPlayState: 'running',
              }
            : undefined
        }
      >
        {children}
        {isOverflowing && <span className="mx-8">{children}</span>}
      </div>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  )
}

export default Marquee

