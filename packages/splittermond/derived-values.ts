import { increaseAttributesDefinition } from './attributes/increase-attributes'

export const derivedValuesDefinition = increaseAttributesDefinition.enhance(
  {
    sizeClass: {
      type: 'single-select',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const,
    },
    speed: { type: 'number' },
    initiative: { type: 'number' },
    healthPoints: { type: 'number' },
    focus: { type: 'number' },

    // Resistances
    defense: { type: 'number' },
    mentalResistance: { type: 'number' },
    physicalResistance: { type: 'number' },
  },
  {
    derivedValues: [
      'sizeClass',
      'speed',
      'initiative',
      'healthPoints',
      'focus',
      'defense',
      'mentalResistance',
      'physicalResistance',
    ],
    resistances: ['defense', 'mentalResistance', 'physicalResistance'],
  },
  {
    sizeClass: ({ attributes }) => {
      switch (attributes.race) {
        case 'alb':
          return 5
        case 'gnome':
          return 3
        case 'human':
          return 5
        case 'varg':
          return 6
        case 'dwarf':
          return 4
      }
    },
    speed: ({ attributes }) => {
      return attributes.agility + attributes.sizeClass
    },
    initiative: ({ attributes }) => {
      return 10 - attributes.intuition
    },
    healthPoints: ({ attributes }) => {
      return attributes.constitution + attributes.sizeClass
    },
    focus: ({ attributes }) => {
      return (attributes.mysticism + attributes.willpower) * 2
    },

    // Resistances
    defense: ({ attributes }) => {
      return (
        12 +
        attributes.agility +
        attributes.strength +
        (attributes.heroLevel - 1) * 2
      )
    },
    mentalResistance: ({ attributes }) => {
      return (
        12 +
        attributes.intellect +
        attributes.willpower +
        (attributes.heroLevel - 1) * 2
      )
    },
    physicalResistance: ({ attributes }) => {
      return (
        12 +
        attributes.constitution +
        attributes.willpower +
        (attributes.heroLevel - 1) * 2
      )
    },
  },
  {},
  {}
)
