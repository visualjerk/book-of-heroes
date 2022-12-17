import { mapToAttributeDefinitions } from '@boh/character'
import { fertigkeitenDefinition, fertigkeiten } from './skills'
import { magicschools, Magicschool } from '../magic/magicschools'
import { MagicLevel, magicLevels, magicTresholds } from '../magic/spells'

const fertigkeitsMeisterschaftsPunkte =
  fertigkeiten.map<`${typeof fertigkeiten[number]}MasteryPoints`>(
    (skill) => `${skill}MasteryPoints`
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
        skill: 'group.fertigkeiten',
      },
    },
    {
      fertigkeitSteigern: {
        apply({ mutate, reject }, { skill }, { rawAttributes, attributes }) {
          // Meisterschaftgrad erreicht?
          const masteryTreshold = meisterschaftsSchwellen.findIndex(
            (schwelle) => schwelle === rawAttributes[skill] + 1
          )
          const meisterschaftsGrad = meisterschaftsGrade[masteryTreshold]

          // Zaubergrad erreicht?
          let magicLevel: MagicLevel | null = null
          if (magicschools.includes(skill as Magicschool)) {
            const zauberSchwelle = magicTresholds.findIndex(
              (schwelle) => schwelle === rawAttributes[skill] + 1
            )
            magicLevel = magicLevels[zauberSchwelle]
          }

          const maximalWert = 6 + 3 * (attributes.heldengrad - 1)
          if (rawAttributes[skill] >= maximalWert) {
            reject(`Maximal ${maximalWert} Punkte pro Fertigkeit`)
          }

          // Steigern mit Punkt
          if (rawAttributes.freieFertigkeitsPunkte >= 1) {
            mutate('freieFertigkeitsPunkte', {
              type: 'subtract',
              amount: 1,
            })
            mutate(skill, {
              type: 'add',
              amount: 1,
            })
            if (meisterschaftsGrad != null) {
              mutate(`${skill}MasteryPoints`, {
                type: 'add',
                option: meisterschaftsGrad,
              })
            }
            if (magicLevel != null) {
              mutate(`${skill as Magicschool}SpellPoints`, {
                type: 'add',
                option: magicLevel,
              })
            }
            return
          }

          // Steigern mit Erfahrungspunkten
          const erfahrungspunktKosten =
            3 + 2 * Math.max(0, Math.floor((rawAttributes[skill] - 3) / 3))
          const freieErfahrungspunkte =
            attributes.erfahrungspunkte - attributes.erfahrungspunkteEingesetzt
          if (freieErfahrungspunkte < erfahrungspunktKosten) {
            reject('Nicht genug Erfahrungspunkte')
          }
          mutate('erfahrungspunkteEingesetzt', {
            type: 'add',
            amount: erfahrungspunktKosten,
          })
          mutate(skill, {
            type: 'add',
            amount: 1,
          })
          if (meisterschaftsGrad != null) {
            mutate(`${skill}MasteryPoints`, {
              type: 'add',
              option: meisterschaftsGrad,
            })
          }
          if (magicLevel != null) {
            mutate(`${skill as Magicschool}SpellPoints`, {
              type: 'add',
              option: magicLevel,
            })
          }
        },
      },
    }
  )
