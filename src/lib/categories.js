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
    "Mikey's Slice",
    "Adriatico's",
    'Yellow Brick',
    "Massey's",
    "Rubino's",
    "Dewey's",
    'Donatos',
  ],
}

const CATEGORIES = [PIZZA]

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
