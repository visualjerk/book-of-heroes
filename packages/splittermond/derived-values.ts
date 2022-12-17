import { attributeSteigernDefinition } from './attributes/increase-attributes'

export const abgeleiteteWerteDefinition = attributeSteigernDefinition.enhance(
  {
    groessenklasse: {
      type: 'single-select',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const,
    },
    geschwindigkeit: { type: 'number' },
    initiative: { type: 'number' },
    lebenspunkte: { type: 'number' },
    fokus: { type: 'number' },

    // Widerstandswerte
    verteidigung: { type: 'number' },
    geistigerWiderstand: { type: 'number' },
    koerperlicherWiderstand: { type: 'number' },
  },
  {
    abgeleiteteWerte: [
      'groessenklasse',
      'geschwindigkeit',
      'initiative',
      'lebenspunkte',
      'fokus',
      'verteidigung',
      'geistigerWiderstand',
      'koerperlicherWiderstand',
    ],
    widerstandsWerte: [
      'verteidigung',
      'geistigerWiderstand',
      'koerperlicherWiderstand',
    ],
  },
  {
    groessenklasse: ({ attributes }) => {
      switch (attributes.rasse) {
        case 'alb':
          return 5
        case 'gnom':
          return 3
        case 'mensch':
          return 5
        case 'varg':
          return 6
        case 'zwerg':
          return 4
      }
    },
    geschwindigkeit: ({ attributes }) => {
      return attributes.agility + attributes.groessenklasse
    },
    initiative: ({ attributes }) => {
      return 10 - attributes.intuition
    },
    lebenspunkte: ({ attributes }) => {
      return attributes.constitution + attributes.groessenklasse
    },
    fokus: ({ attributes }) => {
      return (attributes.mysticism + attributes.willpower) * 2
    },

    // Widerstandswerte
    verteidigung: ({ attributes }) => {
      return (
        12 +
        attributes.agility +
        attributes.strength +
        (attributes.heldengrad - 1) * 2
      )
    },
    geistigerWiderstand: ({ attributes }) => {
      return (
        12 +
        attributes.intellect +
        attributes.willpower +
        (attributes.heldengrad - 1) * 2
      )
    },
    koerperlicherWiderstand: ({ attributes }) => {
      return (
        12 +
        attributes.constitution +
        attributes.willpower +
        (attributes.heldengrad - 1) * 2
      )
    },
  },
  {},
  {}
)
