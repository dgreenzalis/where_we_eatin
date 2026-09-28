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

/* -------------------------------------------------------------------------
 * Pizza face
 *
 * Toppings are scattered, but they must not move between renders — the wheel
 * re-renders on every rotation change, and pepperoni that jumped around mid
 * spin would look broken. So positions come from a seeded generator keyed on
 * the slice, never from Math.random.
 * ---------------------------------------------------------------------- */

/** Small deterministic PRNG (an LCG); same seed always gives the same run. */
function seededRandom(seed) {
  let state = (Math.imul(seed, 2654435761) >>> 0) || 1
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** The cheese stops short of the rim so a crust ring shows around it. */
export const CRUST_RATIO = 0.86

/**
 * Where pepperoni sit inside one slice, as {angle, radius} fractions.
 *
 * The first two flank the label rather than sitting under it; the third tucks
 * in near the hub where the label has already ended.
 */
const PEPPERONI_SLOTS = [
  { angle: 0.23, radius: 0.74 },
  { angle: 0.77, radius: 0.58 },
  { angle: 0.5, radius: 0.31 },
]

/** Thin slices get fewer toppings, or they spill over the cut lines. */
function pepperoniCount(count) {
  if (count <= 8) return 3
  if (count <= 14) return 2
  return 1
}

/** Pepperoni shrink with the slices for the same reason. */
export function pepperoniRadius(count, radius) {
  const scale = count <= 8 ? 0.075 : count <= 14 ? 0.055 : 0.042
  return radius * scale
}

/**
 * Pepperoni centres for one slice, in SVG coordinates.
 *
 * @returns {Array<{x: number, y: number}>}
 */
export function pepperoniForSlice(index, count, cx, cy, radius) {
  const segment = segmentAngle(count)
  const cheeseRadius = radius * CRUST_RATIO
  const random = seededRandom(index * 97 + count * 31 + 7)

  return PEPPERONI_SLOTS.slice(0, pepperoniCount(count)).map((slot) => {
    // Jitter keeps the pie from looking stamped out, without letting a
    // topping drift into a neighbouring slice.
    const angleFraction = slot.angle + (random() - 0.5) * 0.08
    const radiusFraction = slot.radius + (random() - 0.5) * 0.1
    const angle = (index + angleFraction) * segment

    return polarToCartesian(cx, cy, cheeseRadius * radiusFraction, angle)
  })
}

/** Charred bubbles dotted around the crust; fixed, so they never move. */
export function crustSpots(cx, cy, radius, howMany = 11) {
  const random = seededRandom(20260928)
  const cheeseRadius = radius * CRUST_RATIO
  const bandCentre = (radius + cheeseRadius) / 2
  const bandWidth = (radius - cheeseRadius) * 0.5

  return Array.from({ length: howMany }, (_, index) => {
    const angle = (index / howMany) * FULL_CIRCLE + (random() - 0.5) * 18
    const distance = bandCentre + (random() - 0.5) * bandWidth
    const point = polarToCartesian(cx, cy, distance, angle)
    return { ...point, r: radius * (0.016 + random() * 0.016) }
  })
}
