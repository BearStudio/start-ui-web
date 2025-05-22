import { z as zod } from 'zod/v4';

/** Import default methods from zod */
const { string, array, email, ...rest } = zod;

type NonEmptyValidatorParams = string | zod.core.$ZodCheckMinLengthParams;

const emptyAsNullString = () => {
  return zod.literal('').transform(() => null);
};

const emptyAsNullArray =
  <T extends zod.core.$ZodType>(a: zod.ZodArray<T>) =>
  () => {
    return a.length(0).transform(() => null);
  };

/**
 * We augment the existing zod API with new custom validations
 */
export const z = {
  ...rest,
  string: (params?: string | zod.core.$ZodStringParams) => {
    const base = string(params);
    const stringNonEmpty = base.trim().nonempty;
    return Object.assign(base, {
      emptyAsNull: emptyAsNullString,
      nonEmpty: (params?: NonEmptyValidatorParams) => {
        return stringNonEmpty(params);
      },
      nonEmptyNullable: (params?: NonEmptyValidatorParams) => {
        return emptyAsNullString().or(stringNonEmpty(params).nullable());
      },
      nonEmptyNullish: (params?: NonEmptyValidatorParams) => {
        return emptyAsNullString().or(stringNonEmpty(params).nullish());
      },
    });
  },
  email: (params?: string | zod.core.$ZodEmailParams) => {
    const base = email(params);
    const emailNonEmpty = email(params).toLowerCase().trim().nonempty;
    return Object.assign(base, {
      emptyAsNull: emptyAsNullString,
      strict: (params?: NonEmptyValidatorParams) => {
        return emailNonEmpty(params);
      },
      strictNullable: (params?: NonEmptyValidatorParams) => {
        return emptyAsNullString().or(emailNonEmpty(params).nullable());
      },
      strictNullish: (params?: NonEmptyValidatorParams) => {
        return emptyAsNullString().or(emailNonEmpty(params).nullish());
      },
    });
  },
  array: <T extends zod.core.$ZodType>(
    element: T,
    params?: string | zod.core.$ZodArrayParams
  ) => {
    const base = array(element, params);
    const emptyAsNull = emptyAsNullArray(base);
    const arrayNonEmpty = base.nonempty;
    return Object.assign(base, {
      emptyAsNull,
      nonEmptyNullable: (params?: NonEmptyValidatorParams) => {
        return emptyAsNull().or(arrayNonEmpty(params).nullable());
      },
      nonEmptyNullish: (params?: NonEmptyValidatorParams) => {
        return emptyAsNull().or(arrayNonEmpty(params).nullish());
      },
    });
  },
};
