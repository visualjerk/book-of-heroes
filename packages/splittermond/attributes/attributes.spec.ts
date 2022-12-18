import { describe, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { attributesDefinition } from './attributes'

describe('Attribute', () => {
  const { setupTest } = createTestSetup(attributesDefinition)

  it.each([
    ['charisma', 'human', 0],
    ['charisma', 'alb', 1],
    ['agility', 'human', 0],
    ['agility', 'alb', 1],
    ['agility', 'dwarf', -1],
    ['constitution', 'human', 0],
    ['constitution', 'alb', -1],
    ['constitution', 'dwarf', 1],
    ['mysticism', 'human', 0],
    ['mysticism', 'gnome', 1],
    ['strength', 'human', 0],
    ['strength', 'gnome', -1],
    ['strength', 'varg', 2],
    ['intellect', 'human', 0],
    ['intellect', 'gnome', 1],
    ['willpower', 'human', 0],
    ['willpower', 'dwarf', 1],
    ['willpower', 'varg', -1],
  ] as const)(
    'attribute "%s" is modified by race "%s" by %i',
    (attribute, race, points) => {
      const { expectState } = setupTest({
        race: race,
      })
      expectState({
        [attribute]: points,
      })
    }
  )
})
