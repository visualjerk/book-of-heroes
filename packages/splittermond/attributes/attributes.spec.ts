import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { attributeDefinition } from './attributes'

describe('Attribute', () => {
  const { setupTest } = createTestSetup(attributeDefinition)

  it.each([
    ['ausstrahlung', 'mensch', 0],
    ['ausstrahlung', 'alb', 1],
    ['beweglichkeit', 'mensch', 0],
    ['beweglichkeit', 'alb', 1],
    ['beweglichkeit', 'zwerg', -1],
    ['konstitution', 'mensch', 0],
    ['konstitution', 'alb', -1],
    ['konstitution', 'zwerg', 1],
    ['mystik', 'mensch', 0],
    ['mystik', 'gnom', 1],
    ['staerke', 'mensch', 0],
    ['staerke', 'gnom', -1],
    ['staerke', 'varg', 2],
    ['verstand', 'mensch', 0],
    ['verstand', 'gnom', 1],
    ['willenskraft', 'mensch', 0],
    ['willenskraft', 'zwerg', 1],
    ['willenskraft', 'varg', -1],
  ] as const)(
    'attribute "%s" is modified by race "%s" by %i',
    (attribute, race, points) => {
      const { expectState } = setupTest({
        rasse: race,
      })
      expectState({
        [attribute]: points,
      })
    }
  )
})
