import { CharacterState, mapToAttributeDefinitions } from '@boh/character'
import { abgeleiteteWerteDefinition } from '../derived-values'
import { attribute } from '../attributes/attributes'
import { magieschulen } from '../magic/magicschools'

export { magieschulen }

export const allgemeineFertigkeiten = [
  'akrobatik',
  'alchemie',
  'anfuehren',
  'arkaneKunde',
  'athletik',
  'darbietung',
  'diplomatie',
  'edelhandwerk',
  'empathie',
  'entschlossenheit',
  'fingerfertigkeit',
  'geschichtenUndMythen',
  'handwerk',
  'heilkunde',
  'heimlichkeit',
  'jagdkunst',
  'laenderkunde',
  'naturkunde',
  'redegewandheit',
  'schloesserUndFallen',
  'schwimmen',
  'seefahrt',
  'strassenkunde',
  'tierfuehrung',
  'ueberleben',
  'wahrnehmung',
  'zaehigkeit',
] as const

export const kampfFertigkeiten = [
  'handgemenge',
  'hiebwaffen',
  'kettenwaffen',
  'klingenwaffen',
  'stangenwaffen',
  'schusswaffen',
  'wurfwaffen',
] as const

export const fertigkeiten = [
  ...allgemeineFertigkeiten,
  ...magieschulen,
  ...kampfFertigkeiten,
] as const

export const fertigkeitenGruppen = {
  allgemeineFertigkeiten,
  magieSchulen: magieschulen,
  kampfFertigkeiten,
}

const fertigkeitenDefinitionBasis = abgeleiteteWerteDefinition
  .addAttributes({
    ...mapToAttributeDefinitions(fertigkeiten, { type: 'number' }),
  })
  .addAttributeGroups({
    fertigkeiten,
    allgemeineFertigkeiten,
    magieSchulen: magieschulen,
    kampfFertigkeiten,
  })

type AttributeMitFertigkeiten =
  | typeof allgemeineFertigkeiten[number]
  | typeof magieschulen[number]

export const fertigkeitenAttribute: Record<
  AttributeMitFertigkeiten,
  [typeof attribute[number], typeof attribute[number]]
> = {
  // Allgemeine Fertigkeiten
  akrobatik: ['agility', 'strength'],
  alchemie: ['mysticism', 'intellect'],
  anfuehren: ['charisma', 'willpower'],
  arkaneKunde: ['mysticism', 'willpower'],
  athletik: ['agility', 'strength'],
  darbietung: ['charisma', 'willpower'],
  diplomatie: ['charisma', 'willpower'],
  edelhandwerk: ['intuition', 'intellect'],
  empathie: ['intuition', 'intellect'],
  entschlossenheit: ['charisma', 'willpower'],
  fingerfertigkeit: ['charisma', 'agility'],
  geschichtenUndMythen: ['mysticism', 'intellect'],
  handwerk: ['constitution', 'intellect'],
  heilkunde: ['intuition', 'intellect'],
  heimlichkeit: ['agility', 'intuition'],
  jagdkunst: ['constitution', 'intellect'],
  laenderkunde: ['intuition', 'intellect'],
  naturkunde: ['intuition', 'intellect'],
  redegewandheit: ['charisma', 'willpower'],
  schloesserUndFallen: ['agility', 'intuition'],
  schwimmen: ['constitution', 'strength'],
  seefahrt: ['agility', 'constitution'],
  strassenkunde: ['charisma', 'intuition'],
  tierfuehrung: ['agility', 'charisma'],
  ueberleben: ['intuition', 'constitution'],
  wahrnehmung: ['intuition', 'willpower'],
  zaehigkeit: ['constitution', 'willpower'],

  // Magieschulen
  bann: ['mysticism', 'willpower'],
  beherrschung: ['mysticism', 'willpower'],
  bewegung: ['mysticism', 'agility'],
  erkenntnis: ['mysticism', 'intellect'],
  fels: ['mysticism', 'constitution'],
  feuer: ['mysticism', 'charisma'],
  heilung: ['mysticism', 'charisma'],
  illusion: ['mysticism', 'charisma'],
  kampf: ['mysticism', 'strength'],
  licht: ['mysticism', 'charisma'],
  natur: ['mysticism', 'charisma'],
  schatten: ['mysticism', 'intuition'],
  schicksal: ['mysticism', 'charisma'],
  schutz: ['mysticism', 'charisma'],
  staerkung: ['mysticism', 'strength'],
  tod: ['mysticism', 'intellect'],
  verwandlung: ['mysticism', 'constitution'],
  wasser: ['mysticism', 'intuition'],
  wind: ['mysticism', 'intellect'],
}

export let fertigkeitenDefinition = fertigkeitenDefinitionBasis

Object.entries(fertigkeitenAttribute).forEach(
  ([fertigkeit, fertigkeitAttribute]) => {
    const [attribut1, attribut2] = fertigkeitAttribute
    fertigkeitenDefinition = fertigkeitenDefinition.addAttributeCalculations({
      // TODO: why do we need to define characterstate when using a dynamic prop key?
      [fertigkeit]: ({
        attributes,
        rawAttributes,
      }: CharacterState<typeof fertigkeitenDefinitionBasis['attributes']>) => {
        return (
          rawAttributes[fertigkeit as AttributeMitFertigkeiten] +
          attributes[attribut1] +
          attributes[attribut2]
        )
      },
    })
  }
)
