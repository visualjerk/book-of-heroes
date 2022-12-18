import { learnMasteriesDefinition } from './masteries/learn-masteries'

const creationSteps = [1, 2, 3, 4] as const

type CreationStep = typeof creationSteps[number]

export const creationDefinition = learnMasteriesDefinition
  .addAttributes({
    creationStep: {
      type: 'single-select',
      options: creationSteps,
    },
  })
  .addEvents(
    {
      nextCreationStep: {},
    },
    {
      nextCreationStep: {
        apply({ mutate, reject }, _, { rawAttributes }, { groups }) {
          const nextStep = rawAttributes.creationStep + 1
          if (nextStep > 4) {
            reject('Letzte Erschaffungsstufe erreicht.')
            return
          }

          if (nextStep === 3) {
            // 18 attribute points, at least one point for each attribute
            groups.attributes.forEach((attributKey) => {
              mutate(attributKey, {
                type: 'add',
                amount: 1,
              })
            })
            // Each race gets one additional point
            // Humans get two additional points
            const attributePoints = rawAttributes.race === 'human' ? 12 : 11
            mutate('attributePoints', {
              type: 'add',
              amount: attributePoints,
            })
            mutate('freeSkillPoints', {
              type: 'add',
              amount: 55,
            })
            mutate('xp', {
              type: 'add',
              amount: 15,
            })
            mutate('masteryPoints', {
              type: 'add',
              amount: 3,
            })
          }

          mutate('creationStep', {
            option: nextStep as CreationStep,
          })
        },
      },
    }
  )
