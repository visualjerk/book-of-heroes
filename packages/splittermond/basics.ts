import { defineCharacter } from '@boh/character'

export const basicsDefinition = defineCharacter(
  {
    name: { type: 'text' },
    race: {
      type: 'single-select',
      options: ['alb', 'gnome', 'human', 'varg', 'dwarf'] as const,
    },
    xp: { type: 'number' },
    xpUsed: { type: 'number' },
    heroLevel: { type: 'single-select', options: [1, 2, 3, 4] as const },
    splinterPoints: { type: 'number' },
  },
  {
    basics: ['name', 'race', 'xp', 'xpUsed', 'heroLevel', 'splinterPoints'],
  },
  {
    heroLevel: ({ attributes }) => {
      if (attributes.xpUsed < 100) {
        return 1
      }

      if (attributes.xpUsed < 300) {
        return 2
      }

      if (attributes.xpUsed < 600) {
        return 3
      }

      return 4
    },
    splinterPoints: ({ attributes }) => {
      return 2 + attributes.heroLevel
    },
  },
  {
    addXp: {
      amount: 'number',
    },
    setName: {
      name: 'name.value',
    },
    setRace: {
      race: 'race.value',
    },
  },
  {
    addXp: {
      apply({ mutate }, { amount }) {
        mutate('xp', {
          type: 'add',
          amount,
        })
      },
    },
    setName: {
      apply({ mutate }, { name }) {
        mutate('name', { value: name })
      },
    },
    setRace: {
      apply({ mutate }, { race }) {
        mutate('race', {
          option: race,
        })
      },
    },
  }
)
