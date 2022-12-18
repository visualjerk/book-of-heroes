import { mapToAttributeDefinitions } from '@boh/character'
import { basicsDefinition } from '../basics'

export const attributes = [
  'charisma',
  'agility',
  'intuition',
  'constitution',
  'mysticism',
  'strength',
  'intellect',
  'willpower',
] as const

export const attributesDefinition = basicsDefinition.enhance(
  {
    ...mapToAttributeDefinitions(attributes, { type: 'number' }),
  },
  {
    attributes,
  },
  {
    charisma: ({ attributes, rawAttributes }) => {
      const mod = attributes.race === 'alb' ? 1 : 0
      return rawAttributes.charisma + mod
    },
    agility: ({ attributes, rawAttributes }) => {
      let mod = attributes.race === 'alb' ? 1 : 0
      mod += attributes.race === 'dwarf' ? -1 : 0
      return rawAttributes.agility + mod
    },
    constitution: ({ attributes, rawAttributes }) => {
      let mod = attributes.race === 'alb' ? -1 : 0
      mod += attributes.race === 'dwarf' ? 1 : 0
      return rawAttributes.constitution + mod
    },
    mysticism: ({ attributes, rawAttributes }) => {
      const mod = attributes.race === 'gnome' ? 1 : 0
      return rawAttributes.mysticism + mod
    },
    strength: ({ attributes, rawAttributes }) => {
      let mod = attributes.race === 'gnome' ? -1 : 0
      mod += attributes.race === 'varg' ? 2 : 0
      return rawAttributes.strength + mod
    },
    intellect: ({ attributes, rawAttributes }) => {
      const mod = attributes.race === 'gnome' ? 1 : 0
      return rawAttributes.intellect + mod
    },
    willpower: ({ attributes, rawAttributes }) => {
      let mod = attributes.race === 'dwarf' ? 1 : 0
      mod += attributes.race === 'varg' ? -1 : 0
      return rawAttributes.willpower + mod
    },
  },
  {},
  {}
)
