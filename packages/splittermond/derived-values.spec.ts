import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { abgeleiteteWerteDefinition } from './derived-values'

describe('AbgeleiteteWerte', () => {
  const { setupTest } = createTestSetup(abgeleiteteWerteDefinition)

  it.each([
    ['alb', 5],
    ['gnom', 3],
    ['mensch', 5],
    ['varg', 6],
    ['zwerg', 4],
  ] as const)('for race "%s" size class is %i', (race, sizeClass) => {
    const { expectState } = setupTest({
      rasse: race,
    })
    expectState({
      groessenklasse: sizeClass,
    })
  })

  it.each([
    ['alb', 0, 6],
    ['alb', 2, 8],
    ['gnom', 0, 3],
    ['gnom', 4, 7],
    ['zwerg', 4, 7],
  ] as const)(
    'for race "%s" and agility %i speed is %i',
    (race, agility, speed) => {
      const { expectState } = setupTest({
        rasse: race,
        beweglichkeit: agility,
      })
      expectState({
        geschwindigkeit: speed,
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
      konstitution: 4,
      rasse: 'mensch',
    })
    expectState({
      lebenspunkte: 9,
    })
  })

  it('focus is calculated correctly', () => {
    const { expectState } = setupTest({
      mystik: 4,
      willenskraft: 2,
    })
    expectState({
      fokus: 12,
    })
  })

  it.each([
    ['verteidigung', 'beweglichkeit', 'staerke'],
    ['geistigerWiderstand', 'verstand', 'willenskraft'],
    ['koerperlicherWiderstand', 'konstitution', 'willenskraft'],
  ] as const)(
    '"%s" is calculated from "%s" and "%s"',
    (resistance, attribute1, attribute2) => {
      const { expectState } = setupTest({
        rasse: 'mensch',
        [attribute1]: 1,
        [attribute2]: 2,
      })
      expectState({
        [resistance]: 15,
      })
    }
  )

  describe.each([
    'verteidigung',
    'geistigerWiderstand',
    'koerperlicherWiderstand',
  ] as const)('for "%s"', (resistance) => {
    it.each([
      [0, 0],
      [100, 2],
      [300, 4],
      [600, 6],
    ])('for used xp %i adds %i points', (usedXp, addedPoints) => {
      const { expectState } = setupTest({
        rasse: 'mensch',
        erfahrungspunkteEingesetzt: usedXp,
      })
      expectState({
        [resistance]: 12 + addedPoints,
      })
    })
  })
})
