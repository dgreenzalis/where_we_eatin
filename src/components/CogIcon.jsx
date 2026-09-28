/**
 * A gear, drawn from primitives: teeth radiating out of a thick ring whose
 * hollow centre is what reads as the hub.
 */
const TEETH = 8

export default function CogIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {Array.from({ length: TEETH }, (_, index) => (
        <rect
          key={index}
          x="10.8"
          y="1.5"
          width="2.4"
          height="4.6"
          rx="0.8"
          fill="currentColor"
          transform={`rotate(${(index * 360) / TEETH} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="6.6" fill="none" stroke="currentColor" strokeWidth="3.2" />
    </svg>
  )
}
