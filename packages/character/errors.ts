import {
  UnknownAttributeDefinitions,
  AttributeGroupDefinitions,
} from './attributes'
import { EventId, EventInstance, EventDefinitions } from './events'
export class NotFoundError extends Error {}
export class ValidationError extends Error {}
export class HistoryMutationError extends Error {}

export class RevertError<
  TAttributes extends UnknownAttributeDefinitions,
  TAttributeGroups extends AttributeGroupDefinitions<TAttributes>,
  TEvents extends EventDefinitions<TAttributes, TAttributeGroups>
> extends Error {
  errors: [EventId, ValidationError | HistoryMutationError][] = []
  context: Record<
    EventId,
    EventInstance<TAttributes, TAttributeGroups, TEvents>
  > = {}

  constructor() {
    super()
  }

  add(
    event: EventInstance<TAttributes, TAttributeGroups, TEvents>,
    error: ValidationError | HistoryMutationError
  ) {
    this.errors.push([event.id, error])
    this.context[event.id] = event
  }

  get message() {
    return this.errors
      .map(([id, error]) => {
        const event = this.context[id]
        return `Would result in rejection of "${
          event.type
        }" with payload "${JSON.stringify(event.payload)}" and id "${id}": ${
          error.message
        }`
      })
      .join(' | ')
  }

  hasErrors() {
    return this.errors.length > 0
  }

  isNotIgnorable() {
    return this.hasErrors() && !this.isIgnorable()
  }

  isIgnorable() {
    return this.errors.every(
      ([_, error]) => error instanceof HistoryMutationError
    )
  }
}
