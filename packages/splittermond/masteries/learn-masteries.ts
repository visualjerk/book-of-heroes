import { masteriesDefinition, masteries } from './masteries'

export const learnMasteriesDefinition = masteriesDefinition
  .addAttributes({ masteryPoints: { type: 'number' } })
  .addEvents(
    {
      learnMastery: {
        name: 'masteries.value',
      },
    },
    {
      learnMastery: {
        apply({ mutate, reject }, { name }, { rawAttributes }) {
          const mastery = masteries[name]
          if (rawAttributes.masteries.includes(name)) {
            reject('Meisterschaft wurde bereits gelernt')
            return
          }

          const precondition = mastery.precondition ?? []
          if (
            !precondition.every((name) =>
              rawAttributes.masteries.includes(name)
            )
          ) {
            reject('Nicht alle Voraussetzungen erfüllt')
            return
          }

          // Learn with mastery points in skill
          const masteryPointsInSkill =
            rawAttributes[`${mastery.skill}MasteryPoints`]
          const matchingMasteryPoint = masteryPointsInSkill.find(
            (punkt) => punkt >= mastery.level
          )

          if (matchingMasteryPoint != null) {
            mutate(`${mastery.skill}MasteryPoints`, {
              type: 'remove',
              option: matchingMasteryPoint,
            })
            mutate('masteries', {
              type: 'add',
              option: name,
            })
            return
          }

          // Learn with general mastery point
          if (rawAttributes.masteryPoints > 0 && mastery.level === 1) {
            mutate('masteryPoints', {
              type: 'subtract',
              amount: 1,
            })
            mutate('masteries', {
              type: 'add',
              option: name,
            })
            return
          }

          const skillPoints = rawAttributes[mastery.skill]
          const masteryTreshold = Math.floor((skillPoints - 3) / 3)
          if (masteryTreshold < mastery.level) {
            reject('Zu niedrige Meisterschaftsschwelle')
            return
          }

          const freeXp =
            rawAttributes.erfahrungspunkte -
            rawAttributes.erfahrungspunkteEingesetzt

          if (freeXp < 15) {
            reject('Zu wenig Erfahrungspunkte')
            return
          }

          mutate('masteries', {
            type: 'add',
            option: name,
          })
          mutate('erfahrungspunkteEingesetzt', {
            type: 'add',
            amount: 15,
          })
        },
      },
    }
  )
