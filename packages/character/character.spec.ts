import { describe, it, expect } from 'vitest'
import { Character, defineCharacter } from './character'
import { HistoryMutationError, NotFoundError, RevertError } from './errors'

const characterDefinition = defineCharacter(
  {
    xp: { type: 'number' },
    name: { type: 'text' },
    intelligence: { type: 'number' },
    stamina: { type: 'number' },
    climbing: { type: 'number' },
    size: { type: 'number' },
    speed: { type: 'number' },
    race: {
      type: 'single-select',
      options: ['human', 'warg'] as const,
    },
  },
  {
    basic: ['xp', 'name', 'race'],
    attribute: ['intelligence', 'stamina'],
    derived: ['speed'],
    abilities: ['climbing'],
  },
  {
    climbing: (currentState) => {
      const { rawAttributes, attributes } = currentState
      return (
        attributes.intelligence + attributes.stamina + rawAttributes.climbing
      )
    },
    size: ({ attributes }) => {
      return attributes.race === 'warg' ? 5 : 4
    },
    speed: ({ attributes, rawAttributes }) => {
      return attributes.size + rawAttributes.speed
    },
  },
  {
    'add-xp': {
      amount: 'number',
    },
    'purchase-attribute': {
      attributeId: 'group.attribute',
    },
    'purchase-ability': {
      abilityId: 'group.abilities',
    },
    'purchase-ability-complex': {
      abilityId: 'group.abilities',
    },
  },
  {
    'add-xp': {
      apply: ({ mutate }, { amount }) => {
        mutate('xp', {
          type: 'add',
          amount,
        })
      },
    },
    'purchase-attribute': {
      apply: ({ reject, mutate }, { attributeId }, state) => {
        if (state.attributes.xp < 5) {
          reject('No no, not xp enough')
        }

        mutate('xp', {
          type: 'subtract',
          amount: 5,
        })
        mutate(attributeId, {
          type: 'add',
          amount: 1,
        })
      },
    },
    'purchase-ability': {
      apply: ({ reject, mutate }, { abilityId }, state) => {
        const canPurchaseForFree = state.rawAttributes.stamina >= 3
        const canPurchaseWithXp = state.rawAttributes.xp >= 5

        if (!canPurchaseForFree && !canPurchaseWithXp) {
          reject('Not enough xp and attribute points')
        }

        if (!canPurchaseForFree) {
          mutate('xp', {
            type: 'subtract',
            amount: 5,
          })
        }

        mutate(abilityId, {
          type: 'add',
          amount: 1,
        })
      },
    },
    'purchase-ability-complex': {
      apply: ({ reject, mutate }, { abilityId }, state, _, history) => {
        const possibleFreePurchases = state.rawAttributes.stamina
        const freePurchases = history.filter((event) => {
          if (event.type !== 'purchase-ability-complex') {
            return false
          }
          return !event.mutations.some((mutation) => mutation.key === 'xp')
        }).length

        const canPurchaseForFree = possibleFreePurchases > freePurchases
        const canPurchaseWithXp = state.rawAttributes.xp >= 5

        if (!canPurchaseForFree && !canPurchaseWithXp) {
          reject('Not enough xp and attribute points')
        }

        if (!canPurchaseForFree) {
          mutate('xp', {
            type: 'subtract',
            amount: 5,
          })
        }

        mutate(abilityId, {
          type: 'add',
          amount: 1,
        })
      },
    },
  }
)

describe('defineCharacter', () => {
  it('can be enhanced', () => {
    const newDefinition = characterDefinition.enhance(
      {
        foo: {
          type: 'number',
        },
      },
      {
        fooGroup: ['foo', 'climbing'],
      },
      {},
      {},
      {}
    )
    expect(newDefinition.attributes).toEqual({
      ...characterDefinition.attributes,
      foo: {
        type: 'number',
      },
    })
    expect(newDefinition.groups).toEqual({
      ...characterDefinition.groups,
      fooGroup: ['foo', 'climbing'],
    })
  })

  it('can add events', () => {
    const newDefinition = characterDefinition.addEvents(
      {
        'change-climbing': {
          value: 'climbing.value',
        },
      },
      {
        'change-climbing': {
          apply({ mutate }, { value }) {
            mutate('climbing', {
              type: 'add',
              amount: value,
            })
          },
        },
      }
    )
    expect(newDefinition.events).toEqual({
      ...characterDefinition.events,
      'change-climbing': {
        value: 'climbing.value',
      },
    })
    expect(newDefinition.eventImplementations).toEqual({
      ...characterDefinition.eventImplementations,
      'change-climbing': {
        apply: expect.any(Function),
      },
    })
  })
})

