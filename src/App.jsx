import { useCallback, useMemo, useState } from 'react'
import CategoryEditorDialog from './components/CategoryEditorDialog.jsx'
import CategoryWheelDialog from './components/CategoryWheelDialog.jsx'
import PresetToggle from './components/PresetToggle.jsx'
import RestaurantList from './components/RestaurantList.jsx'
import Wheel from './components/Wheel.jsx'
import { useReducedMotion } from './hooks/useReducedMotion.js'
import { useWheelSpin } from './hooks/useWheelSpin.js'
import { categoryById } from './lib/categories.js'
import { DEFAULT_PRESET, PRESETS } from './lib/defaults.js'
import { createRestaurant, MAX_RESTAURANTS, toggleVeto } from './lib/restaurants.js'
import styles from './App.module.css'

const SPIN_MS = 4800
const REDUCED_SPIN_MS = 400

function buildRestaurants(presetId) {
  return PRESETS[presetId].restaurants.map(createRestaurant)
}

function buildCategoryLists(presetId) {
  return Object.fromEntries(
    Object.entries(PRESETS[presetId].categories).map(([id, names]) => [
      id,
      names.map(createRestaurant),
    ]),
  )
}

export default function App() {
  // Which set of starting lists the app was built from. Switching rebuilds
  // both wheels from that preset, discarding whatever is on them now.
  const [preset, setPreset] = useState(DEFAULT_PRESET)

  // Lazy initialiser: the starter list is only built on first render.
  const [restaurants, setRestaurants] = useState(() => buildRestaurants(DEFAULT_PRESET))

  // Each category's own options, owned here so edits outlive the dialog that
  // made them and the wheel that reads them.
  const [categoryLists, setCategoryLists] = useState(() => buildCategoryLists(DEFAULT_PRESET))
  const [editingCategory, setEditingCategory] = useState(null)

  // Whatever the category wheel last landed on, plus whether the user has
  // dismissed it for this spin. Re-armed on every spin, so landing on the
  // same category twice running opens the dialog both times.
  const [categoryPick, setCategoryPick] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  // Vetoed spots stay in the list but drop off the wheel.
  const activeRestaurants = useMemo(
    () => restaurants.filter((restaurant) => !restaurant.vetoed),
    [restaurants],
  )

  const prefersReducedMotion = useReducedMotion()
  const spinDuration = prefersReducedMotion ? REDUCED_SPIN_MS : SPIN_MS

  const { rotation, isSpinning, winner, spin, clearWinner } = useWheelSpin(
    activeRestaurants,
    spinDuration,
  )

  const winnerCategory = winner?.category ? categoryById(winner.category) : null

  // Landing on a category settles nothing on its own, so the round is handed
  // to that category's wheel. Derived rather than stored, so there is no
  // effect racing the spin to open it.
  const openCategory = winnerCategory && !dismissed ? winnerCategory : null

  const resetResult = useCallback(() => {
    clearWinner()
    setCategoryPick(null)
    setDismissed(false)
  }, [clearWinner])

  const handleSpin = useCallback(() => {
    setCategoryPick(null)
    setDismissed(false)
    spin()
  }, [spin])

  const handleAdd = useCallback(
    (name) => {
      setRestaurants((previous) =>
        previous.length >= MAX_RESTAURANTS ? previous : [...previous, createRestaurant(name)],
      )
      resetResult()
    },
    [resetResult],
  )

  const handleToggleVeto = useCallback(
    (id) => {
      // toggleVeto re-checks the cap against the state being updated, rather
      // than whatever the click handler happened to close over.
      setRestaurants((previous) => toggleVeto(previous, id))
      resetResult()
    },
    [resetResult],
  )

  const handleCategoryClose = useCallback(() => setDismissed(true), [])

  // Re-selecting the current preset is a no-op: it would otherwise discard
  // the list you are looking at for an identical one.
  const handlePresetChange = useCallback(
    (next) => {
      if (next === preset) return
      setPreset(next)
      setRestaurants(buildRestaurants(next))
      setCategoryLists(buildCategoryLists(next))
      setEditingCategory(null)
      resetResult()
    },
    [preset, resetResult],
  )

  const handleEditCategory = useCallback((categoryId) => {
    setEditingCategory(categoryById(categoryId))
  }, [])

  const handleCloseEditor = useCallback(() => setEditingCategory(null), [])

  // Editing the options invalidates whatever that wheel last landed on, so the
  // round is reset the same way adding or vetoing a restaurant resets it.
  const handleCategoryListChange = useCallback(
    (categoryId, next) => {
      setCategoryLists((previous) => ({ ...previous, [categoryId]: next }))
      resetResult()
    },
    [resetResult],
  )

  // A category's own pick supersedes the category itself as the answer.
  const announced = categoryPick ?? winner
  const via = categoryPick ? winnerCategory : null
  // Offered whenever a category round has been dismissed — including after a
  // pick, so the pizza wheel can be re-rolled without respinning the main one.
  const canReopen = winnerCategory && dismissed

  return (
    <div className={styles.app}>
      <header className={styles.masthead}>
        <div className={styles.presetBar}>
          <PresetToggle value={preset} onChange={handlePresetChange} disabled={isSpinning} />
        </div>
        <h1 className={styles.title}>Where We Eatin</h1>
        <p className={styles.tagline}>Let the wheel settle the argument.</p>
      </header>

      <main className={styles.layout}>
        <aside className={styles.sidebar}>
          <RestaurantList
            items={restaurants}
            onAdd={handleAdd}
            onToggleVeto={handleToggleVeto}
            onEditCategory={handleEditCategory}
            disabled={isSpinning}
          />
        </aside>

        <section className={styles.stage}>
          <Wheel
            items={activeRestaurants}
            rotation={rotation}
            durationMs={spinDuration}
            isSpinning={isSpinning}
          />

          <button
            type="button"
            className={styles.spinButton}
            onClick={handleSpin}
            disabled={isSpinning || activeRestaurants.length === 0}
          >
            Where we eating?
          </button>

          <p className={styles.result} role="status" aria-live="polite">
            {announced ? (
              <>
                <span className={styles.resultLabel}>Tonight it's</span>
                <span className={styles.resultName}>{announced.name}</span>
                {via && (
                  <span className={styles.resultVia}>from the {via.name.toLowerCase()} wheel</span>
                )}
              </>
            ) : (
              <span className={styles.resultHint}>
                {restaurants.length === 0 ? 'Add a spot to get started.' : ' '}
              </span>
            )}
          </p>

          {canReopen && (
            <button
              type="button"
              className={styles.reopen}
              onClick={() => setDismissed(false)}
            >
              {categoryPick ? 'Re-roll the' : 'Back to the'}{' '}
              {winnerCategory.name.toLowerCase()} wheel
            </button>
          )}
        </section>
      </main>

      {openCategory && (
        <CategoryWheelDialog
          category={openCategory}
          items={categoryLists[openCategory.id] ?? []}
          onClose={handleCategoryClose}
          onSettled={setCategoryPick}
        />
      )}

      {editingCategory && (
        <CategoryEditorDialog
          category={editingCategory}
          items={categoryLists[editingCategory.id] ?? []}
          onChange={(next) => handleCategoryListChange(editingCategory.id, next)}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  )
}
