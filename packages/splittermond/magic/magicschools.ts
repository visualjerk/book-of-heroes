export const magicschools = [
  'ban',
  'control',
  'movement',
  'realization',
  'stone',
  'fire',
  'healing',
  'illusion',
  'battle',
  'light',
  'nature',
  'shadow',
  'fate',
  'protection',
  'staerkung',
  'death',
  'transformation',
  'water',
  'wind',
] as const
export type Magicschool = typeof magicschools[number]
