import { attributeDefinition } from './attributes'

export const attributeSteigernDefinition = attributeDefinition
  .addAttributes({
    attributPunkte: { type: 'number' },
  })
  .addEvents(
    {
      attributSteigernMitPunkt: {
        attribut: 'group.attribute',
      },
    },
    {
      attributSteigernMitPunkt: {
        apply({ mutate, reject }, { attribut }, { rawAttributes }, { groups }) {
          if (rawAttributes.attributPunkte < 1) {
            reject('Alle Punkte sind aufgebraucht')
          }

          // Menschen dürfen 2 Attribute auf 4 setzen
          const attributeMitWert4 = groups.attribute.filter(
            (key) => rawAttributes[key] >= 4
          ).length
          const erlaubtMitWert4 = rawAttributes.rasse === 'mensch' ? 2 : 1
          let maxWert = attributeMitWert4 < erlaubtMitWert4 ? 4 : 3

          // Varge dürfen Stärke nicht auf 4 setzen (haben bereits +2 auf Stärke)
          if (attribut === 'strength' && rawAttributes.rasse === 'varg') {
            maxWert = 3
          }

          if (rawAttributes[attribut] >= maxWert) {
            reject('Maximalpunkte erreicht')
          }
          mutate('attributPunkte', {
            type: 'subtract',
            amount: 1,
          })
          mutate(attribut, {
            type: 'add',
            amount: 1,
          })
        },
      },
    }
  )
