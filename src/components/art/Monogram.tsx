export interface ArtProps {
  className?: string
}

/** Original "SC" mark: one-stroke S, open C, and an accent full stop. Draws in once; static under reduced motion (see art.css). */
export default function Monogram({ className = '' }: ArtProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="SC monogram"
      className={`monogram ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        className="mono-stroke"
        pathLength={1}
        d="M27 19.5C24.5 15.5 12.5 15 12.5 22.5C12.5 29.5 27.5 28.5 27.5 37C27.5 44.5 15 45.5 11 40.5"
      />
      <path className="mono-stroke mono-stroke--c" pathLength={1} d="M52 21.5A12.5 12.5 0 1 0 52 38.5" />
      <circle className="mono-dot" cx="55.5" cy="46" r="3.2" fill="var(--color-accent)" stroke="none" />
    </svg>
  )
}
