import { mapToAttributeDefinitions } from '@boh/character'
import { fertigkeitenSteigernDefinition } from '../skills/increase-skills'
import { magieschulen } from './magicschools'
import { zauberNachNamen, zauberNamenInSchule } from './spells'

const magieschulenZauber =
  magieschulen.map<`${typeof magieschulen[number]}Zauber`>(
    (schule) => `${schule}Zauber`
  )

export const zauberLernenDefinition = fertigkeitenSteigernDefinition
  .addAttributes({
    ...mapToAttributeDefinitions(
      magieschulen,
      (schule) => ({
        type: 'multi-select',
        options: zauberNamenInSchule(schule),
      }),
      (schule) => `${schule}Zauber`
    ),
  })
  .addAttributeGroups({
    magieschulenZauber: magieschulenZauber,
  })
  .addEvents(
    {
      zauberLernen: {
        schule: 'group.magieSchulen',
        name: 'group.magieschulenZauber.value',
      },
    },
    {
      zauberLernen: {
        apply(
          { reject, mutate },
          { schule, name },
          { attributes, rawAttributes }
        ) {
          const zauber = zauberNachNamen(name)
          if (!zauber) {
            reject('Zauber nicht vorhanden')
            return
          }

          const zauberSchule = zauber.schulen.find((a) => a.includes(schule))
          if (!zauberSchule) {
            reject('Zauber für diese Schule nicht möglich')
            return
          }

          const fertigkeitPunkte = rawAttributes[schule]
          if (fertigkeitPunkte < 1) {
            reject('Zauberschule nicht gelernt')
            return
          }

          const moeglicherZauberGrad = Math.floor(fertigkeitPunkte / 3)
          const zauberGrad = Number(zauberSchule.split(' ')[1])
          if (moeglicherZauberGrad < zauberGrad) {
            reject('Zu niedriger Zaubergrad')
            return
          }

          // Lernen mit Zauberpunkt
          const zauberPunkteInSchule = rawAttributes[`${schule}ZauberPunkte`]
          const passenderZauberPunkt = zauberPunkteInSchule.find(
            (punkt) => punkt >= zauberGrad
          )

          if (passenderZauberPunkt != null) {
            mutate(`${schule}ZauberPunkte`, {
              type: 'remove',
              option: passenderZauberPunkt,
            })
            mutate(`${schule}Zauber`, {
              type: 'add',
              option: name,
            })
            return
          }

          // Lernen mit Erfahrungspunkten
          const erfahrungspunktKosten = Math.max(1, zauberGrad * 3)
          const freieErfahrungspunkte =
            attributes.erfahrungspunkte - attributes.erfahrungspunkteEingesetzt
          if (freieErfahrungspunkte < erfahrungspunktKosten) {
            reject('Nicht genug Erfahrungspunkte')
            return
          }

          mutate('erfahrungspunkteEingesetzt', {
            type: 'add',
            amount: erfahrungspunktKosten,
          })
          mutate(`${schule}Zauber`, {
            type: 'add',
            option: name,
          })
        },
      },
    }
  )
