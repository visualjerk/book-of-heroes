import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import {
  skillsDefinition,
  generalSkills,
  magicschools,
  skillsAttributes,
} from './skills'

describe('Skills', () => {
  const { setupTest } = createTestSetup(skillsDefinition)

  describe.each([...generalSkills, ...magicschools])('skill "%s"', (skill) => {
    it('adds its own points', () => {
      const { expectState } = setupTest({
        race: 'human',
        [skill]: 2,
      })
      expectState({
        [skill]: 2,
      })
    })

    const attribute = skillsAttributes[skill]

    it.each(attribute)('is calculated by attribute "%s"', (attribut) => {
      const { expectState } = setupTest({
        race: 'human',
        [skill]: 2,
        [attribut]: 3,
      })
      expectState({
        [skill]: 5,
      })
    })
  })
})