describe('Character', () => {
  function setupTest() {
    const char = new Character(characterDefinition)
    function addXp(amount: number) {
      char.execute('add-xp', {
        amount,
      })
    }
    function purchaseStamina() {
      char.execute('purchase-attribute', {
        attributeId: 'stamina',
      })
    }
    function purchaseIntelligence() {
      char.execute('purchase-attribute', {
        attributeId: 'intelligence',
      })
    }
    function purchaseAbility() {
      char.execute('purchase-ability', {
        abilityId: 'climbing',
      })
    }
    function purchaseAbilityComplex() {
      char.execute('purchase-ability-complex', {
        abilityId: 'climbing',
      })
    }

    return {
      char,
      addXp,
      purchaseStamina,
      purchaseIntelligence,
      purchaseAbility,
      purchaseAbilityComplex,
    }
  }

  it('can calculate attributes', () => {
    const char = new Character(characterDefinition)
    char.rawAttributes.intelligence = 10
    char.rawAttributes.stamina = 5
    expect(char.attributes.climbing).toBe(15)
    char.rawAttributes.climbing = 5
    expect(char.attributes.climbing).toBe(20)
  })

  it('can calculate attributes', () => {
    const char = new Character(characterDefinition)
    char.rawAttributes.race = 'warg'
    expect(char.attributes.speed).toBe(5)
    char.rawAttributes.race = 'human'
    expect(char.attributes.speed).toBe(4)
    char.rawAttributes.speed = 5
    expect(char.attributes.speed).toBe(9)
  })

  it('respects race', () => {
    const char = new Character(characterDefinition)
    char.rawAttributes.race = 'warg'
    expect(char.attributes.size).toBe(5)
    char.rawAttributes.race = 'human'
    expect(char.attributes.size).toBe(4)
  })

  it('add xp', () => {
    const char = new Character(characterDefinition)

    char.rawAttributes.xp = 0
    expect(char.attributes.xp).toBe(0)

    char.execute('add-xp', {
      amount: 10,
    })

    expect(char.attributes.xp).toBe(10)
  })

  it('can purchase attribute', () => {
    const char = new Character(characterDefinition)
    char.execute('purchase-attribute', {
      attributeId: 'stamina',
    })
    expect(char.attributes.stamina).toBe(0)
    char.execute('add-xp', {
      amount: 20,
    })
    char.execute('purchase-attribute', {
      attributeId: 'stamina',
    })
    expect(char.attributes.stamina).toBe(1)
  })

  it('persists events', () => {
    const { char, addXp } = setupTest()
    addXp(20)
    expect(char.history.toArray()[0]).toEqual(
      expect.objectContaining({
        id: expect.anything(),
        type: 'add-xp',
        timestamp: expect.anything(),
        payload: {
          amount: 20,
        },
      })
    )
  })

  describe('revertById', () => {
    it('can remove event', () => {
      const { char, addXp } = setupTest()
      addXp(20)
      const event = char.history.at(0)
      expect(event).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          type: 'add-xp',
          timestamp: expect.anything(),
          payload: {
            amount: 20,
          },
        })
      )

      char.revertById(event.id)
      expect(char.history.at(0)).toBeUndefined()
      expect(char.attributes.xp).toBe(0)
    })

    it('keeps other events', () => {
      const { char, addXp } = setupTest()
      addXp(20)
      addXp(30)
      const event = char.history.at(0)
      char.revertById(event.id)
      expect(char.history.at(0)).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          type: 'add-xp',
          timestamp: expect.anything(),
          payload: {
            amount: 30,
          },
        })
      )
      expect(char.attributes.xp).toBe(30)
    })

    it('does not revert if history becomes invalid', () => {
      const { char, addXp, purchaseStamina } = setupTest()
      addXp(20)
      purchaseStamina()
      const event = char.history.at(0)
      char.revertById(event.id)
      expect(char.history.at(0)).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          type: 'add-xp',
          timestamp: expect.anything(),
          payload: {
            amount: 20,
          },
        })
      )
      expect(char.history.at(1)).toEqual(
        expect.objectContaining({
          id: expect.anything(),
          type: 'purchase-attribute',
          timestamp: expect.anything(),
          payload: {
            attributeId: 'stamina',
          },
        })
      )
      expect(char.attributes.xp).toBe(15)
      expect(char.attributes.stamina).toBe(1)
    })

    it('keeps event ids', () => {
      const { char, addXp } = setupTest()
      addXp(20)
      addXp(30)
      const firstEvent = char.history.at(0)
      const event = char.history.at(1)
      char.revertById(event.id)
      expect(char.history.at(0).id).toBe(firstEvent.id)
    })

    it('returns validation errors', () => {
      const { char, addXp, purchaseStamina } = setupTest()
      addXp(20)
      purchaseStamina()
      const event = char.history.at(0)
      const result = char.revertById(event.id)
      expect(result).toBeInstanceOf(RevertError)
      if (!(result instanceof RevertError)) {
        return
      }
      const error = result.errors[0]
      expect(error[0]).toBe(char.history.at(1).id)
      expect(error[1].message).toBe('No no, not xp enough')
    })
  })

  describe('revert', () => {
    it('can revert event by type and payload', () => {
      const { char, addXp, purchaseStamina, purchaseIntelligence } = setupTest()
      addXp(20)
      purchaseStamina()
      purchaseIntelligence()
      purchaseStamina()
      char.revert('purchase-attribute', {
        attributeId: 'intelligence',
      })
      expect(char.attributes.intelligence).toBe(0)
      expect(char.attributes.stamina).toBe(2)
    })

    it('handles mutation that depends on history', () => {
      const { char, addXp, purchaseStamina, purchaseAbilityComplex } =
        setupTest()
      addXp(20)
      purchaseStamina()
      purchaseStamina()
      purchaseAbilityComplex()
      purchaseAbilityComplex()

      const event = char.history.findLast('purchase-ability-complex', {
        abilityId: 'climbing',
      })
      expect(event?.mutations.some((a) => a.key === 'xp')).toBe(false)

      char.revert('purchase-attribute', {
        attributeId: 'stamina',
      })
      expect(char.rawAttributes.stamina).toBe(1)
      expect(char.rawAttributes.climbing).toBe(2)
      expect(char.rawAttributes.xp).toBe(10)
      const eventNew = char.history.findLast('purchase-ability-complex', {
        abilityId: 'climbing',
      })
      expect(eventNew?.mutations.some((a) => a.key === 'xp')).toBe(true)
    })
  })

  describe('validateRevert', () => {
    it('can validate revert', () => {
      const { char, addXp, purchaseStamina } = setupTest()
      addXp(5)
      purchaseStamina()
      const result = char.validateRevert('add-xp', {
        amount: 5,
      })
      expect(result).not.toBe(true)
      addXp(5)
      const result2 = char.validateRevert('add-xp', {
        amount: 5,
      })
      expect(result2).toBe(true)
    })

    it('returns mutation errors', () => {
      const { char, addXp, purchaseStamina, purchaseAbility } = setupTest()
      addXp(20)
      purchaseStamina()
      purchaseStamina()
      purchaseStamina()
      purchaseAbility()

      const result = char.validateRevert('purchase-attribute', {
        attributeId: 'stamina',
      })
      expect(result).not.toBe(true)
      if (result === true || result instanceof NotFoundError) {
        return
      }
      expect(result.errors[0][1]).toBeInstanceOf(HistoryMutationError)

      purchaseStamina()
      const result2 = char.validateRevert('purchase-attribute', {
        attributeId: 'stamina',
      })
      expect(result2).toBe(true)
    })

    it('validates mutation that depends on history', () => {
      const { char, addXp, purchaseStamina, purchaseAbilityComplex } =
        setupTest()
      addXp(30)
      purchaseStamina()
      purchaseStamina()
      purchaseAbilityComplex()
      purchaseAbilityComplex()

      const result = char.validateRevert('purchase-attribute', {
        attributeId: 'stamina',
      })
      expect(result).not.toBe(true)
      if (result === true || result instanceof NotFoundError) {
        return
      }
      expect(result.errors[0][1]).toBeInstanceOf(HistoryMutationError)

      purchaseStamina()
      const result2 = char.validateRevert('purchase-attribute', {
        attributeId: 'stamina',
      })
      expect(result2).toBe(true)
    })
  })
})
