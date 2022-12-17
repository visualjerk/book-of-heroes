import { learnSpellsDefinition } from '../magic/learn-spells'
import { fertigkeitenDefinition } from '../skills/skills'

export const meisterschaftenNamen = [
  'blitzreflexe1',
  'blitzreflexe2',
  'blitzreflexe3',
] as const

type MeisterschaftName = typeof meisterschaftenNamen[number]
type FertigkeitName =
  typeof fertigkeitenDefinition['groups']['fertigkeiten'][number]

type MeisterschaftDefinitions = Record<
  MeisterschaftName,
  {
    level: number
    fertigkeit: FertigkeitName
    voraussetzung?: MeisterschaftName[]
  }
>

export const meisterschaften: MeisterschaftDefinitions = {
  blitzreflexe1: {
    level: 1,
    fertigkeit: 'akrobatik',
  },
  blitzreflexe2: {
    level: 1,
    fertigkeit: 'akrobatik',
    voraussetzung: ['blitzreflexe1'],
  },
  blitzreflexe3: {
    level: 2,
    fertigkeit: 'akrobatik',
    voraussetzung: ['blitzreflexe2'],
  },
}

export function meisterschaftenInFertigkeit(fertigkeit: string) {
  return Object.entries(meisterschaften)
    .filter(([, meisterschaft]) => meisterschaft.fertigkeit === fertigkeit)
    .map(([name, meisterschaft]) => ({
      ...meisterschaft,
      name: name as MeisterschaftName,
    }))
}

export const meisterschaftenDefinition = learnSpellsDefinition.addAttributes({
  meisterschaften: {
    type: 'multi-select',
    options: meisterschaftenNamen,
  },
})
