import { useMemo, useState } from 'react'
import {
  canToggleVeto,
  countVetoed,
  MAX_NAME_LENGTH,
  MAX_RESTAURANTS,
  vetoLimit,
} from '../lib/restaurants.js'
import { sliceColor } from '../lib/wheel.js'
import styles from './RestaurantList.module.css'

const VETOED_SWATCH = '#5b5468'

/**
 * The editable list of options. Fully controlled by the parent apart from the
 * new-entry draft, which is local because nothing else cares about it.
 */
export default function RestaurantList({ items, onAdd, onToggleVeto, disabled }) {
  const [draft, setDraft] = useState('')

  const isFull = items.length >= MAX_RESTAURANTS
  const canSubmit = draft.trim().length > 0 && !isFull && !disabled

  const vetoCount = countVetoed(items)
  const limit = vetoLimit(items.length)
  const atLimit = vetoCount >= limit

  // Swatches mirror the wheel, so colours follow position among the *active*
  // options rather than position in the full list.
  const wheelIndexById = useMemo(() => {
    const byId = new Map()
    items
      .filter((item) => !item.vetoed)
      .forEach((item, index) => byId.set(item.id, index))
    return byId
  }, [items])

  const activeCount = wheelIndexById.size

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    onAdd(draft)
    setDraft('')
  }

  return (
    <section className={styles.panel} aria-labelledby="options-heading">
      <header className={styles.header}>
        <h2 id="options-heading" className={styles.heading}>The lineup</h2>
        <span className={styles.count}>{items.length}/{MAX_RESTAURANTS}</span>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.srOnly} htmlFor="new-restaurant">Add a restaurant</label>
        <input
          id="new-restaurant"
          className={styles.input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={isFull ? 'Wheel is full' : 'Add a spot…'}
          maxLength={MAX_NAME_LENGTH}
          disabled={disabled || isFull}
          autoComplete="off"
        />
        <button type="submit" className={styles.add} disabled={!canSubmit}>
          Add
        </button>
      </form>

      <div className={styles.vetoBar}>
        <span className={styles.vetoLabel}>Vetoes used</span>
        <span
          className={`${styles.vetoCount} ${atLimit && limit > 0 ? styles.vetoCountMaxed : ''}`}
          aria-live="polite"
        >
          {vetoCount} / {limit}
        </span>
      </div>

      {limit === 0 && items.length > 0 && (
        <p className={styles.vetoHint}>Add another spot to unlock vetoes.</p>
      )}

      {items.length === 0 ? (
        <p className={styles.empty}>Add a few places and the wheel fills up.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => {
            const wheelIndex = wheelIndexById.get(item.id)
            const allowed = canToggleVeto(items, item)

            return (
              <li key={item.id} className={`${styles.item} ${item.vetoed ? styles.itemVetoed : ''}`}>
                <span
                  className={styles.swatch}
                  style={{
                    backgroundColor: item.vetoed
                      ? VETOED_SWATCH
                      : sliceColor(wheelIndex, activeCount),
                  }}
                  aria-hidden="true"
                />
                <span className={styles.name}>{item.name}</span>
                {item.category && (
                  <span className={styles.categoryTag} title="Opens a second wheel">
                    2nd wheel
                  </span>
                )}
                <button
                  type="button"
                  className={`${styles.veto} ${item.vetoed ? styles.vetoActive : ''}`}
                  onClick={() => onToggleVeto(item.id)}
                  disabled={disabled || !allowed}
                  aria-pressed={item.vetoed}
                  aria-label={item.vetoed ? `Undo veto of ${item.name}` : `Veto ${item.name}`}
                  title={
                    !allowed && !item.vetoed
                      ? `Veto limit reached (${limit})`
                      : undefined
                  }
                >
                  Veto
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
