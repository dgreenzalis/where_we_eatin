/**
 * Some entries on the wheel are a kind of food rather than a specific spot.
 * Landing on one settles nothing on its own, so it opens a second wheel to
 * answer the follow-up question.
 *
 * A category is only its identity and presentation here; the options behind
 * it are seeded per preset in defaults.js and then owned by the app, since
 * they are editable at runtime.
 */

export const PIZZA = {
  id: 'pizza',
  name: 'Pizza',
  /** Shown as the dialog's heading once the main wheel has landed. */
  prompt: 'Pizza it is.',
  question: 'Now whose?',
  /** Picks the pizza-pie face in Wheel rather than the coloured slices. */
  variant: 'pizza',
}

const CATEGORIES = [PIZZA]

/** A wheel needs a real choice, so a category's list can't shrink past this. */
export const MIN_CATEGORY_OPTIONS = 2


/**
 * Categories are matched on name, so a hand-typed "pizza" opens the second
 * wheel just like the starter entry does.
 */
export function categoryForName(name) {
  const normalized = name.trim().toLowerCase()
  return CATEGORIES.find((category) => category.id === normalized) ?? null
}

export function categoryById(id) {
  return CATEGORIES.find((category) => category.id === id) ?? null
}
