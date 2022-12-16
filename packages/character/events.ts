import { isEqual, cloneDeep } from 'lodash-es'
import {
  UnknownAttributeDefinition,
  UnknownAttributeDefinitions,
  AttributeGroupDefinitions,
  AttributeValue,
  MultiSelectAttributeDefinition,
  AttributeMutation,
  KeyedAttributeMutations,
} from './attributes'
import { CharacterState } from './character'

export type PayloadAttributeValue<
  TAttribute extends UnknownAttributeDefinition
> = TAttribute extends MultiSelectAttributeDefinition
  ? TAttribute['options'][number]
  : AttributeValue<TAttribute>

export type AllowedPayloadTypeMap<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>
> = {
  number: number
  string: string
  boolean: boolean
  attributeId: keyof TAttributes
} & {
  [Key in keyof TAttributeGroups as `group.${Key}`]: TAttributeGroups[Key][number]
} & {
  [Key in keyof TAttributes as `${Key}.value`]: PayloadAttributeValue<
    TAttributes[Key]
  >
} & {
  [Key in keyof TAttributeGroups as `group.${Key}.value`]: PayloadAttributeValue<
    TAttributes[TAttributeGroups[Key][number]]
  >
}

export type ResolvedPayload<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TPayloadDefinition extends Record<
    string,
    keyof AllowedPayloadTypeMap<TAttributes, TAttributeGroups>
  >
> = {
  [Key in keyof TPayloadDefinition]: AllowedPayloadTypeMap<
    TAttributes,
    TAttributeGroups
  >[TPayloadDefinition[Key]]
}

export type EventDefinitions<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>
> = Record<
  string,
  Record<string, keyof AllowedPayloadTypeMap<TAttributes, TAttributeGroups>>
>

export type EventRejection = string

export type EventImpls<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TEventDefinitions extends EventDefinitions<TAttributes, TAttributeGroups>
> = {
  [Key in keyof TEventDefinitions]: {
    apply: (
      {
        reject,
        mutate,
      }: {
        reject: (reason: EventRejection) => void
        mutate: <TKey extends keyof TAttributes>(
          attributeKey: TKey,
          mutation: AttributeMutation<TAttributes[TKey]>
        ) => void
      },
      payload: ResolvedPayload<
        TAttributes,
        TAttributeGroups,
        TEventDefinitions[Key]
      >,
      // TODO make this readonly
      state: CharacterState<TAttributes>,
      definition: {
        groups: TAttributeGroups
      },
      history: EventHistory<TAttributes, TAttributeGroups, TEventDefinitions>
    ) => void
  }
}

export type UniqueId = string
export type EventId = UniqueId
export type Timestamp = string

export interface EventRequest<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>,
  TKey extends keyof TEvents = keyof TEvents
> {
  type: TKey
  payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TKey]>
}

export interface EventInstance<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>,
  TKey extends keyof TEvents = keyof TEvents
> {
  id: EventId
  type: TKey
  timestamp: Timestamp
  payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TKey]>
  mutations: KeyedAttributeMutations<TAttributes>
}

export class EventHistory<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>
> {
  events: Map<EventId, EventInstance<TAttributes, TAttributeGroups, TEvents>> =
    new Map()

  constructor(
    events: EventInstance<TAttributes, TAttributeGroups, TEvents>[] = []
  ) {
    this.events = new Map(events.map((event) => [event.id, event]))
  }

  reset() {
    this.events = new Map()
  }

  toArray() {
    return cloneDeep([...this.events.values()])
  }

  copy() {
    return new EventHistory(this.toArray())
  }

  add(event: EventInstance<TAttributes, TAttributeGroups, TEvents>) {
    this.events.set(event.id, event)
  }

  remove(id: EventId) {
    this.events.delete(id)
  }

  get(id: EventId) {
    return this.events.get(id)
  }

  has(id: EventId) {
    return this.events.has(id)
  }

  mutate(id: EventId, mutations: KeyedAttributeMutations<TAttributes>) {
    const event = cloneDeep(this.get(id))
    if (!event) {
      return
    }
    event.mutations = mutations
    this.add(event)
  }

  // TODO: Refactor to `.at` when vitest assertions guard against undefined
  at(index: number) {
    return this.toArray()[index]
  }

  findLast<TEventType extends keyof TEvents>(
    type: TEventType,
    payload: ResolvedPayload<TAttributes, TAttributeGroups, TEvents[TEventType]>
  ) {
    const event = this.toArray()
      .reverse()
      .find((entry) => {
        return type === entry.type && isEqual(payload, entry.payload)
      })
    return event
  }

  filter(
    predicate: (
      event: EventInstance<TAttributes, TAttributeGroups, TEvents>
    ) => boolean
  ) {
    return this.toArray().filter(predicate)
  }

  some(
    predicate: (
      event: EventInstance<TAttributes, TAttributeGroups, TEvents>
    ) => boolean
  ) {
    return this.toArray().some(predicate)
  }

  forEach(
    callback: (
      event: EventInstance<TAttributes, TAttributeGroups, TEvents>
    ) => void
  ) {
    this.events.forEach((event) => callback(event))
  }
}
