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
 * Use this type to overwrite the keys of the first type with the second one.
 * This is mainly useful with custom props type that extends multiple components
 * with the `as` props.
 */
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

/**
 * Api Error Response
 */
type ApiErrorResponse = {
  title?: string;
  errorKey?: string;
};
