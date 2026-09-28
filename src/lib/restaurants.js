export const MAX_RESTAURANTS = 20
export const MAX_NAME_LENGTH = 32

let fallbackId = 0

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  fallbackId += 1
  return `restaurant-${fallbackId}`
}

/**
 * Restaurants carry a stable id so React keys survive reordering, and so two
 * spots with the same name stay distinct.
 */
export function createRestaurant(name) {
  return { id: createId(), name: name.trim().slice(0, MAX_NAME_LENGTH), vetoed: false }
}

/**
 * At most half the list can be vetoed, rounded down — so there is always at
 * least one option left on the wheel.
 */
export function vetoLimit(total) {
  return Math.floor(total / 2)
}

export function countVetoed(restaurants) {
  return restaurants.reduce((total, restaurant) => (restaurant.vetoed ? total + 1 : total), 0)
}

/** Whether `restaurant` can be toggled right now, given the rest of the list. */
export function canToggleVeto(restaurants, restaurant) {
  if (restaurant.vetoed) return true // undoing is always allowed
  return countVetoed(restaurants) < vetoLimit(restaurants.length)
}

/**
 * Toggle one restaurant's veto, returning the original array unchanged when
 * the cap would be exceeded. Pure, so it can be handed straight to a
 * functional state update.
 */
export function toggleVeto(restaurants, id) {
  const target = restaurants.find((restaurant) => restaurant.id === id)
  if (!target || !canToggleVeto(restaurants, target)) return restaurants

  return restaurants.map((restaurant) =>
    restaurant.id === id ? { ...restaurant, vetoed: !restaurant.vetoed } : restaurant,
  )
}
