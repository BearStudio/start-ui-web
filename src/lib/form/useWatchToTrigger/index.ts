import { useEffect } from 'react';

import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * Use this hook to subscribe to fields and listen for changes to revalidate the
 * form.
 *
 * Using the form "onBlur" validation will validate the field you just updated.
 * But imagine a field that has to validate itself based on an another field update.
 * That's the point of this hook.
 *
 * Example: imagine those fields: `min`, `default`, `max`. The `min` should be
 * lower than the `default` and the `default` should lower than the `max`.
 * `min` is equal to 2, `default` is equal to 4 and `max` is equal to 6.
 * You update the `min` so the value is 5, the form (using superRefine and
 * custom issues) will tell you that the `min` should be lower than the default.
 * You update the `default` so the new value is 5.5. Without this hook, the
 * field `min` will not revalidate. With this hook, if you give the field name,
 * it will.
 *
 * @example
 * // Get the form
 * const form = useFormContext<FormType>();
 *
 * // Subscribe to fields validation
 * // If `default` changes, `min`, `default` and `max` will validate and trigger
 * // error if any.
 * useWatchToTrigger({ form, names: ['min', 'default', 'max']})
 */
export const useWatchToTrigger = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(params: {
  form: Pick<UseFormReturn<TFieldValues>, 'watch' | 'trigger'>;
  names: Array<TName>;
}) => {
  const { watch, trigger } = params.form;
  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name && params.names.includes(name as TName)) {
        trigger(params.names);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger, params.names]);
};
