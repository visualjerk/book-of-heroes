import { meisterschaftenLernenDefinition } from './masteries/learn-masteries'

export const erschaffungDefinition = meisterschaftenLernenDefinition
  .addAttributes({
    erschaffungsZustand: {
      type: 'single-select',
      options: [1, 2, 3, 4] as const,
    },
  })
  .addEvents(
    {
      erschaffungWeiter: {},
    },
    {
      erschaffungWeiter: {
        apply({ mutate, reject }, _, { rawAttributes }, { groups }) {
          const naechsterZustand = rawAttributes.erschaffungsZustand + 1
          if (naechsterZustand > 4) {
            reject('Letzte Erschaffungsstufe erreicht.')
            return
          }

          if (naechsterZustand === 3) {
            // 18 Attributpunkte, wobei jedes mindestens einen haben muss
            groups.attributes.forEach((attributKey) => {
              mutate(attributKey, {
                type: 'add',
                amount: 1,
              })
            })
            // Alle Rassen bekommen einen zusätzlichen Attributpunkt
            // Menschen bekommen zwei zusätzliche Attributpunkte
            const attributPunkte = rawAttributes.rasse === 'mensch' ? 12 : 11
            mutate('attributPunkte', {
              type: 'add',
              amount: attributPunkte,
            })
            mutate('freieFertigkeitsPunkte', {
              type: 'add',
              amount: 55,
            })
            mutate('erfahrungspunkte', {
              type: 'add',
              amount: 15,
            })
            mutate('meisterschaftsPunkte', {
              type: 'add',
              amount: 3,
            })
          }

          mutate('erschaffungsZustand', {
            option: naechsterZustand as any,
          })
        },
      },
    }
  )
