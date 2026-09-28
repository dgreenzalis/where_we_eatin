import { isLabelFlipped, labelRotation, sliceColor, slicePath } from '../lib/wheel.js'
import styles from './Wheel.module.css'

const SIZE = 400
const CENTER = SIZE / 2
const RADIUS = CENTER - 6
/** Labels are laid out to the right of centre, then rotated into their slice. */
const LABEL_X = CENTER + RADIUS - 16

/** Labels shrink as slices get thinner. */
function labelFontSize(count) {
  if (count <= 6) return 17
  if (count <= 10) return 15
  if (count <= 14) return 13
  return 11
}

/** Kept short enough that a label never runs into the hub. */
function labelMaxChars(count) {
  if (count <= 10) return 15
  if (count <= 14) return 14
  return 12
}

function truncate(name, maxChars) {
  return name.length > maxChars ? `${name.slice(0, maxChars - 1).trimEnd()}…` : name
}

function Slice({ item, index, count, fontSize, maxChars }) {
  const flipped = isLabelFlipped(index, count)
  const rotation = labelRotation(index, count)
  const transform = flipped
    ? `rotate(${rotation} ${CENTER} ${CENTER}) rotate(180 ${LABEL_X} ${CENTER})`
    : `rotate(${rotation} ${CENTER} ${CENTER})`

  return (
    <g>
      {count === 1 ? (
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill={sliceColor(index, count)} />
      ) : (
        <path d={slicePath(index, count, CENTER, CENTER, RADIUS)} fill={sliceColor(index, count)} />
      )}
      <text
        className={styles.label}
        x={LABEL_X}
        y={CENTER}
        fontSize={fontSize}
        textAnchor={flipped ? 'start' : 'end'}
        dominantBaseline="middle"
        transform={transform}
      >
        {truncate(item.name, maxChars)}
      </text>
    </g>
  )
}

/**
 * The spinning wheel. Presentational only — rotation is handed down so the
 * animation stays a pure function of state.
 */
export default function Wheel({ items, rotation, durationMs, isSpinning }) {
  const count = items.length
  const fontSize = labelFontSize(count)
  const maxChars = labelMaxChars(count)

  return (
    <div className={styles.stage}>
      <div className={styles.pointer} aria-hidden="true" />

      <svg
        className={styles.wheel}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={count > 0 ? `Wheel with ${count} options` : 'Empty wheel'}
        style={{ transform: `rotate(${rotation}deg)`, transitionDuration: `${durationMs}ms` }}
      >
        <circle className={styles.rim} cx={CENTER} cy={CENTER} r={CENTER - 3} />

        {count === 0 ? (
          <circle cx={CENTER} cy={CENTER} r={RADIUS} className={styles.emptyFace} />
        ) : (
          items.map((item, index) => (
            <Slice
              key={item.id}
              item={item}
              index={index}
              count={count}
              fontSize={fontSize}
              maxChars={maxChars}
            />
          ))
        )}
      </svg>

      <div className={`${styles.hub} ${isSpinning ? styles.hubSpinning : ''}`} aria-hidden="true">
        {count === 0 ? '·' : '?'}
      </div>
    </div>
  )
}
