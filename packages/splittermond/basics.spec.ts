import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { basicsDefinition } from './basics'

describe('Basics', () => {
  const { setupTest } = createTestSetup(basicsDefinition)

  it('can set name', () => {
    const { expectState, character } = setupTest()
    character.execute('setName', {
      name: 'Barbarus',
    })
    expectState({
      name: 'Barbarus',
    })
  })

  it('can set race', () => {
    const { expectState, character } = setupTest()
    character.execute('setRace', {
      race: 'varg',
    })
    expectState({
      race: 'varg',
    })
  })

  it('can add xp', () => {
    const { expectState, character } = setupTest()
    character.execute('addXp', {
      amount: 10,
    })
    expectState({
      xp: 10,
    })
  })

  it.each([
    [0, 1],
    [99, 1],
    [100, 2],
    [299, 2],
    [300, 3],
    [599, 3],
    [600, 4],
  ] as const)('for %i used xp hero level is %i', (xp, level) => {
    const { expectState } = setupTest({
      xpUsed: xp,
    })
    expectState({
      heroLevel: level,
    })
  })

  it.each([
    [0, 3],
    [100, 4],
    [300, 5],
    [600, 6],
  ])('for %i used xp shard points are %i', (xp, points) => {
    const { expectState } = setupTest({
      xpUsed: xp,
    })
    expectState({
      splinterPoints: points,
    })
  })
})
