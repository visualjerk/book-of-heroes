import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { fertigkeitenSteigernDefinition } from './increase-skills'

describe('FertigkeitenSteigern', () => {
  const { setupTest: generalSetupTest } = createTestSetup(
    fertigkeitenSteigernDefinition
  )

  function setupTest(...args: Parameters<typeof generalSetupTest>) {
    const { expectState, character } = generalSetupTest(...args)

    function increase() {
      character.execute('fertigkeitSteigern', {
        skill: 'ban',
      })
    }

    return {
      expectState,
      increase,
    }
  }

  it('can not increase without points or xp', () => {
    const { expectState, increase } = setupTest()
    increase()
    expectState({
      ban: 0,
    })
  })

  it('can increase with points', () => {
    const { expectState, increase } = setupTest({
      freieFertigkeitsPunkte: 1,
    })
    increase()
    expectState({
      ban: 1,
      freieFertigkeitsPunkte: 0,
    })
  })

  it('can increase with xp', () => {
    const { expectState, increase } = setupTest({
      erfahrungspunkte: 10,
    })
    increase()
    expectState({
      ban: 1,
      erfahrungspunkteEingesetzt: 3,
    })
  })

  it.each([
    [99, 6],
    [100, 9],
    [299, 9],
    [300, 12],
    [599, 12],
    [600, 15],
  ])('for used xp of %i max points are %i', (usedXp, points) => {
    const { expectState, increase } = setupTest({
      ban: points,
      erfahrungspunkte: 1000,
      erfahrungspunkteEingesetzt: usedXp,
    })
    increase()
    expectState({
      ban: points,
      erfahrungspunkteEingesetzt: usedXp,
    })
  })

  it.each([
    [0, 3],
    [5, 3],
    [6, 5],
    [8, 5],
    [9, 7],
    [11, 7],
    [12, 9],
  ])('for skill points of %i cost is %i xp', (points, cost) => {
    const { expectState, increase } = setupTest({
      ban: points,
      erfahrungspunkte: 1000,
      erfahrungspunkteEingesetzt: 600,
    })
    increase()
    expectState({
      erfahrungspunkteEingesetzt: 600 + cost,
      ban: points + 1,
    })
  })

  it.each([
    [0, []],
    [6, [1]],
    [9, [1, 2]],
    [12, [1, 2, 3]],
  ] as const)(
    'increasing to %i adds mastery points %s',
    (points, masteryPoints) => {
      const { expectState, increase } = setupTest({
        erfahrungspunkte: 1000,
        erfahrungspunkteEingesetzt: 600,
      })
      for (let i = 0; i < points; i++) {
        increase()
      }
      expectState({
        banMasteryPoints: masteryPoints,
      })
    }
  )

  it.each([
    [1, [0]],
    [3, [0, 1]],
    [6, [0, 1, 2]],
    [9, [0, 1, 2, 3]],
    [12, [0, 1, 2, 3, 4]],
    [15, [0, 1, 2, 3, 4, 5]],
  ] as const)(
    'increasing to %i adds spell points %s',
    (points, spellPoints) => {
      const { expectState, increase } = setupTest({
        erfahrungspunkte: 1000,
        erfahrungspunkteEingesetzt: 600,
      })
      for (let i = 0; i < points; i++) {
        increase()
      }
      expectState({
        banSpellPoints: spellPoints,
      })
    }
  )
})
