import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { basisDefinition } from './basics'

describe('Basis', () => {
  const { setupTest } = createTestSetup(basisDefinition)

  it('can set name', () => {
    const { expectState, character } = setupTest()
    character.execute('nameSetzen', {
      name: 'Barbarus',
    })
    expectState({
      name: 'Barbarus',
    })
  })

  it('can set race', () => {
    const { expectState, character } = setupTest()
    character.execute('rasseSetzen', {
      rasse: 'varg',
    })
    expectState({
      rasse: 'varg',
    })
  })

  it('can add xp', () => {
    const { expectState, character } = setupTest()
    character.execute('erfahrungspunkteHinzufuegen', {
      menge: 10,
    })
    expectState({
      erfahrungspunkte: 10,
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
      erfahrungspunkteEingesetzt: xp,
    })
    expectState({
      heldengrad: level,
    })
  })

  it.each([
    [0, 3],
    [100, 4],
    [300, 5],
    [600, 6],
  ])('for %i used xp shard points are %i', (xp, points) => {
    const { expectState } = setupTest({
      erfahrungspunkteEingesetzt: xp,
    })
    expectState({
      splitterpunkte: points,
    })
  })
})
