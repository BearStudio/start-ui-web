declare module '@formiz/core' {
  export * from '@formiz/core/dist';

  import {
    UseFieldProps,
    UseFieldValues,
  } from '@formiz/core/dist/types/field.types';

  // Override FieldProps type with generic param for define value type
  export declare type FieldProps<Value = ExplicitAny> = Omit<
    UseFieldProps,
    'defaultValue' | 'onChange' | 'formatValue'
  > & {
    defaultValue?: Value;
    onChange?: (value: Value, rawValue?: Value) => void;
    formatValue?: (value: Value) => unknown;
  };

  // Override useField type for value and otherProps type inferred by props
  export declare const useField: <
    Props extends FieldProps = FieldProps,
    Value = Required<Props>['defaultValue'] | null
  >(
    props: Props
  ) => Omit<UseFieldValues, 'otherProps' | 'value' | 'setValue'> & {
    otherProps: Omit<Props, keyof FieldProps>;
    value: Value;
    setValue: React.Dispatch<React.SetStateAction<Value>>;
  };

  import {
    FormValues,
    UseFormProps,
    UseFormValues,
  } from '@formiz/core/dist/types/form.types';

  // Override Form type with generic param for values type
  export declare type Form<T = FormValues> = Omit<UseFormValues, 'values'> & {
    values: T;
  };

  // Override useForm type with generic param for type returned form
  export declare const useForm: <T = FormValues>({
    subscribe,
  }?: UseFormProps) => Form<T>;
}
