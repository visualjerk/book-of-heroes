import { describe, expect, it } from 'vitest'
import { createTestSetup } from '@boh/character'
import { attribute } from './attributes'
import { attributeSteigernDefinition } from './increase-attributes'

describe('AttributeSteigern', () => {
  function setupTest(initialPoints = 10) {
    const { setupTest } = createTestSetup(attributeSteigernDefinition)
    const { character, getRawValue } = setupTest({
      attributPunkte: initialPoints,
    })

    const execute = (attribut: typeof attribute[number] = 'charisma') =>
      character.execute('attributSteigernMitPunkt', {
        attribut,
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
    expect(getValue('attributPunkte')).toBe(0)
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

  it.each(attribute)('works for attribute "%s"', (attribut) => {
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
    character.rawAttributes.rasse = 'mensch'
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
    character.rawAttributes.rasse = 'varg'
    execute('strength')
    execute('strength')
    execute('strength')
    expect(execute('strength')).toBeInstanceOf(Error)
    expect(getValue('strength')).toBe(3)
  })
})
