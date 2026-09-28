import { useCallback, useEffect, useState } from 'react'
import { nextRotation } from '../lib/wheel.js'

/**
 * Owns the spin state machine: idle -> spinning -> settled.
 *
 * The winner is picked up front (the animation is just presentation) but is
 * only revealed once the wheel has come to rest.
 *
 * @param {Array<{id: string, name: string}>} items
 * @param {number} durationMs how long the wheel takes to settle
 */
export function useWheelSpin(items, durationMs) {
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState(null)
  const [pendingWinner, setPendingWinner] = useState(null)

  const isSpinning = pendingWinner !== null

  // Reveal the winner once the wheel has finished settling. Returning the
  // cleanup keeps the timer tied to the component's lifetime.
  useEffect(() => {
    if (pendingWinner === null) return undefined

    const timeoutId = window.setTimeout(() => {
      setWinner(pendingWinner)
      setPendingWinner(null)
    }, durationMs)

    return () => window.clearTimeout(timeoutId)
  }, [pendingWinner, durationMs])

  const spin = useCallback(() => {
    if (isSpinning || items.length === 0) return

    const index = Math.floor(Math.random() * items.length)

    setWinner(null)
    setPendingWinner(items[index])
    // Functional update: the next rotation builds on wherever we stopped last.
    setRotation((previous) => nextRotation(previous, index, items.length))
  }, [isSpinning, items])

  const clearWinner = useCallback(() => setWinner(null), [])

  return { rotation, isSpinning, winner, spin, clearWinner }
}
