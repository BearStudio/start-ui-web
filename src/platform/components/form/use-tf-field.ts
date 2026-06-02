import { useFieldContext } from '@/platform/components/form/use-app-form-contexts';

/**
 * Adapter that exposes a TanStack Form field under the shape the existing
 * shadcn-style field components already consume (RHF-ish `field` + a small
 * `fieldState`).
 *
 * Keeping this helper isolated means each field component (`FieldText`,
 * `FieldOTP`, etc.) only changes its hook call — its render body stays
 * largely identical. The shape is intentionally narrow: only the props those
 * components touch.
 */
export type TfFieldAdapter<TValue> = {
  field: {
    name: string;
    value: TValue | undefined;
    onChange: (value: TValue) => void;
    onBlur: () => void;
  };
  fieldState: {
    invalid: boolean;
    errors: unknown[];
  };
  formState: {
    isSubmitted: boolean;
  };
};

export const useTfField = <TValue>(): TfFieldAdapter<TValue> => {
  const tf = useFieldContext<TValue>();
  const errors = tf.state.meta.errors as unknown[];
  const invalid = errors.length > 0 && tf.state.meta.isTouched;

  return {
    field: {
      name: tf.name,
      value: tf.state.value,
      onChange: (value: TValue) => tf.handleChange(value),
      onBlur: () => tf.handleBlur(),
    },
    fieldState: { invalid, errors },
    formState: { isSubmitted: tf.form.state.isSubmitted },
  };
};
