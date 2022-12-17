import { Magieschule } from './magicschools'

const zauberArten = ['spruch', 'ritus'] as const
type Zauberart = typeof zauberArten[number]

export const zauberGrade = [0, 1, 2, 3, 4, 5] as const
export type ZauberGrad = typeof zauberGrade[number]
export const zauberSchwellen = [1, 3, 6, 9, 12, 15] as const
type Zauberschule = `${Magieschule} ${typeof zauberGrade[number]}`

// TODO: Alle typus ergänzen
const zauberTypus = [
  'aura',
  'schaden',
  'wahrnehmung',
  'verstaendigung',
  'verhuellung',
] as const
type Zaubertypus = typeof zauberTypus[number]

type Zauberkosten = `K${number}V${number}` | `${number}V${number}` | `${number}`

interface Zauber {
  name: string
  art: Zauberart
  schulen: ReadonlyArray<Zauberschule>
  typus: ReadonlyArray<Zaubertypus>
  kosten: Zauberkosten
  zauberdauer: number
  wirkung: string
}

function zauberlisteBauen<TListe extends ReadonlyArray<Zauber>>(
  zauberliste: TListe
) {
  return zauberliste
}

export const zauberliste = zauberlisteBauen([
  {
    name: 'alarm',
    art: 'spruch',
    schulen: ['erkenntnis 1', 'schutz 1'],
    typus: ['wahrnehmung'],
    kosten: '4V1',
    zauberdauer: 2,
    wirkung: `Der Zauberer wird alarmiert, wenn eines oder mehrere Wesen der Größenklasse 2 oder höher den Wirkungsbereich betritt. Er vermag dabei keinen genauen Ort zu bestimmen, sondern lediglich die pure Anwesenheit festzustellen, ebenso wenig kann er Angaben zur Anzahl machen. Es ist möglich, bis zu zehn bestimmte Wesen seiner Wahl von der Alarmierung auszunehmen.`,
  },
  {
    name: 'felsgeschoss',
    art: 'spruch',
    schulen: ['fels 1', 'kampf 1'],
    typus: ['schaden'],
    kosten: '3V1',
    zauberdauer: 4,
    wirkung: `Der Zauberer schleudert dem Ziel ein Felsgeschoss entgegen, welches 1W10 Punkte Felsschaden verursacht. Zudem bedarf es einer gelungenen Akrobatik- oder Athletik-Probe gegen 15 (erhöht um die Fertigkeitspunkte des Zauberers in der verwendeten Magieschule), um nicht vom Aufprall umgeworfen zu werden und als liegend zu gelten.`,
  },
  {
    name: 'feuerstrahl',
    art: 'spruch',
    schulen: ['feuer 1', 'kampf 2'],
    typus: ['schaden'],
    kosten: '5V2',
    zauberdauer: 8,
    wirkung: `Der Zauberer wirft einen Feuerstrahl auf einen Gegner. Der Getroffene erleidet 2W6+5 Punkte Feuerschaden.`,
  },
] as const)

export const zauberNamen = zauberliste.map(({ name }) => name)

export function zauberNachNamen(name: typeof zauberNamen[number]) {
  return zauberliste.find((zauber) => zauber.name === name)
}

export function zauberInSchule(schule: Magieschule) {
  return zauberliste.filter(({ schulen }) =>
    schulen.some((s) => s.includes(schule))
  )
}

export function zauberNamenInSchule(schule: Magieschule) {
  return zauberInSchule(schule).map(({ name }) => name)
}
