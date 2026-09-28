import { useEffect, useId, useRef, useState } from 'react'
import { MIN_CATEGORY_OPTIONS } from '../lib/categories.js'
import { createRestaurant, MAX_NAME_LENGTH, MAX_RESTAURANTS } from '../lib/restaurants.js'
import styles from './CategoryEditorDialog.module.css'

/**
 * Edits the list behind a category's wheel.
 *
 * Changes are applied straight to the app rather than staged behind a save:
 * there is nothing here that a second click of Remove cannot undo, and the
 * wheel is rebuilt from this list the next time it opens.
 */
export default function CategoryEditorDialog({ category, items, onChange, onClose }) {
  const dialogRef = useRef(null)
  const bodyRef = useRef(null)
  const headingId = useId()
  const [draft, setDraft] = useState('')

  const isFull = items.length >= MAX_RESTAURANTS
  const canRemove = items.length > MIN_CATEGORY_OPTIONS
  const canSubmit = draft.trim().length > 0 && !isFull

  // Same reasoning as the wheel dialog: open as a modal, and put focus on the
  // card so it never lands on a control that is about to be disabled.
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      bodyRef.current?.focus()
    }
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    onChange([...items, createRestaurant(draft)])
    setDraft('')
  }

  function handleRemove(id) {
    if (!canRemove) return
    onChange(items.filter((item) => item.id !== id))
  }

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
      <div className={styles.body} ref={bodyRef} tabIndex={-1}>
        <header className={styles.header}>
          <p className={styles.prompt}>{category.name} wheel</p>
          <h2 id={headingId} className={styles.question}>What&apos;s on it?</h2>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.srOnly} htmlFor="new-category-option">
            Add a {category.name.toLowerCase()} spot
          </label>
          <input
            id="new-category-option"
            className={styles.input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={isFull ? 'List is full' : 'Add a spot…'}
            maxLength={MAX_NAME_LENGTH}
            disabled={isFull}
            autoComplete="off"
          />
          <button type="submit" className={styles.add} disabled={!canSubmit}>
            Add
          </button>
        </form>

        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.name}>{item.name}</span>
              <button
                type="button"
                className={styles.remove}
                onClick={() => handleRemove(item.id)}
                disabled={!canRemove}
                aria-label={`Remove ${item.name}`}
                title={canRemove ? undefined : `Keep at least ${MIN_CATEGORY_OPTIONS} spots`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <p className={styles.footnote} aria-live="polite">
          {items.length}/{MAX_RESTAURANTS} spots
          {canRemove ? '' : ` · at least ${MIN_CATEGORY_OPTIONS} needed`}
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
