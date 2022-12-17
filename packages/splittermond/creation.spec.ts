import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { erschaffungDefinition } from './creation'

describe('Erschaffung', () => {
  const { setupTest } = createTestSetup(erschaffungDefinition)

  it('can proceed', () => {
    const { expectState, character } = setupTest()
    character.execute('erschaffungWeiter', {})
    expectState({
      erschaffungsZustand: 2,
    })
    character.execute('erschaffungWeiter', {})
    expectState({
      erschaffungsZustand: 3,
    })
    character.execute('erschaffungWeiter', {})
    expectState({
      erschaffungsZustand: 4,
    })
  })

  it('can not exceed max', () => {
    const { expectState, character } = setupTest({
      erschaffungsZustand: 4,
    })
    character.execute('erschaffungWeiter', {})
    expectState({
      erschaffungsZustand: 4,
    })
  })

  it('adds points on step 3', () => {
    const { expectState, character } = setupTest({
      erschaffungsZustand: 2,
    })
    character.execute('erschaffungWeiter', {})
    expectState({
      attributPunkte: 11,
      freieFertigkeitsPunkte: 55,
      erfahrungspunkte: 15,
      meisterschaftsPunkte: 3,
    })
  })
})
