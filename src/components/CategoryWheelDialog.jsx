import { useEffect, useId, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { useWheelSpin } from '../hooks/useWheelSpin.js'
import Confetti from './Confetti.jsx'
import Wheel from './Wheel.jsx'
import styles from './CategoryWheelDialog.module.css'

/** A shade quicker than the main wheel — this is the second spin of the round. */
const SPIN_MS = 3600
const REDUCED_SPIN_MS = 400

/** A beat after the dialog appears, so the spin is something you watch start. */
const AUTO_SPIN_DELAY_MS = 550

/**
 * The follow-up wheel, shown when the main wheel lands on a category rather
 * than a place. It spins itself as soon as it opens, then stays open so the
 * round can be re-rolled.
 *
 * Mounted only while a category is in play, so every visit starts fresh.
 * `items` is owned by the app, so an edited list survives closing the dialog.
 */
export default function CategoryWheelDialog({ category, items, onClose, onSettled }) {
  const dialogRef = useRef(null)
  const bodyRef = useRef(null)
  const headingId = useId()

  const prefersReducedMotion = useReducedMotion()
  const spinDuration = prefersReducedMotion ? REDUCED_SPIN_MS : SPIN_MS

  const { rotation, isSpinning, winner, spin } = useWheelSpin(items, spinDuration)

  // showModal gives us focus containment, Escape and an inert backdrop from
  // the platform. Unmounting removes the element, which closes it — so there
  // is deliberately no close() here to fire a second, spurious close event.
  //
  // Focus goes to the card rather than being left to the default (the first
  // enabled button): the auto-spin disables "Spin again" a moment later, and
  // the browser drops focus to <body> when the focused element goes disabled.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      bodyRef.current?.focus()
    }
  }, [])

  // Held in a ref so the auto-spin effect can stay mount-only: spin's identity
  // changes as the wheel settles, and depending on it would re-trigger.
  const spinRef = useRef(spin)
  useEffect(() => {
    spinRef.current = spin
  }, [spin])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => spinRef.current(), AUTO_SPIN_DELAY_MS)
    return () => window.clearTimeout(timeoutId)
  }, [])

  // Report upwards as the wheel settles, and clear again on a re-roll, so the
  // page behind the dialog never shows a stale pick.
  useEffect(() => {
    onSettled(winner)
  }, [winner, onSettled])

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={headingId}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {winner && <Confetti />}

      <div className={styles.body} ref={bodyRef} tabIndex={-1}>
        <header className={styles.header}>
          <p className={styles.prompt}>{category.prompt}</p>
          <h2 id={headingId} className={styles.question}>{category.question}</h2>
        </header>

        <Wheel
          items={items}
          rotation={rotation}
          durationMs={spinDuration}
          isSpinning={isSpinning}
          variant={category.variant}
        />

        <p className={styles.result} role="status" aria-live="polite">
          {winner ? (
            <>
              <span className={styles.resultLabel}>Tonight it's</span>
              <span className={styles.resultName}>{winner.name}</span>
            </>
          ) : (
            <span className={styles.resultHint}>
              {isSpinning ? 'Spinning…' : 'Warming up the oven…'}
            </span>
          )}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondary}
            onClick={spin}
            disabled={isSpinning}
          >
            Spin again
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={onClose}
            disabled={!winner}
          >
            Lock it in
          </button>
        </div>
      </div>
    </dialog>
  )
}
