import { useCallback, useMemo, useState } from 'react'
import RestaurantList from './components/RestaurantList.jsx'
import Wheel from './components/Wheel.jsx'
import { useReducedMotion } from './hooks/useReducedMotion.js'
import { useWheelSpin } from './hooks/useWheelSpin.js'
import { createRestaurant, MAX_RESTAURANTS, toggleVeto } from './lib/restaurants.js'
import styles from './App.module.css'

const STARTER_NAMES = [
  'Northstar',
  'Cap City',
  'Harvest Pizza',
  'Third & Hollywood',
  'El Vaquero',
  'Kitchen Social',
  'Cook',
]

const SPIN_MS = 4800
const REDUCED_SPIN_MS = 400

export default function App() {
  // Lazy initialiser: the starter list is only built on first render.
  const [restaurants, setRestaurants] = useState(() => STARTER_NAMES.map(createRestaurant))

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

  const handleAdd = useCallback(
    (name) => {
      setRestaurants((previous) =>
        previous.length >= MAX_RESTAURANTS ? previous : [...previous, createRestaurant(name)],
      )
      clearWinner()
    },
    [clearWinner],
  )

  const handleToggleVeto = useCallback(
    (id) => {
      // toggleVeto re-checks the cap against the state being updated, rather
      // than whatever the click handler happened to close over.
      setRestaurants((previous) => toggleVeto(previous, id))
      clearWinner()
    },
    [clearWinner],
  )

  return (
    <div className={styles.app}>
      <header className={styles.masthead}>
        <h1 className={styles.title}>Where We Eatin</h1>
        <p className={styles.tagline}>Let the wheel settle the argument.</p>
      </header>

      <main className={styles.layout}>
        <aside className={styles.sidebar}>
          <RestaurantList
            items={restaurants}
            onAdd={handleAdd}
            onToggleVeto={handleToggleVeto}
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
            onClick={spin}
            disabled={isSpinning || activeRestaurants.length === 0}
          >
            Where we eating?
          </button>

          <p className={styles.result} role="status" aria-live="polite">
            {winner ? (
              <>
                <span className={styles.resultLabel}>Tonight it's</span>
                <span className={styles.resultName}>{winner.name}</span>
              </>
            ) : (
              <span className={styles.resultHint}>
                {restaurants.length === 0 ? 'Add a spot to get started.' : ' '}
              </span>
            )}
          </p>
        </section>
      </main>
    </div>
  )
}
