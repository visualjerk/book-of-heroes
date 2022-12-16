import { isEqual } from 'lodash-es'
import { nanoid } from 'nanoid'
import { DeepReadonly } from '@boh/utils'
import {
  AttributeGroupDefinitions,
  AttributeState,
  UnknownAttributeDefinitions,
  AttributeValue,
  AttributeMutation,
  TextAttributeMutation,
  NumberAttributeMutation,
  SingleSelectAttributeMutation,
  SingleSelectAttributeDefinition,
  MultiSelectAttributeMutation,
  MultiSelectAttributeDefinition,
  KeyedAttributeMutations,
} from './attributes'
import {
  HistoryMutationError,
  NotFoundError,
  RevertError,
  ValidationError,
} from './errors'
import {
  EventDefinitions,
  EventImpls,
  EventHistory,
  ResolvedPayload,
  EventInstance,
  EventId,
  EventRejection,
  EventRequest,
} from './events'

export interface CharacterState<
  TAttributeDefinitions extends UnknownAttributeDefinitions
> {
  rawAttributes: AttributeState<TAttributeDefinitions>
  attributes: DeepReadonly<AttributeState<TAttributeDefinitions>>
}

export type AttributeCalculations<
  TAttributeDefinitions extends UnknownAttributeDefinitions
> = {
  [Key in keyof TAttributeDefinitions]?: (
    currentState: Readonly<CharacterState<TAttributeDefinitions>>
  ) => AttributeValue<TAttributeDefinitions[Key]>
}

export type CharacterDefinition<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TAttributeCalculations extends AttributeCalculations<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>,
  TEventImpls extends EventImpls<TAttributes, TAttributeGroups, TEvents>
> = {
  attributes: TAttributes
  groups: TAttributeGroups
  calculations: TAttributeCalculations
  events: TEvents
  eventImplementations: TEventImpls
}

export const defineCharacter = <
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TAttributeCalculations extends AttributeCalculations<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>,
  TEventImpls extends EventImpls<TAttributes, TAttributeGroups, TEvents>
>(
  attributes: TAttributes,
  groups: TAttributeGroups,
  calculations: TAttributeCalculations,
  events: TEvents,
  eventImplementations: TEventImpls
) => ({
  attributes,
  groups,
  calculations,
  events,
  eventImplementations,
  addEvents: <
    TNewEvents extends EventDefinitions<TAttributes, TAttributeGroups>,
    TNewEventImpls extends EventImpls<TAttributes, TAttributeGroups, TNewEvents>
  >(
    newEvents: TNewEvents,
    newEventImplementations: TNewEventImpls
  ) =>
    defineCharacter(
      attributes,
      groups,
      calculations,
      { ...events, ...newEvents },
      { ...eventImplementations, ...newEventImplementations }
    ),
  addAttributes: <TNewAttributes extends UnknownAttributeDefinitions>(
    newAttributes: TNewAttributes
  ) =>
    defineCharacter(
      { ...attributes, ...newAttributes },
      groups,
      calculations,
      events,
      eventImplementations
    ),
  addAttributeGroups: <
    TNewAttributeGroups extends AttributeGroupDefinitions<TAttributes>
  >(
    newAttributesGroups: TNewAttributeGroups
  ) =>
    defineCharacter(
      attributes,
      { ...groups, ...newAttributesGroups },
      calculations,
      events,
      eventImplementations
    ),
  addAttributeCalculations: <
    TNewAttributeCalculations extends AttributeCalculations<TAttributes>
  >(
    newAttributesCalculations: TNewAttributeCalculations
  ) =>
    defineCharacter(
      attributes,
      groups,
      { ...calculations, ...newAttributesCalculations },
      events,
      eventImplementations
    ),
  enhance: <
    TNewAttributes extends UnknownAttributeDefinitions,
    TNewAttributeGroups extends AttributeGroupDefinitions<
      TAttributes & TNewAttributes
    >,
    TNewAttributeCalculations extends AttributeCalculations<
      TAttributes & TNewAttributes
    >,
    TNewEvents extends EventDefinitions<
      TAttributes & TNewAttributes,
      TAttributeGroups & TNewAttributeGroups
    >,
    TNewEventImpls extends EventImpls<
      TAttributes & TNewAttributes,
      TAttributeGroups & TNewAttributeGroups,
      TNewEvents
    >
  >(
    newAttributes: TNewAttributes,
    newGroups: TNewAttributeGroups,
    newCalculations: TNewAttributeCalculations,
    newEvents: TNewEvents,
    newEventImplementations: TNewEventImpls
  ) =>
    defineCharacter(
      {
        ...attributes,
        ...newAttributes,
      },
      {
        ...groups,
        ...newGroups,
      },
      {
        ...calculations,
        ...newCalculations,
      },
      {
        ...events,
        ...newEvents,
      },
      { ...eventImplementations, ...newEventImplementations }
    ),
})

