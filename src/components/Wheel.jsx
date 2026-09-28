import { useId } from 'react'
import {
  CRUST_RATIO,
  crustSpots,
  isLabelFlipped,
  labelRotation,
  pepperoniForSlice,
  pepperoniRadius,
  sliceColor,
  slicePath,
} from '../lib/wheel.js'
import styles from './Wheel.module.css'

const SIZE = 400
const CENTER = SIZE / 2
const RADIUS = CENTER - 6

/** Two close cheese tones: enough to tell slices apart, not enough to stripe. */
const CHEESE = ['#f0bf5a', '#e7b046']

/** Labels are laid out to the right of centre, then rotated into their slice. */
function labelX(variant) {
  return variant === 'pizza' ? CENTER + RADIUS * CRUST_RATIO - 14 : CENTER + RADIUS - 16
}

/** Pizza labels stop at the cheese, so they have a little less room. */
function labelFontSize(count, variant) {
  const base = count <= 6 ? 17 : count <= 10 ? 15 : count <= 14 ? 13 : 11
  return variant === 'pizza' ? base - 1 : base
}

/** Kept short enough that a label never runs into the hub. */
function labelMaxChars(count, variant) {
  const base = count <= 10 ? 15 : count <= 14 ? 14 : 12
  return variant === 'pizza' ? base - 2 : base
}

function truncate(name, maxChars) {
  return name.length > maxChars ? `${name.slice(0, maxChars - 1).trimEnd()}…` : name
}

function faceRadius(variant) {
  return variant === 'pizza' ? RADIUS * CRUST_RATIO : RADIUS
}

function SliceFace({ index, count, variant }) {
  const radius = faceRadius(variant)
  const fill = variant === 'pizza' ? CHEESE[index % CHEESE.length] : sliceColor(index, count)

  if (count === 1) {
    return <circle cx={CENTER} cy={CENTER} r={radius} fill={fill} />
  }

  return (
    <path
      d={slicePath(index, count, CENTER, CENTER, radius)}
      fill={fill}
      className={variant === 'pizza' ? styles.cut : undefined}
    />
  )
}

function Label({ item, index, count, variant, fontSize, maxChars }) {
  const flipped = isLabelFlipped(index, count)
  const rotation = labelRotation(index, count)
  const x = labelX(variant)
  const transform = flipped
    ? `rotate(${rotation} ${CENTER} ${CENTER}) rotate(180 ${x} ${CENTER})`
    : `rotate(${rotation} ${CENTER} ${CENTER})`

  return (
    <text
      className={`${styles.label} ${variant === 'pizza' ? styles.labelPizza : ''}`}
      x={x}
      y={CENTER}
      fontSize={fontSize}
      textAnchor={flipped ? 'start' : 'end'}
      dominantBaseline="middle"
      transform={transform}
    >
      {truncate(item.name, maxChars)}
    </text>
  )
}

/** Crust, char bubbles and pepperoni — everything that makes it read as a pie. */
function PizzaToppings({ count, bakeId }) {
  const pepRadius = pepperoniRadius(count, RADIUS)

  return (
    <>
      {Array.from({ length: count }, (_, index) =>
        pepperoniForSlice(index, count, CENTER, CENTER, RADIUS).map((point, slot) => (
          <circle
            // eslint-disable-next-line react/no-array-index-key -- positions are fixed per slice
            key={`${index}-${slot}`}
            className={styles.pepperoni}
            cx={point.x}
            cy={point.y}
            r={pepRadius}
          />
        )),
      )}

      {/* Oven shading, laid over the toppings but under the labels. */}
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={`url(#${bakeId})`} />

      {crustSpots(CENTER, CENTER, RADIUS).map((spot, index) => (
        // eslint-disable-next-line react/no-array-index-key -- fixed, generated once
        <circle key={index} className={styles.char} cx={spot.x} cy={spot.y} r={spot.r} />
      ))}
    </>
  )
}

/**
 * The spinning wheel. Presentational only — rotation is handed down so the
 * animation stays a pure function of state.
 *
 * `variant` picks the face: the default coloured slices, or a pizza pie.
 */
export default function Wheel({ items, rotation, durationMs, isSpinning, variant = 'classic' }) {
  const count = items.length
  const isPizza = variant === 'pizza'
  const fontSize = labelFontSize(count, variant)
  const maxChars = labelMaxChars(count, variant)

  // Two wheels can be on screen at once, so gradient ids have to be unique.
  const uid = useId().replace(/:/g, '')
  const crustId = `crust-${uid}`
  const bakeId = `bake-${uid}`

  const label = isPizza ? `Pizza wheel with ${count} options` : `Wheel with ${count} options`

  return (
    <div className={styles.stage}>
      <div className={`${styles.pointer} ${isPizza ? styles.pointerPizza : ''}`} aria-hidden="true" />

      <svg
        className={styles.wheel}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={count > 0 ? label : 'Empty wheel'}
        style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${durationMs}ms` }}
      >
        {isPizza && (
          <defs>
            <radialGradient id={crustId}>
              <stop offset="78%" stopColor="#d99845" />
              <stop offset="100%" stopColor="#b26f2c" />
            </radialGradient>
            <radialGradient id={bakeId}>
              <stop offset="55%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#7a3f10" stopOpacity="0.28" />
            </radialGradient>
          </defs>
        )}

        {isPizza ? (
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={`url(#${crustId})`} />
        ) : (
          <circle className={styles.rim} cx={CENTER} cy={CENTER} r={CENTER - 3} />
        )}

        {count === 0 ? (
          <circle cx={CENTER} cy={CENTER} r={faceRadius(variant)} className={styles.emptyFace} />
        ) : (
          <>
            {items.map((item, index) => (
              <SliceFace key={item.id} index={index} count={count} variant={variant} />
            ))}

            {isPizza && <PizzaToppings count={count} bakeId={bakeId} />}

            {items.map((item, index) => (
              <Label
                key={item.id}
                item={item}
                index={index}
                count={count}
                variant={variant}
                fontSize={fontSize}
                maxChars={maxChars}
              />
            ))}
          </>
        )}
      </svg>

      <div
        className={`${styles.hub} ${isPizza ? styles.hubPizza : ''} ${isSpinning ? styles.hubSpinning : ''}`}
        aria-hidden="true"
      >
        {count === 0 ? '·' : isPizza ? '🍕' : '?'}
      </div>
    </div>
  )
}
