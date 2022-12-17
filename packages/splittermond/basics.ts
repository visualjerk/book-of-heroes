import { defineCharacter } from '@boh/character'

export const basisDefinition = defineCharacter(
  {
    name: { type: 'text' },
    rasse: {
      type: 'single-select',
      options: ['alb', 'gnom', 'mensch', 'varg', 'zwerg'] as const,
    },
    erfahrungspunkte: { type: 'number' },
    erfahrungspunkteEingesetzt: { type: 'number' },
    heldengrad: { type: 'single-select', options: [1, 2, 3, 4] as const },
    splitterpunkte: { type: 'number' },
  },
  {
    basis: [
      'name',
      'rasse',
      'erfahrungspunkte',
      'erfahrungspunkteEingesetzt',
      'heldengrad',
      'splitterpunkte',
    ],
  },
  {
    heldengrad: ({ attributes }) => {
      if (attributes.erfahrungspunkteEingesetzt < 100) {
        return 1
      }

      if (attributes.erfahrungspunkteEingesetzt < 300) {
        return 2
      }

      if (attributes.erfahrungspunkteEingesetzt < 600) {
        return 3
      }

      return 4
    },
    splitterpunkte: ({ attributes }) => {
      return 2 + attributes.heldengrad
    },
  },
  {
    erfahrungspunkteHinzufuegen: {
      menge: 'number',
    },
    nameSetzen: {
      name: 'name.value',
    },
    rasseSetzen: {
      rasse: 'rasse.value',
    },
  },
  {
    erfahrungspunkteHinzufuegen: {
      apply({ mutate }, { menge }) {
        mutate('erfahrungspunkte', {
          type: 'add',
          amount: menge,
        })
      },
    },
    nameSetzen: {
      apply({ mutate }, { name }) {
        mutate('name', { value: name })
      },
    },
    rasseSetzen: {
      apply({ mutate }, { rasse }) {
        mutate('rasse', {
          option: rasse,
        })
      },
    },
  }
)
