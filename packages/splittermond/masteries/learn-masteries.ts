import { meisterschaftenDefinition, meisterschaften } from './masteries'

export const meisterschaftenLernenDefinition = meisterschaftenDefinition
  .addAttributes({ meisterschaftsPunkte: { type: 'number' } })
  .addEvents(
    {
      meisterschaftLernen: {
        name: 'meisterschaften.value',
      },
    },
    {
      meisterschaftLernen: {
        apply({ mutate, reject }, { name }, { rawAttributes }) {
          const meisterschaft = meisterschaften[name]
          if (rawAttributes.meisterschaften.includes(name)) {
            reject('Meisterschaft wurde bereits gelernt')
            return
          }

          const voraussetzungen = meisterschaft.voraussetzung ?? []
          if (
            !voraussetzungen.every((name) =>
              rawAttributes.meisterschaften.includes(name)
            )
          ) {
            reject('Nicht alle Voraussetzungen erfüllt')
            return
          }

          // Für Meisterschaftspunkt in Fertigkeit kaufen
          const meisterschaftsPunkteInFertigkeit =
            rawAttributes[`${meisterschaft.fertigkeit}MeisterschaftsPunkte`]
          const passenderMeisterschaftsPunkt =
            meisterschaftsPunkteInFertigkeit.find(
              (punkt) => punkt >= meisterschaft.level
            )

          if (passenderMeisterschaftsPunkt != null) {
            mutate(`${meisterschaft.fertigkeit}MeisterschaftsPunkte`, {
              type: 'remove',
              option: passenderMeisterschaftsPunkt,
            })
            mutate('meisterschaften', {
              type: 'add',
              option: name,
            })
            return
          }

          // Für allgemeine Meisterschaftspunkte kaufen
          if (
            rawAttributes.meisterschaftsPunkte > 0 &&
            meisterschaft.level === 1
          ) {
            mutate('meisterschaftsPunkte', {
              type: 'subtract',
              amount: 1,
            })
            mutate('meisterschaften', {
              type: 'add',
              option: name,
            })
            return
          }

          const fertigkeitPunkte = rawAttributes[meisterschaft.fertigkeit]
          const meisterschaftsSchwelle = Math.floor((fertigkeitPunkte - 3) / 3)
          if (meisterschaftsSchwelle < meisterschaft.level) {
            reject('Zu niedrige Meisterschaftsschwelle')
            return
          }

          const freieErfahrungspunkte =
            rawAttributes.erfahrungspunkte -
            rawAttributes.erfahrungspunkteEingesetzt

          if (freieErfahrungspunkte < 15) {
            reject('Zu wenig Erfahrungspunkte')
            return
          }

          mutate('meisterschaften', {
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
