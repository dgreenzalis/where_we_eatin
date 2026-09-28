/**
 * Pure geometry + colour helpers for the wheel.
 *
 * Angles here are measured in degrees, clockwise, starting at 12 o'clock
 * (where the pointer sits). Keeping this maths outside of React makes it
 * trivial to reason about and to unit test.
 */

export const FULL_CIRCLE = 360

/** Colours are deep enough that white labels stay legible on every slice. */
const PALETTE = ['#d13b40', '#d9722a', '#a8871f', '#3d8f56', '#2b7f9e', '#6a58ab']

/** Degrees covered by a single slice. */
export function segmentAngle(count) {
  return FULL_CIRCLE / count
}

/** Colour for a slice, guaranteeing neighbouring slices never match. */
export function sliceColor(index, count) {
  const color = PALETTE[index % PALETTE.length]
  const wrapsOntoFirstColor = index === count - 1 && index % PALETTE.length === 0
  return wrapsOntoFirstColor && count > 1 ? PALETTE[1] : color
}

/** Convert a clockwise-from-top angle into SVG coordinates. */
export function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  }
}

/** SVG path description for one pie slice. */
export function slicePath(index, count, cx, cy, radius) {
  const segment = segmentAngle(count)
  const start = polarToCartesian(cx, cy, radius, index * segment)
  const end = polarToCartesian(cx, cy, radius, (index + 1) * segment)
  const largeArc = segment > 180 ? 1 : 0

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

/**
 * Rotation (in SVG degrees, 0 = pointing right) that lays a label flat along
 * the middle of its slice.
 */
export function labelRotation(index, count) {
  const middle = (index + 0.5) * segmentAngle(count) - 90
  return ((middle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE
}

/** Labels on the left half would read upside down, so they get flipped. */
export function isLabelFlipped(index, count) {
  const rotation = labelRotation(index, count)
  return rotation > 90 && rotation < 270
}

/**
 * Absolute rotation to animate to so that `index` finishes under the pointer.
 *
 * Always moves forwards (clockwise) from the current rotation, and lands a
 * little off-centre so repeat wins don't look mechanically identical.
 */
export function nextRotation(currentRotation, index, count, { turns = 5, random = Math.random } = {}) {
  const segment = segmentAngle(count)
  const jitter = (random() - 0.5) * segment * 0.7
  const sliceCenter = (index + 0.5) * segment + jitter

  const target = ((FULL_CIRCLE - sliceCenter) % FULL_CIRCLE + FULL_CIRCLE) % FULL_CIRCLE
  const current = ((currentRotation % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE
  const delta = (target - current + FULL_CIRCLE) % FULL_CIRCLE

  return currentRotation + turns * FULL_CIRCLE + delta
}
