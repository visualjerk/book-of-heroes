import { mapToAttributeDefinitions } from '@boh/character'
import { basisDefinition } from '../basics'

export const attribute = [
  'ausstrahlung',
  'beweglichkeit',
  'intuition',
  'konstitution',
  'mystik',
  'staerke',
  'verstand',
  'willenskraft',
] as const

export const attributeDefinition = basisDefinition.enhance(
  {
    ...mapToAttributeDefinitions(attribute, { type: 'number' }),
  },
  {
    attribute,
  },
  {
    ausstrahlung: ({ attributes, rawAttributes }) => {
      const mod = attributes.rasse === 'alb' ? 1 : 0
      return rawAttributes.ausstrahlung + mod
    },
    beweglichkeit: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'alb' ? 1 : 0
      mod += attributes.rasse === 'zwerg' ? -1 : 0
      return rawAttributes.beweglichkeit + mod
    },
    konstitution: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'alb' ? -1 : 0
      mod += attributes.rasse === 'zwerg' ? 1 : 0
      return rawAttributes.konstitution + mod
    },
    mystik: ({ attributes, rawAttributes }) => {
      const mod = attributes.rasse === 'gnom' ? 1 : 0
      return rawAttributes.mystik + mod
    },
    staerke: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'gnom' ? -1 : 0
      mod += attributes.rasse === 'varg' ? 2 : 0
      return rawAttributes.staerke + mod
    },
    verstand: ({ attributes, rawAttributes }) => {
      const mod = attributes.rasse === 'gnom' ? 1 : 0
      return rawAttributes.verstand + mod
    },
    willenskraft: ({ attributes, rawAttributes }) => {
      let mod = attributes.rasse === 'zwerg' ? 1 : 0
      mod += attributes.rasse === 'varg' ? -1 : 0
      return rawAttributes.willenskraft + mod
    },
  },
  {},
  {}
)
