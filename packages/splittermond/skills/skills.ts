import { CharacterState, mapToAttributeDefinitions } from '@boh/character'
import { abgeleiteteWerteDefinition } from '../derived-values'
import { attributes } from '../attributes/attributes'
import { magicschools } from '../magic/magicschools'

export { magicschools as magicschools }

export const generalSkills = [
  'acrobatics',
  'alchemy',
  'leadership',
  'arcaneLore',
  'athletics',
  'performance',
  'diplomacy',
  'fineCrafting',
  'empathy',
  'determination',
  'dexterity',
  'storiesAndMyths',
  'crafting',
  'medicine',
  'stealth',
  'hunting',
  'geography',
  'natureStudy',
  'eloquence',
  'locksAndTraps',
  'swimming',
  'seafaring',
  'streetKnowledge',
  'animalGuidance',
  'survival',
  'perception',
  'toughness',
] as const

export const combatSkills = [
  'melee',
  'cuttingWeapons',
  'chainWeapons',
  'bladedWeapons',
  'polearms',
  'firearms',
  'thrownWeapons',
] as const

export const skills = [
  ...generalSkills,
  ...magicschools,
  ...combatSkills,
] as const

export const skillGroups = {
  generalSkills,
  magicschools: magicschools,
  combatSkills,
}

const skillsDefinitionBase = abgeleiteteWerteDefinition
  .addAttributes({
    ...mapToAttributeDefinitions(skills, { type: 'number' }),
  })
  .addAttributeGroups({
    skills,
    generalSkills,
    magicschools,
    combatSkills,
  })

type SkillsWithAttributes =
  | typeof generalSkills[number]
  | typeof magicschools[number]

export const skillsAttributes: Record<
  SkillsWithAttributes,
  [typeof attributes[number], typeof attributes[number]]
> = {
  // General skills
  acrobatics: ['agility', 'strength'],
  alchemy: ['mysticism', 'intellect'],
  leadership: ['charisma', 'willpower'],
  arcaneLore: ['mysticism', 'willpower'],
  athletics: ['agility', 'strength'],
  performance: ['charisma', 'willpower'],
  diplomacy: ['charisma', 'willpower'],
  fineCrafting: ['intuition', 'intellect'],
  empathy: ['intuition', 'intellect'],
  determination: ['charisma', 'willpower'],
  dexterity: ['charisma', 'agility'],
  storiesAndMyths: ['mysticism', 'intellect'],
  crafting: ['constitution', 'intellect'],
  medicine: ['intuition', 'intellect'],
  stealth: ['agility', 'intuition'],
  hunting: ['constitution', 'intellect'],
  geography: ['intuition', 'intellect'],
  natureStudy: ['intuition', 'intellect'],
  eloquence: ['charisma', 'willpower'],
  locksAndTraps: ['agility', 'intuition'],
  swimming: ['constitution', 'strength'],
  seafaring: ['agility', 'constitution'],
  streetKnowledge: ['charisma', 'intuition'],
  animalGuidance: ['agility', 'charisma'],
  survival: ['intuition', 'constitution'],
  perception: ['intuition', 'willpower'],
  toughness: ['constitution', 'willpower'],

  // Magicschools
  ban: ['mysticism', 'willpower'],
  control: ['mysticism', 'willpower'],
  movement: ['mysticism', 'agility'],
  realization: ['mysticism', 'intellect'],
  stone: ['mysticism', 'constitution'],
  fire: ['mysticism', 'charisma'],
  healing: ['mysticism', 'charisma'],
  illusion: ['mysticism', 'charisma'],
  battle: ['mysticism', 'strength'],
  light: ['mysticism', 'charisma'],
  nature: ['mysticism', 'charisma'],
  shadow: ['mysticism', 'intuition'],
  fate: ['mysticism', 'charisma'],
  protection: ['mysticism', 'charisma'],
  staerkung: ['mysticism', 'strength'],
  death: ['mysticism', 'intellect'],
  transformation: ['mysticism', 'constitution'],
  water: ['mysticism', 'intuition'],
  wind: ['mysticism', 'intellect'],
}

export let skillsDefinition = skillsDefinitionBase

Object.entries(skillsAttributes).forEach(([skill, skillAttributes]) => {
  const [attribute1, attribute2] = skillAttributes
  skillsDefinition = skillsDefinition.addAttributeCalculations({
    // TODO: why do we need to define characterstate when using a dynamic prop key?
    [skill]: ({
      attributes,
      rawAttributes,
    }: CharacterState<typeof skillsDefinitionBase['attributes']>) => {
      return (
        rawAttributes[skill as SkillsWithAttributes] +
        attributes[attribute1] +
        attributes[attribute2]
      )
    },
  })
})
