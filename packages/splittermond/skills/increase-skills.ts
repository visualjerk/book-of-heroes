import { mapToAttributeDefinitions } from '@boh/character'
import { skillsDefinition, skills } from './skills'
import { magicschools, Magicschool } from '../magic/magicschools'
import { MagicLevel, magicLevels, magicTresholds } from '../magic/spells'

const skillsMasteryPoints = skills.map<`${typeof skills[number]}MasteryPoints`>(
  (skill) => `${skill}MasteryPoints`
)

const masteryTresholds = [6, 9, 12] as const
const masteryLevels = [1, 2, 3] as const

export const increaseSkillsDefinition = skillsDefinition
  .addAttributes({
    freeSkillPoints: { type: 'number' },
    ...mapToAttributeDefinitions(skillsMasteryPoints, {
      type: 'multi-select',
      options: masteryLevels,
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
      increaseSkill: {
        skill: 'group.skills',
      },
    },
    {
      increaseSkill: {
        apply({ mutate, reject }, { skill }, { rawAttributes, attributes }) {
          // Reached mastery level?
          const masteryTreshold = masteryTresholds.findIndex(
            (treshold) => treshold === rawAttributes[skill] + 1
          )
          const masteryLevel = masteryLevels[masteryTreshold]

          // Reached magic school level
          let magicLevel: MagicLevel | null = null
          if (magicschools.includes(skill as Magicschool)) {
            const magicTreshold = magicTresholds.findIndex(
              (treshold) => treshold === rawAttributes[skill] + 1
            )
            magicLevel = magicLevels[magicTreshold]
          }

          const maximumValue = 6 + 3 * (attributes.heroLevel - 1)
          if (rawAttributes[skill] >= maximumValue) {
            reject(`Maximal ${maximumValue} Punkte pro Fertigkeit`)
          }

          // Increase with skill point
          if (rawAttributes.freeSkillPoints >= 1) {
            mutate('freeSkillPoints', {
              type: 'subtract',
              amount: 1,
            })
            mutate(skill, {
              type: 'add',
              amount: 1,
            })
            if (masteryLevel != null) {
              mutate(`${skill}MasteryPoints`, {
                type: 'add',
                option: masteryLevel,
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

          // Increase with XP
          const xpCost =
            3 + 2 * Math.max(0, Math.floor((rawAttributes[skill] - 3) / 3))
          const freeXp = attributes.xp - attributes.xpUsed
          if (freeXp < xpCost) {
            reject('Nicht genug Erfahrungspunkte')
          }
          mutate('xpUsed', {
            type: 'add',
            amount: xpCost,
          })
          mutate(skill, {
            type: 'add',
            amount: 1,
          })
          if (masteryLevel != null) {
            mutate(`${skill}MasteryPoints`, {
              type: 'add',
              option: masteryLevel,
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
