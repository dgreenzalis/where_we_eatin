/**
 * The starting lineups, one per preset.
 *
 * This file is the one place to edit to reshape what the app opens with —
 * everything here is plain names, deliberately free of any logic.
 *
 * `restaurants` seeds the main wheel. A name that matches a category (see
 * categories.js) becomes a category entry there rather than a place, so
 * "Pizza" in that list is what puts the pizza wheel within reach.
 *
 * `categories` seeds each category's own wheel, keyed by category id.
 */

export const PRESETS = {
  D: {
    id: 'D',
    restaurants: [
      'Northstar',
      'Cap City',
      'Pizza',
      'Third & Hollywood',
      'El Vaquero',
      'Kitchen Social',
      'Cook',
    ],
    categories: {
      pizza: ['Harvest Pizza', "Grandad's", 'Pizza House', "Mama Mimi's"],
    },
  },

  R: {
    id: 'R',
    restaurants: [
      'Cap City',
      'El Vaquero',
      'Rusty Bucket',
      'Roosters',
      'Harvest',
    ],
    categories: {
      pizza: ['Papa Johns', 'Brenz'],
    },
  },
}

/** The set the app opens with. */
export const DEFAULT_PRESET = 'D'

/** Toggle order, so adding a preset above is all it takes to offer it. */
export const PRESET_IDS = Object.keys(PRESETS)
