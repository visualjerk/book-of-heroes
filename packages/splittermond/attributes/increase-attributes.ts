import { attributesDefinition } from './attributes'

export const attributeSteigernDefinition = attributesDefinition
  .addAttributes({
    attributPunkte: { type: 'number' },
  })
  .addEvents(
    {
      attributSteigernMitPunkt: {
        attribute: 'group.attributes',
      },
    },
    {
      attributSteigernMitPunkt: {
        apply(
          { mutate, reject },
          { attribute },
          { rawAttributes },
          { groups }
        ) {
          if (rawAttributes.attributPunkte < 1) {
            reject('Alle Punkte sind aufgebraucht')
          }

          // Menschen dürfen 2 Attribute auf 4 setzen
          const attributeMitWert4 = groups.attributes.filter(
            (key) => rawAttributes[key] >= 4
          ).length
          const erlaubtMitWert4 = rawAttributes.rasse === 'mensch' ? 2 : 1
          let maxWert = attributeMitWert4 < erlaubtMitWert4 ? 4 : 3

          // Varge dürfen Stärke nicht auf 4 setzen (haben bereits +2 auf Stärke)
          if (attribute === 'strength' && rawAttributes.rasse === 'varg') {
            maxWert = 3
          }

          if (rawAttributes[attribute] >= maxWert) {
            reject('Maximalpunkte erreicht')
          }
          mutate('attributPunkte', {
            type: 'subtract',
            amount: 1,
          })
          mutate(attribute, {
            type: 'add',
            amount: 1,
          })
        },
      },
    }
  )
