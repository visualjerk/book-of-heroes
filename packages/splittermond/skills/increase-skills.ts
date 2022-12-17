import { mapToAttributeDefinitions } from '@boh/character'
import { fertigkeitenDefinition, fertigkeiten } from './skills'
import { magicschools, Magicschool } from '../magic/magicschools'
import { MagicLevel, magicLevels, magicTresholds } from '../magic/spells'

const fertigkeitsMeisterschaftsPunkte =
  fertigkeiten.map<`${typeof fertigkeiten[number]}MeisterschaftsPunkte`>(
    (fertigkeit) => `${fertigkeit}MeisterschaftsPunkte`
  )

const meisterschaftsSchwellen = [6, 9, 12] as const
const meisterschaftsGrade = [1, 2, 3] as const

export const fertigkeitenSteigernDefinition = fertigkeitenDefinition
  .addAttributes({
    freieFertigkeitsPunkte: { type: 'number' },
    ...mapToAttributeDefinitions(fertigkeitsMeisterschaftsPunkte, {
      type: 'multi-select',
      options: meisterschaftsGrade,
    }),
    ...mapToAttributeDefinitions(
      magicschools,
      {
        type: 'multi-select',
        options: magicLevels,
      },
      (school) => `${school}SpellPoints`
    ),
  })
  .addEvents(
    {
      fertigkeitSteigern: {
        fertigkeit: 'group.fertigkeiten',
      },
    },
    {
      fertigkeitSteigern: {
        apply(
          { mutate, reject },
          { fertigkeit },
          { rawAttributes, attributes }
        ) {
          // Meisterschaftgrad erreicht?
          const meisterschaftsSchwelle = meisterschaftsSchwellen.findIndex(
            (schwelle) => schwelle === rawAttributes[fertigkeit] + 1
          )
          const meisterschaftsGrad = meisterschaftsGrade[meisterschaftsSchwelle]

          // Zaubergrad erreicht?
          let magicLevel: MagicLevel | null = null
          if (magicschools.includes(fertigkeit as Magicschool)) {
            const zauberSchwelle = magicTresholds.findIndex(
              (schwelle) => schwelle === rawAttributes[fertigkeit] + 1
            )
            magicLevel = magicLevels[zauberSchwelle]
          }

          const maximalWert = 6 + 3 * (attributes.heldengrad - 1)
          if (rawAttributes[fertigkeit] >= maximalWert) {
            reject(`Maximal ${maximalWert} Punkte pro Fertigkeit`)
          }

          // Steigern mit Punkt
          if (rawAttributes.freieFertigkeitsPunkte >= 1) {
            mutate('freieFertigkeitsPunkte', {
              type: 'subtract',
              amount: 1,
            })
            mutate(fertigkeit, {
              type: 'add',
              amount: 1,
            })
            if (meisterschaftsGrad != null) {
              mutate(`${fertigkeit}MeisterschaftsPunkte`, {
                type: 'add',
                option: meisterschaftsGrad,
              })
            }
            if (magicLevel != null) {
              mutate(`${fertigkeit as Magicschool}SpellPoints`, {
                type: 'add',
                option: magicLevel,
              })
            }
            return
          }

          // Steigern mit Erfahrungspunkten
          const erfahrungspunktKosten =
            3 + 2 * Math.max(0, Math.floor((rawAttributes[fertigkeit] - 3) / 3))
          const freieErfahrungspunkte =
            attributes.erfahrungspunkte - attributes.erfahrungspunkteEingesetzt
          if (freieErfahrungspunkte < erfahrungspunktKosten) {
            reject('Nicht genug Erfahrungspunkte')
          }
          mutate('erfahrungspunkteEingesetzt', {
            type: 'add',
            amount: erfahrungspunktKosten,
          })
          mutate(fertigkeit, {
            type: 'add',
            amount: 1,
          })
          if (meisterschaftsGrad != null) {
            mutate(`${fertigkeit}MeisterschaftsPunkte`, {
              type: 'add',
              option: meisterschaftsGrad,
            })
          }
          if (magicLevel != null) {
            mutate(`${fertigkeit as Magicschool}SpellPoints`, {
              type: 'add',
              option: magicLevel,
            })
          }
        },
      },
    }
  )
