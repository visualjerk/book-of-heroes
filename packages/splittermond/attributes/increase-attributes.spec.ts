import { describe, expect, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { attributes } from './attributes'
import { increaseAttributesDefinition } from './increase-attributes'

describe('AttributeSteigern', () => {
  function setupTest(initialPoints = 10) {
    const { setupTest } = createTestSetup(increaseAttributesDefinition)
    const { character, getRawValue } = setupTest({
      attributePoints: initialPoints,
    })

    const execute = (attribute: typeof attributes[number] = 'charisma') =>
      character.execute('attributSteigernMitPunkt', {
        attribute,
      })

    return {
      character,
      execute,
      getValue: (attribute: keyof typeof character.attributes = 'charisma') =>
        getRawValue(attribute),
    }
  }

  it('fails without enough points', () => {
    const { getValue, execute } = setupTest(0)
    expect(execute()).toBeInstanceOf(Error)
    expect(getValue()).toBe(0)
  })

  it('works with enough points', () => {
    const { getValue, execute } = setupTest(1)
    expect(execute()).not.toBeInstanceOf(Error)
    expect(getValue()).toBe(1)
  })

  it('removes points', () => {
    const { getValue, execute } = setupTest(1)
    execute()
    expect(getValue('attributePoints')).toBe(0)
  })

  it('fails when reached maximum', () => {
    const { getValue, execute } = setupTest()
    execute()
    execute()
    execute()
    execute()
    expect(execute()).toBeInstanceOf(Error)
    expect(getValue()).toBe(4)
  })

  it.each(attributes)('works for attribute "%s"', (attribut) => {
    const { getValue, execute } = setupTest()
    execute(attribut)
    execute(attribut)
    expect(getValue(attribut)).toBe(2)
  })

  it('maximum for second attribute is 3', () => {
    const { getValue, execute } = setupTest()
    execute()
    execute()
    execute()
    execute()

    execute('intuition')
    execute('intuition')
    execute('intuition')

    expect(execute('intuition')).toBeInstanceOf(Error)
    expect(getValue('intuition')).toBe(3)
  })

  it('maximum for second attribute is 4 for humans', () => {
    const { character, getValue, execute } = setupTest()
    character.rawAttributes.race = 'human'
    execute()
    execute()
    execute()
    execute()

    execute('intuition')
    execute('intuition')
    execute('intuition')
    execute('intuition')

    expect(execute('intuition')).toBeInstanceOf(Error)
    expect(getValue('intuition')).toBe(4)
  })

  it('maximum for strength is 3 for vargs', () => {
    const { character, getValue, execute } = setupTest()
    character.rawAttributes.race = 'varg'
    execute('strength')
    execute('strength')
    execute('strength')
    expect(execute('strength')).toBeInstanceOf(Error)
    expect(getValue('strength')).toBe(3)
  })
})
