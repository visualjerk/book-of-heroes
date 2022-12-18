import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { derivedValuesDefinition } from './derived-values'

describe('Derived Values', () => {
  const { setupTest } = createTestSetup(derivedValuesDefinition)

  it.each([
    ['alb', 5],
    ['gnome', 3],
    ['human', 5],
    ['varg', 6],
    ['dwarf', 4],
  ] as const)('for race "%s" size class is %i', (race, sizeClass) => {
    const { expectState } = setupTest({
      race: race,
    })
    expectState({
      sizeClass: sizeClass,
    })
  })

  it.each([
    ['alb', 0, 6],
    ['alb', 2, 8],
    ['gnome', 0, 3],
    ['gnome', 4, 7],
    ['dwarf', 4, 7],
  ] as const)(
    'for race "%s" and agility %i speed is %i',
    (race, agility, speed) => {
      const { expectState } = setupTest({
        race: race,
        agility: agility,
      })
      expectState({
        speed: speed,
      })
    }
  )

  it('initiative is calculated correctly', () => {
    const { expectState } = setupTest({
      intuition: 7,
    })
    expectState({
      initiative: 3,
    })
  })

  it('health is calculated correctly', () => {
    const { expectState } = setupTest({
      constitution: 4,
      race: 'human',
    })
    expectState({
      healthPoints: 9,
    })
  })

  it('focus is calculated correctly', () => {
    const { expectState } = setupTest({
      mysticism: 4,
      willpower: 2,
    })
    expectState({
      focus: 12,
    })
  })

  it.each([
    ['defense', 'agility', 'strength'],
    ['mentalResistance', 'intellect', 'willpower'],
    ['physicalResistance', 'constitution', 'willpower'],
  ] as const)(
    '"%s" is calculated from "%s" and "%s"',
    (resistance, attribute1, attribute2) => {
      const { expectState } = setupTest({
        race: 'human',
        [attribute1]: 1,
        [attribute2]: 2,
      })
      expectState({
        [resistance]: 15,
      })
    }
  )

  describe.each(['defense', 'mentalResistance', 'physicalResistance'] as const)(
    'for "%s"',
    (resistance) => {
      it.each([
        [0, 0],
        [100, 2],
        [300, 4],
        [600, 6],
      ])('for used xp %i adds %i points', (usedXp, addedPoints) => {
        const { expectState } = setupTest({
          race: 'human',
          xpUsed: usedXp,
        })
        expectState({
          [resistance]: 12 + addedPoints,
        })
      })
    }
  )
})
