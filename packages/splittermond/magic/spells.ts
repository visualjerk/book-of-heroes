import { Magicschool } from './magicschools'

const spellTypes = ['spell', 'rite'] as const
type SpellType = typeof spellTypes[number]

export const magicLevels = [0, 1, 2, 3, 4, 5] as const
export type MagicLevel = typeof magicLevels[number]
export const magicTresholds = [1, 3, 6, 9, 12, 15] as const
type MagicschoolLevel = `${Magicschool} ${typeof magicLevels[number]}`

// TODO: Add all types
const magicType = [
  'aura',
  'damage',
  'perception',
  'communication',
  'disguise',
] as const
type MagicType = typeof magicType[number]

type SpellCost = `K${number}V${number}` | `${number}V${number}` | `${number}`

interface Spell {
  name: string
  type: SpellType
  schools: ReadonlyArray<MagicschoolLevel>
  magicType: ReadonlyArray<MagicType>
  cost: SpellCost
  duration: number
  effect: string
}

function buildSpellList<TList extends ReadonlyArray<Spell>>(spellList: TList) {
  return spellList
}

export const spellList = buildSpellList([
  {
    name: 'alarm',
    type: 'spell',
    schools: ['realization 1', 'protection 1'],
    magicType: ['perception'],
    cost: '4V1',
    duration: 2,
    effect: `Der Zauberer wird alarmiert, wenn eines oder mehrere Wesen der Größenklasse 2 oder höher den Wirkungsbereich betritt. Er vermag dabei keinen genauen Ort zu bestimmen, sondern lediglich die pure Anwesenheit festzustellen, ebenso wenig kann er Angaben zur Anzahl machen. Es ist möglich, bis zu zehn bestimmte Wesen seiner Wahl von der Alarmierung auszunehmen.`,
  },
  {
    name: 'felsgeschoss',
    type: 'spell',
    schools: ['stone 1', 'battle 1'],
    magicType: ['damage'],
    cost: '3V1',
    duration: 4,
    effect: `Der Zauberer schleudert dem Ziel ein Felsgeschoss entgegen, welches 1W10 Punkte Felsschaden verursacht. Zudem bedarf es einer gelungenen Akrobatik- oder Athletik-Probe gegen 15 (erhöht um die Fertigkeitspunkte des Zauberers in der verwendeten Magieschule), um nicht vom Aufprall umgeworfen zu werden und als liegend zu gelten.`,
  },
  {
    name: 'feuerstrahl',
    type: 'spell',
    schools: ['fire 1', 'battle 2'],
    magicType: ['damage'],
    cost: '5V2',
    duration: 8,
    effect: `Der Zauberer wirft einen Feuerstrahl auf einen Gegner. Der Getroffene erleidet 2W6+5 Punkte Feuerschaden.`,
  },
] as const)

export const spellNames = spellList.map(({ name }) => name)

export function getSpellByName(name: typeof spellNames[number]) {
  return spellList.find((spell) => spell.name === name)
}

export function getSpellsInSchool(school: Magicschool) {
  return spellList.filter(({ schools: schulen }) =>
    schulen.some((s) => s.includes(school))
  )
}

export function getSpellNamesInSchool(school: Magicschool) {
  return getSpellsInSchool(school).map(({ name }) => name)
}
