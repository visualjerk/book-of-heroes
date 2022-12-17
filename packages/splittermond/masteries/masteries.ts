import { learnSpellsDefinition } from '../magic/learn-spells'
import { fertigkeitenDefinition } from '../skills/skills'

export const masteryNames = [
  'blitzreflexe1',
  'blitzreflexe2',
  'blitzreflexe3',
] as const

type MasteryName = typeof masteryNames[number]
type SkillName = typeof fertigkeitenDefinition['groups']['fertigkeiten'][number]

type MasteriesByName = Record<
  MasteryName,
  {
    level: number
    skill: SkillName
    precondition?: MasteryName[]
  }
>

export const masteries: MasteriesByName = {
  blitzreflexe1: {
    level: 1,
    skill: 'akrobatik',
  },
  blitzreflexe2: {
    level: 1,
    skill: 'akrobatik',
    precondition: ['blitzreflexe1'],
  },
  blitzreflexe3: {
    level: 2,
    skill: 'akrobatik',
    precondition: ['blitzreflexe2'],
  },
}

export function getMasteriesBySkill(skill: string) {
  return Object.entries(masteries)
    .filter(([, mastery]) => mastery.skill === skill)
    .map(([name, mastery]) => ({
      ...mastery,
      name: name as MasteryName,
    }))
}

export const masteriesDefinition = learnSpellsDefinition.addAttributes({
  masteries: {
    type: 'multi-select',
    options: masteryNames,
  },
})