export class Character<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TAttributeCalculations extends AttributeCalculations<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>,
  TEventImpls extends EventImpls<TAttributes, TAttributeGroups, TEvents>
> {
  definition: CharacterDefinition<
    TAttributes,
    TAttributeGroups,
    TAttributeCalculations,
    TEvents,
    TEventImpls
  >

  history = new EventHistory<TAttributes, TAttributeGroups, TEvents>()
  rawAttributes!: AttributeState<TAttributes>
  attributes!: DeepReadonly<AttributeState<TAttributes>>

  constructor(
    definition: CharacterDefinition<
      TAttributes,
      TAttributeGroups,
      TAttributeCalculations,
      TEvents,
      TEventImpls
    >
  ) {
    this.definition = definition
    this.resetState()
  }

  get state() {
    return {
      rawAttributes: this.rawAttributes,
      attributes: this.attributes,
    }
  }

  // TODO: make private (check SplittermondView.vue and useEventButton for Error)
  resetState() {
    const definition = this.definition
    const rawAttributes = Object.entries(definition.attributes).reduce(
      (previousValue, [key, value]) => {
        switch (value.type) {
          case 'number':
            previousValue[key] = 0
            break
          case 'text':
            previousValue[key] = ''
            break
          case 'single-select':
            previousValue[key] = value.options[0]
            break
          case 'multi-select':
            previousValue[key] = []
        }

        return previousValue
      },
      {} as Record<string, unknown>
    ) as AttributeState<TAttributes>
    this.rawAttributes = rawAttributes

    const attributes = Object.defineProperties(
      {},
      Object.fromEntries(
        Object.keys(definition.attributes).map<[string, PropertyDescriptor]>(
          (id) => [
            id,
            {
              get() {
                const method = definition.calculations[id]

                if (method == null) {
                  return rawAttributes[id]
                }
                return method({ rawAttributes, attributes })
              },
            },
          ]
        )
      )
    ) as DeepReadonly<AttributeState<TAttributes>>
    this.attributes = attributes
  }

  getEventResults<TEventType extends keyof TEvents>(
    type: TEventType,
    payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TEventType]>
  ) {
    const eventImpl = this.definition.eventImplementations[type]

    const rejections: EventRejection[] = []
    const reject = (string: EventRejection) => {
      rejections.push(string)
    }

    const mutations: KeyedAttributeMutations<TAttributes> = []
    const mutate = <TKey extends keyof TAttributes>(
      key: TKey,
      mutation: AttributeMutation<TAttributes[TKey]>
    ) => {
      mutations.push({
        key,
        mutation,
      })
    }

    eventImpl.apply(
      { reject, mutate },
      payload,
      this.state,
      this.definition,
      this.history
    )

    return {
      rejections,
      mutations,
    }
  }

  validate<TEventType extends keyof TEvents>(
    type: TEventType,
    payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TEventType]>
  ) {
    const { rejections } = this.getEventResults(type, payload)

    // TODO: refine results
    if (rejections.length > 0) {
      return rejections[0]
    }
    return true
  }

  execute<TEventType extends keyof TEvents>(
    type: TEventType,
    payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TEventType]>
  ) {
    return this.applyAndAdd({
      id: nanoid(),
      timestamp: '',
      type,
      payload,
      mutations: [],
    })
  }

  applyAndAdd(event: EventInstance<TAttributes, TAttributeGroups, TEvents>) {
    const eventRequest: EventRequest<TAttributes, TAttributeGroups, TEvents> = {
      type: event.type,
      payload: event.payload,
    }

    const applyResult = this.apply(eventRequest)

    if (applyResult instanceof ValidationError) {
      return applyResult
    }

    const mutatedEvent: EventInstance<TAttributes, TAttributeGroups, TEvents> =
      {
        ...event,
        mutations: applyResult,
      }

    this.history.add(mutatedEvent)
    return applyResult
  }

  apply(event: EventRequest<TAttributes, TAttributeGroups, TEvents>) {
    const { rejections, mutations } = this.getEventResults(
      event.type,
      event.payload
    )

    if (rejections.length > 0) {
      return new ValidationError(rejections[0])
    }

    mutations.forEach(({ key, mutation }) => this.mutate(key, mutation))
    return mutations
  }

  mutate<TKey extends keyof TAttributes>(
    key: TKey,
    mutation: AttributeMutation<TAttributes[TKey]>
  ) {
    const { type } = this.definition.attributes[key]

    // TODO: this is horrible :D
    if (type === 'text') {
      ;(this.rawAttributes[key] as string) = (
        mutation as TextAttributeMutation
      ).value
      return
    }

    if (type === 'single-select') {
      ;(this.rawAttributes[key] as string | number) = (
        mutation as SingleSelectAttributeMutation<SingleSelectAttributeDefinition>
      ).option
      return
    }

    if (type === 'number') {
      const { type: mType, amount } = mutation as NumberAttributeMutation
      if (mType === 'add') {
        ;(this.rawAttributes[key] as number) += amount
      } else {
        ;(this.rawAttributes[key] as number) -= amount
      }
      return
    }

    if (type === 'multi-select') {
      const { type: mType, option } =
        mutation as MultiSelectAttributeMutation<MultiSelectAttributeDefinition>
      if (mType === 'add') {
        ;(this.rawAttributes[key] as any[]).push(option)
      } else {
        const index = (this.rawAttributes[key] as any[]).findIndex(
          (a: any) => a === option
        )
        if (index > -1) {
          ;(this.rawAttributes[key] as any[]).splice(index, 1)
        }
      }
      return
    }
  }

  validateRevert<TEventType extends keyof TEvents>(
    type: TEventType,
    payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TEventType]>
  ) {
    const event = this.history.findLast(type, payload)

    if (!event) {
      return new NotFoundError(`Event with type '${type}' not found.`)
    }

    return this.validateRevertById(event.id)
  }

  revert<TEventType extends keyof TEvents>(
    type: TEventType,
    payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TEventType]>
  ) {
    const event = this.history.findLast(type, payload)

    if (!event) {
      return new NotFoundError(`Event with type '${type}' not found.`)
    }

    return this.revertById(event.id)
  }

  getRevertResult(id: EventId) {
    if (!this.history.has(id)) {
      return new NotFoundError(`Event with id '${id}' not found.`)
    }

    const revertError = new RevertError<
      TAttributes,
      TAttributeGroups,
      TEvents
    >()

    const testChar = new Character(this.definition)
    const history = this.history.copy()
    history.remove(id)
    history.forEach((event) => {
      const applyResult = testChar.applyAndAdd(event)
      if (applyResult instanceof ValidationError) {
        revertError.add(event, applyResult)
        return
      }
      if (!isEqual(event.mutations, applyResult)) {
        revertError.add(
          event,
          new HistoryMutationError('Would change mutation')
        )
        history.mutate(event.id, applyResult)
      }
    })

    return {
      revertError,
      history,
    }
  }

  validateRevertById(id: EventId) {
    const revertResult = this.getRevertResult(id)

    if (revertResult instanceof NotFoundError) {
      return revertResult
    }

    const { revertError } = revertResult

    return revertError.hasErrors() ? revertError : true
  }

  revertById(id: EventId) {
    const revertResult = this.getRevertResult(id)

    if (revertResult instanceof NotFoundError) {
      return revertResult
    }

    const { revertError, history } = revertResult

    if (revertError.isNotIgnorable()) {
      return revertError
    }

    this.resetState()
    this.history.reset()
    history.forEach((event) => this.applyAndAdd(event))
  }

  getAttribute(key: keyof TAttributes) {
    return {
      value: this.attributes[key],
      rawValue: this.rawAttributes[key],
    }
  }
}
