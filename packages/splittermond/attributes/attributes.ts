import { mapToAttributeDefinitions } from '@boh/character'
import { basisDefinition } from '../basics'

export const attribute = [
  'charisma',
  'agility',
  'intuition',
  'constitution',
  'mysticism',
  'strength',
  'intellect',
  'willpower',
] as const

export const attributeDefinition = basisDefinition.enhance(
  {
    ...mapToAttributeDefinitions(attribute, { type: 'number' }),
  },
  {
    attribute,
  },
  {
    charisma: ({ attributes, rawAttributes }) => {
      const mod = attributes.rasse === 'alb' ? 1 : 0
      return rawAttributes.charisma + mod
    },
    agility: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'alb' ? 1 : 0
      mod += attributes.rasse === 'zwerg' ? -1 : 0
      return rawAttributes.agility + mod
    },
    constitution: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'alb' ? -1 : 0
      mod += attributes.rasse === 'zwerg' ? 1 : 0
      return rawAttributes.constitution + mod
    },
    mysticism: ({ attributes, rawAttributes }) => {
      const mod = attributes.rasse === 'gnom' ? 1 : 0
      return rawAttributes.mysticism + mod
    },
    strength: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'gnom' ? -1 : 0
      mod += attributes.rasse === 'varg' ? 2 : 0
      return rawAttributes.strength + mod
    },
    intellect: ({ attributes, rawAttributes }) => {
      const mod = attributes.rasse === 'gnom' ? 1 : 0
      return rawAttributes.intellect + mod
    },
    willpower: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'zwerg' ? 1 : 0
      mod += attributes.rasse === 'varg' ? -1 : 0
      return rawAttributes.willpower + mod
    },
  },
  {},
  {}
)
