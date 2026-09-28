/**
 * Some entries on the wheel are a kind of food rather than a specific spot.
 * Landing on one settles nothing on its own, so it opens a second wheel to
 * answer the follow-up question.
 *
 * A category's `options` are plain names; they become ordinary restaurants on
 * the second wheel, which is what keeps the nesting one level deep — nothing
 * in here matches a category name, so a sub-wheel can never open a third.
 */

export const PIZZA = {
  id: 'pizza',
  name: 'Pizza',
  /** Shown as the dialog's heading once the main wheel has landed. */
  prompt: 'Pizza it is.',
  question: 'Now whose?',
  /** Picks the pizza-pie face in Wheel rather than the coloured slices. */
  variant: 'pizza',
  options: [
    'Harvest Pizza',
    "Grandad's",
    "Pizza House",
    "Mama Mimi's",
  ],
}

const CATEGORIES = [PIZZA]

/** A wheel needs a real choice, so a category's list can't shrink past this. */
export const MIN_CATEGORY_OPTIONS = 2

/**
 * The starting options for every category, by id. Names rather than
 * restaurants: building those needs createRestaurant, and restaurants.js
 * already imports this module.
 */
export function defaultCategoryLists() {
  return Object.fromEntries(CATEGORIES.map((category) => [category.id, category.options]))
}

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
