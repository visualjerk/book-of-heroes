import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { attributesDefinition } from './attributes'

describe('Attribute', () => {
  const { setupTest } = createTestSetup(attributesDefinition)

  it.each([
    ['charisma', 'mensch', 0],
    ['charisma', 'alb', 1],
    ['agility', 'mensch', 0],
    ['agility', 'alb', 1],
    ['agility', 'zwerg', -1],
    ['constitution', 'mensch', 0],
    ['constitution', 'alb', -1],
    ['constitution', 'zwerg', 1],
    ['mysticism', 'mensch', 0],
    ['mysticism', 'gnom', 1],
    ['strength', 'mensch', 0],
    ['strength', 'gnom', -1],
    ['strength', 'varg', 2],
    ['intellect', 'mensch', 0],
    ['intellect', 'gnom', 1],
    ['willpower', 'mensch', 0],
    ['willpower', 'zwerg', 1],
    ['willpower', 'varg', -1],
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
