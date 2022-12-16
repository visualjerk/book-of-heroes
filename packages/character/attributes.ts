type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

export type NumberAttributeDefinition = {
  type: 'number'
}

export type NumberAttributeMutation = {
  type: 'add' | 'subtract'
  amount: number
}

export type TextAttributeDefinition = {
  type: 'text'
}

export type TextAttributeMutation = {
  value: string
}

export type SingleSelectAttributeDefinition = {
  type: 'single-select'
  options: ReadonlyArray<string | number>
}

export type SingleSelectAttributeMutation<
  TAttributeDefinition extends SingleSelectAttributeDefinition
> = {
  option: TAttributeDefinition['options'][number]
}

export type MultiSelectAttributeDefinition = {
  type: 'multi-select'
  options: ReadonlyArray<string | number>
}

export type MultiSelectAttributeMutation<
  TAttributeDefinition extends MultiSelectAttributeDefinition
> = {
  type: 'add' | 'remove'
  option: TAttributeDefinition['options'][number]
}

export type UnknownAttributeDefinition =
  | NumberAttributeDefinition
  | TextAttributeDefinition
  | SingleSelectAttributeDefinition
  | MultiSelectAttributeDefinition

export type AttributeMutation<
  TAttributeDefinition extends UnknownAttributeDefinition
> = UnionToIntersection<
  TAttributeDefinition extends TextAttributeDefinition
    ? TextAttributeMutation
    : TAttributeDefinition extends NumberAttributeDefinition
    ? NumberAttributeMutation
    : TAttributeDefinition extends SingleSelectAttributeDefinition
    ? SingleSelectAttributeMutation<TAttributeDefinition>
    : TAttributeDefinition extends MultiSelectAttributeDefinition
    ? MultiSelectAttributeMutation<TAttributeDefinition>
    : never
>

export type KeyedAttributeMutation<
  TAttributes extends UnknownAttributeDefinitions,
  TKey extends keyof TAttributes = keyof TAttributes
> = {
  key: TKey
  mutation: AttributeMutation<TAttributes[TKey]>
}

export type KeyedAttributeMutations<
  TAttributes extends UnknownAttributeDefinitions
> = KeyedAttributeMutation<TAttributes>[]

export type UnknownAttributeDefinitions = Record<
  string,
  UnknownAttributeDefinition
>

export type AttributeValue<TAttribute extends UnknownAttributeDefinition> =
  TAttribute extends SingleSelectAttributeDefinition
    ? TAttribute['options'][number]
    : TAttribute extends MultiSelectAttributeDefinition
    ? TAttribute['options'][number][]
    : TAttribute extends NumberAttributeDefinition
    ? number
    : TAttribute extends TextAttributeDefinition
    ? string
    : never

export type AttributeState<
  TAttributeDefinitions extends UnknownAttributeDefinitions
> = {
  [Key in keyof TAttributeDefinitions]: AttributeValue<
    TAttributeDefinitions[Key]
  >
}

export type AttributeGroupDefinitions<
  TAttributeDefinitions extends UnknownAttributeDefinitions
> = Readonly<Record<string, ReadonlyArray<keyof TAttributeDefinitions>>>

export function mapToAttributeDefinitions<
  TKeys extends ReadonlyArray<string>,
  TAttributeDefinition extends UnknownAttributeDefinition,
  TTransformedKey extends string = TKeys[number]
>(
  keys: TKeys,
  definition:
    | TAttributeDefinition
    | ((key: TKeys[number]) => TAttributeDefinition),
  transformKey: (key: TKeys[number]) => TTransformedKey = (key) =>
    key as TTransformedKey
) {
  return keys.reduce<Record<TTransformedKey, TAttributeDefinition>>(
    (defs, key) => {
      defs[transformKey(key)] =
        typeof definition === 'function' ? definition(key) : definition
      return defs
    },
    {} as Record<TTransformedKey, TAttributeDefinition>
  )
}
