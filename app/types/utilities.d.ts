/* eslint-disable sonarjs/redundant-type-aliases */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Use this type to temporary bypass to `any` without writting `any`
 * Comment the line to find where it's used
 */
type TODO = any;

/**
 * Use this type to use an explicit `any`
 */
type ExplicitAny = any;

/**
 * Use this type to remove keys from T that are in U type.
 */
type RemoveFromType<T, U> = Pick<T, Exclude<keyof T, keyof U>>;

/**
 * Use this type to overwrite the keys of the first type with the second one.
 * This is mainly useful with custom props type that extends multiple components
 * with the `as` props.
 */
type Overwrite<T, U> = RemoveFromType<T, U> & U;

type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends ExplicitAny
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>>
  : never;
type StrictUnion<T> = StrictUnionHelper<T, T>;

type OnlyFirst<F, S> = F & { [Key in keyof Omit<S, keyof F>]?: never };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type MergeTypes<TypesArray extends any[], Res = {}> = TypesArray extends [
  infer Head,
  ...infer Rem,
]
  ? MergeTypes<Rem, Res & Head>
  : Res;

/**
 * Build typesafe discriminated unions from an array of types
 */
type OneOf<
  TypesArray extends any[],
  Res = never,
  AllProperties = MergeTypes<TypesArray>,
> = TypesArray extends [infer Head, ...infer Rem]
  ? OneOf<Rem, Res | OnlyFirst<Head, AllProperties>, AllProperties>
  : Res;

/**
 * Clean up type for better DX
 */
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
