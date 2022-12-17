import { CharacterState, mapToAttributeDefinitions } from '@boh/character'
import { abgeleiteteWerteDefinition } from '../derived-values'
import { attributes } from '../attributes/attributes'
import { magicschools } from '../magic/magicschools'

export { magicschools as magicschools }

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
  'perception',
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
  ...magicschools,
  ...kampfFertigkeiten,
] as const

export const fertigkeitenGruppen = {
  allgemeineFertigkeiten,
  magicschools: magicschools,
  kampfFertigkeiten,
}

const fertigkeitenDefinitionBasis = abgeleiteteWerteDefinition
  .addAttributes({
    ...mapToAttributeDefinitions(fertigkeiten, { type: 'number' }),
  })
  .addAttributeGroups({
    fertigkeiten,
    allgemeineFertigkeiten,
    magicschools: magicschools,
    kampfFertigkeiten,
  })

type AttributeMitFertigkeiten =
  | typeof allgemeineFertigkeiten[number]
  | typeof magicschools[number]

export const fertigkeitenAttribute: Record<
  AttributeMitFertigkeiten,
  [typeof attributes[number], typeof attributes[number]]
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
  perception: ['intuition', 'willpower'],
  zaehigkeit: ['constitution', 'willpower'],

  // magicschools
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
