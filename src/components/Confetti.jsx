import { useEffect, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Confetti.module.css'

const PIECES = 70

/** Longest a piece can take to fall, delay included — when the layer retires. */
const LIFETIME_MS = 4200

/** The app's own colours, so a burst looks like it came from this wheel. */
const COLORS = [
  '#d13b40',
  '#d9722a',
  '#f0a64a',
  '#ffd79a',
  '#3d8f56',
  '#2b7f9e',
  '#6a58ab',
  '#f7e7c8',
]

function random(min, max) {
  return min + Math.random() * (max - min)
}

/**
 * Built once per burst, in a state initialiser, so re-renders while the pieces
 * are falling — and there are plenty, the result animates in alongside — do
 * not reshuffle them mid-air.
 */
function buildPieces() {
  return Array.from({ length: PIECES }, (_, id) => {
    const round = Math.random() < 0.3
    const width = random(6, 11)

    return {
      id,
      round,
      width,
      height: round ? width : random(9, 16),
      left: random(0, 100),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: random(0, 1.1),
      duration: random(1.9, 3.1),
      drift: random(-16, 16),
      spin: random(-900, 900),
    }
  })
}

/**
 * A one-shot fall of confetti over the whole viewport.
 *
 * Mount it to fire it and it clears itself up; the caller replays a burst by
 * unmounting and mounting again, which is what happens anyway each time a
 * spin clears the winner and sets a new one.
 */
export default function Confetti() {
  const prefersReducedMotion = useReducedMotion()
  const [pieces] = useState(buildPieces)
  const [spent, setSpent] = useState(false)

  // Retire the layer once the last piece has landed, rather than leaving
  // seventy invisible nodes sitting on the page until the next spin.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSpent(true), LIFETIME_MS)
    return () => window.clearTimeout(timeoutId)
  }, [])

  if (prefersReducedMotion || spent) return null

  return (
    <div className={styles.layer} aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={styles.piece}
          style={{
            left: `${piece.left}%`,
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            background: piece.color,
            borderRadius: piece.round ? '50%' : '1px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            '--drift': `${piece.drift}vw`,
            '--spin': `${piece.spin}deg`,
          }}
        />
      ))}
    </div>
  )
}
