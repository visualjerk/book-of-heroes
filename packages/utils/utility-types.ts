// Inspired by this proposal:
// https://github.com/microsoft/TypeScript/issues/13923#issuecomment-716706151
export type DeepReadonly<T> = T extends ReadonlyPrimitive
  ? T
  : DeepReadonlyObject<T>

type ReadonlyPrimitive = undefined | null | boolean | string | number | Function

export type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}
