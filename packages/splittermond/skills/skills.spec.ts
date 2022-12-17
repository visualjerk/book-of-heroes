import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import {
  fertigkeitenDefinition,
  allgemeineFertigkeiten,
  magicschools,
  fertigkeitenAttribute,
} from './skills'

describe('Fertigkeiten', () => {
  const { setupTest } = createTestSetup(fertigkeitenDefinition)

  describe.each([...allgemeineFertigkeiten, ...magicschools])(
    'skill "%s"',
    (skill) => {
      it('adds its own points', () => {
        const { expectState } = setupTest({
          rasse: 'mensch',
          [skill]: 2,
        })
        expectState({
          [skill]: 2,
        })
      })

      const attribute = fertigkeitenAttribute[skill]

      it.each(attribute)('is calculated by attribute "%s"', (attribut) => {
        const { expectState } = setupTest({
          rasse: 'mensch',
          [skill]: 2,
          [attribut]: 3,
        })
        expectState({
          [skill]: 5,
        })
      })
    }
  )
})
