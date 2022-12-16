import { DeepReadonly } from './../util/UtilityTypes'
import { expect } from 'vitest'
import {
  UnknownAttributeDefinitions,
  AttributeGroupDefinitions,
  AttributeState,
} from './attributes'
import {
  AttributeCalculations,
  CharacterDefinition,
  Character,
} from './character'
import { EventDefinitions, EventImpls } from './events'

export function createTestSetup<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TAttributeCalculations extends AttributeCalculations<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>,
  TEventImpls extends EventImpls<TAttributes, TAttributeGroups, TEvents>
>(
  definition: CharacterDefinition<
    TAttributes,
    TAttributeGroups,
    TAttributeCalculations,
    TEvents,
    TEventImpls
  >
) {
  function setState(
    character: Character<
      TAttributes,
      TAttributeGroups,
      TAttributeCalculations,
      TEvents,
      TEventImpls
    >,
    state: Partial<AttributeState<TAttributes>>
  ) {
    Object.entries(state).forEach(
      <TKey extends keyof AttributeState<TAttributes>>([
        attribute,
        value,
      ]: any) => {
        character.rawAttributes[attribute as TKey] = value as AttributeState<
          typeof definition['attributes']
        >[TKey]
      }
    )
  }

  function setupTest(initialState: Partial<AttributeState<TAttributes>> = {}) {
    const character = new Character(definition)
    setState(character, initialState)

    const getValue = (attribute: keyof TAttributes) =>
      character.getAttribute(attribute).value

    const getRawValue = (attribute: keyof TAttributes) =>
      character.getAttribute(attribute).rawValue

    const expectState = (
      state: DeepReadonly<Partial<AttributeState<TAttributes>>>
    ) => {
      Object.entries(state).forEach(([property, expectedValue]) => {
        const value = character.attributes[property]
        expect(value, `for property "${property}"`).toStrictEqual(expectedValue)
      })
    }

    return {
      character,
      getValue,
      getRawValue,
      setState: (state: Partial<AttributeState<TAttributes>>) =>
        setState(character, state),
      expectState,
    }
  }

  return {
    setupTest,
  }
}
