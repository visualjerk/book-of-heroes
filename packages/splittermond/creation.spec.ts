import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { creationDefinition } from './creation'

describe('Creation', () => {
  const { setupTest } = createTestSetup(creationDefinition)

  it('can proceed', () => {
    const { expectState, character } = setupTest()
    character.execute('nextCreationStep', {})
    expectState({
      creationStep: 2,
    })
    character.execute('nextCreationStep', {})
    expectState({
      creationStep: 3,
    })
    character.execute('nextCreationStep', {})
    expectState({
      creationStep: 4,
    })
  })

  it('can not exceed max', () => {
    const { expectState, character } = setupTest({
      creationStep: 4,
    })
    character.execute('nextCreationStep', {})
    expectState({
      creationStep: 4,
    })
  })

  it('adds points on step 3', () => {
    const { expectState, character } = setupTest({
      creationStep: 2,
    })
    character.execute('nextCreationStep', {})
    expectState({
      attributePoints: 11,
      freeSkillPoints: 55,
      xp: 15,
      masteryPoints: 3,
    })
  })
})
