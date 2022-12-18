import { mapToAttributeDefinitions } from '@boh/character'
import { increaseSkillsDefinition } from '../skills/increase-skills'
import { magicschools } from './magicschools'
import { getSpellByName, getSpellNamesInSchool } from './spells'

const magicschoolsSpells =
  magicschools.map<`${typeof magicschools[number]}Spells`>(
    (school) => `${school}Spells`
  )

export const learnSpellsDefinition = increaseSkillsDefinition
  .addAttributes({
    ...mapToAttributeDefinitions(
      magicschools,
      (school) => ({
        type: 'multi-select',
        options: getSpellNamesInSchool(school),
      }),
      (school) => `${school}Spells`
    ),
  })
  .addAttributeGroups({
    magicschoolsSpells,
  })
  .addEvents(
    {
      learnSpell: {
        school: 'group.magicschools',
        name: 'group.magicschoolsSpells.value',
      },
    },
    {
      learnSpell: {
        apply(
          { reject, mutate },
          { school, name },
          { attributes, rawAttributes }
        ) {
          const spell = getSpellByName(name)
          if (!spell) {
            reject('Zauber nicht vorhanden')
            return
          }

          const magicSchool = spell.schools.find((a) => a.includes(school))
          if (!magicSchool) {
            reject('Zauber für diese Schule nicht möglich')
            return
          }

          const skillPoints = rawAttributes[school]
          if (skillPoints < 1) {
            reject('Zauberschule nicht gelernt')
            return
          }

          const possibleMagicLevel = Math.floor(skillPoints / 3)
          const magicLevel = Number(magicSchool.split(' ')[1])
          if (possibleMagicLevel < magicLevel) {
            reject('Zu niedriger Zaubergrad')
            return
          }

          // Learn by spell point
          const spellPointsInSchool = rawAttributes[`${school}SpellPoints`]
          const matchingSpellPoint = spellPointsInSchool.find(
            (punkt) => punkt >= magicLevel
          )

          if (matchingSpellPoint != null) {
            mutate(`${school}SpellPoints`, {
              type: 'remove',
              option: matchingSpellPoint,
            })
            mutate(`${school}Spells`, {
              type: 'add',
              option: name,
            })
            return
          }

          // Learn by experience points
          const xpCost = Math.max(1, magicLevel * 3)
          const freeXp =
            attributes.erfahrungspunkte - attributes.erfahrungspunkteEingesetzt
          if (freeXp < xpCost) {
            reject('Nicht genug Erfahrungspunkte')
            return
          }

          mutate('erfahrungspunkteEingesetzt', {
            type: 'add',
            amount: xpCost,
          })
          mutate(`${school}Spells`, {
            type: 'add',
            option: name,
          })
        },
      },
    }
  )
