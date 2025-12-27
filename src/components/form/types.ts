export type FormFieldSize = 'sm' | 'default' | 'lg';

export type FieldProps<TProps extends object> = Omit<
  TProps,
  'value' | 'ref' | 'id' | 'aria-invalid' | 'aria-describedby'
>;
