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
  akrobatik: ['beweglichkeit', 'staerke'],
  alchemie: ['mystik', 'verstand'],
  anfuehren: ['ausstrahlung', 'willenskraft'],
  arkaneKunde: ['mystik', 'willenskraft'],
  athletik: ['beweglichkeit', 'staerke'],
  darbietung: ['ausstrahlung', 'willenskraft'],
  diplomatie: ['ausstrahlung', 'willenskraft'],
  edelhandwerk: ['intuition', 'verstand'],
  empathie: ['intuition', 'verstand'],
  entschlossenheit: ['ausstrahlung', 'willenskraft'],
  fingerfertigkeit: ['ausstrahlung', 'beweglichkeit'],
  geschichtenUndMythen: ['mystik', 'verstand'],
  handwerk: ['konstitution', 'verstand'],
  heilkunde: ['intuition', 'verstand'],
  heimlichkeit: ['beweglichkeit', 'intuition'],
  jagdkunst: ['konstitution', 'verstand'],
  laenderkunde: ['intuition', 'verstand'],
  naturkunde: ['intuition', 'verstand'],
  redegewandheit: ['ausstrahlung', 'willenskraft'],
  schloesserUndFallen: ['beweglichkeit', 'intuition'],
  schwimmen: ['konstitution', 'staerke'],
  seefahrt: ['beweglichkeit', 'konstitution'],
  strassenkunde: ['ausstrahlung', 'intuition'],
  tierfuehrung: ['beweglichkeit', 'ausstrahlung'],
  ueberleben: ['intuition', 'konstitution'],
  wahrnehmung: ['intuition', 'willenskraft'],
  zaehigkeit: ['konstitution', 'willenskraft'],

  // Magieschulen
  bann: ['mystik', 'willenskraft'],
  beherrschung: ['mystik', 'willenskraft'],
  bewegung: ['mystik', 'beweglichkeit'],
  erkenntnis: ['mystik', 'verstand'],
  fels: ['mystik', 'konstitution'],
  feuer: ['mystik', 'ausstrahlung'],
  heilung: ['mystik', 'ausstrahlung'],
  illusion: ['mystik', 'ausstrahlung'],
  kampf: ['mystik', 'staerke'],
  licht: ['mystik', 'ausstrahlung'],
  natur: ['mystik', 'ausstrahlung'],
  schatten: ['mystik', 'intuition'],
  schicksal: ['mystik', 'ausstrahlung'],
  schutz: ['mystik', 'ausstrahlung'],
  staerkung: ['mystik', 'staerke'],
  tod: ['mystik', 'verstand'],
  verwandlung: ['mystik', 'konstitution'],
  wasser: ['mystik', 'intuition'],
  wind: ['mystik', 'verstand'],
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
